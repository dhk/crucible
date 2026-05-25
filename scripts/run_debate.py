"""run_debate.py — orchestrate N rounds of strawman → steelman → adversarial.

Usage:
    python scripts/run_debate.py --doc docs/active/foo.md --rounds 3
    python scripts/run_debate.py --doc docs/active/foo.md --rounds 3 --start-cycle 007
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def detect_next_cycle(cycles_dir: Path) -> int:
    """Scan cycles_dir for cycle-NNN dirs and return the next available int."""
    if not cycles_dir.exists():
        return 1
    used = []
    for p in cycles_dir.iterdir():
        m = re.fullmatch(r"cycle-(\d+)", p.name)
        if m:
            used.append(int(m.group(1)))
    return (max(used) + 1) if used else 1


def format_cycle(n: int) -> str:
    return f"{n:03d}"


def parse_issue_from_frontmatter(doc_path: Path) -> str | None:
    """Extract `issue:` field from YAML frontmatter, return as string or None."""
    try:
        text = doc_path.read_text()
    except OSError:
        return None
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return None
    for line in m.group(1).splitlines():
        fm = re.match(r"^issue\s*:\s*(.+)", line.strip())
        if fm:
            return fm.group(1).strip().lstrip("#")
    return None


def doc_slug(doc_path: Path) -> str:
    """Return a short slug from the doc filename (no extension)."""
    return doc_path.stem


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, **kwargs)


def ask_continue() -> bool:
    try:
        answer = input("Continue anyway? [y/N] ").strip().lower()
    except (EOFError, KeyboardInterrupt):
        return False
    return answer in ("y", "yes")


def get_current_branch() -> str:
    result = run(
        ["git", "branch", "--show-current"],
        capture_output=True, text=True,
        cwd=Path(__file__).parent.parent,
    )
    return result.stdout.strip()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Orchestrate N rounds of strawman → steelman → adversarial debate."
    )
    parser.add_argument("--doc", required=True, help="Path to the document being reviewed.")
    parser.add_argument("--rounds", type=int, default=3, help="Number of full rounds (default: 3).")
    parser.add_argument(
        "--start-cycle",
        dest="start_cycle",
        default=None,
        help="Starting cycle number (default: auto-detect from reviews/cycles/).",
    )
    args = parser.parse_args()

    repo_root = Path(__file__).parent.parent
    doc_path = Path(args.doc)
    cycles_dir = repo_root / "reviews" / "cycles"

    # Resolve start cycle
    if args.start_cycle is not None:
        cycle_counter = int(args.start_cycle)
    else:
        cycle_counter = detect_next_cycle(cycles_dir)

    first_cycle = cycle_counter
    modes = ["strawman", "steelman", "adversarial"]
    N = args.rounds

    print(f"\nDebate orchestrator starting.")
    print(f"  Document : {doc_path}")
    print(f"  Rounds   : {N}")
    print(f"  Modes    : {' → '.join(modes)} × {N}")
    print(f"  Cycles   : {format_cycle(first_cycle)} … {format_cycle(first_cycle + N * len(modes) - 1)}")

    # ------------------------------------------------------------------
    # Run rounds
    # ------------------------------------------------------------------
    for round_num in range(1, N + 1):
        for mode in modes:
            cycle_str = format_cycle(cycle_counter)
            print(f"\n=== Round {round_num}/{N} — {mode} (Cycle {cycle_str}) ===\n")

            cmd = [
                sys.executable,
                str(repo_root / "scripts" / "run_cycle.py"),
                "--cycle", cycle_str,
                "--mode", mode,
                "--doc", str(doc_path),
                "--rounds", str(N),
            ]
            result = run(cmd, cwd=repo_root)

            if result.returncode != 0:
                print(
                    f"\nERROR: run_cycle.py exited with code {result.returncode} "
                    f"(round {round_num}, mode {mode}, cycle {cycle_str})."
                )
                if not ask_continue():
                    print("Aborting debate.")
                    sys.exit(result.returncode)

            cycle_counter += 1

    last_cycle = cycle_counter - 1

    # ------------------------------------------------------------------
    # Build observatory.json
    # ------------------------------------------------------------------
    obs_out = repo_root / "visualizations" / "observatory.json"
    print(f"\n=== Building observatory.json ===\n")
    obs_cmd = [
        sys.executable,
        str(repo_root / "scripts" / "build_observatory.py"),
        "--doc", str(doc_path),
        "--out", str(obs_out),
    ]
    obs_result = run(obs_cmd, cwd=repo_root)
    if obs_result.returncode != 0:
        print(f"WARNING: build_observatory.py exited with code {obs_result.returncode}.")
    else:
        print(f"Observatory written to: {obs_out}")

    # ------------------------------------------------------------------
    # Open PR
    # ------------------------------------------------------------------
    issue_num = parse_issue_from_frontmatter(doc_path if doc_path.is_absolute() else repo_root / doc_path)
    branch = get_current_branch()
    slug = doc_slug(doc_path)

    closes_line = f"Closes #{issue_num}\n\n" if issue_num else ""
    pr_body = (
        f"{closes_line}"
        f"## Debate summary\n\n"
        f"- Document: `{doc_path}`\n"
        f"- Rounds: {N}\n"
        f"- Cycles: {format_cycle(first_cycle)}..{format_cycle(last_cycle)}\n"
        f"- Modes: strawman → steelman → adversarial × {N}\n\n"
        f"Observatory.json built. View in the Observatory UI.\n\n"
        f"🤖 Generated with [Claude Code](https://claude.com/claude-code)"
    )
    pr_title = f"debate({slug}): {N}-round review"

    print(f"\n=== Opening PR ===\n")
    pr_cmd = [
        "gh", "pr", "create",
        "--title", pr_title,
        "--body", pr_body,
        "--head", branch,
        "--base", "main",
    ]
    pr_result = run(pr_cmd, capture_output=True, text=True, cwd=repo_root)

    pr_url = pr_result.stdout.strip()
    if pr_result.returncode != 0:
        print(f"WARNING: gh pr create failed (code {pr_result.returncode}).")
        print(pr_result.stderr.strip())
        pr_url = "(PR creation failed)"
    else:
        print(f"PR created: {pr_url}")

    # ------------------------------------------------------------------
    # Final summary
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    print("Debate complete.")
    print(f"  Cycles run : {format_cycle(first_cycle)} → {format_cycle(last_cycle)}")
    print(f"  Document   : {doc_path}")
    print(f"  PR         : {pr_url}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
