#!/usr/bin/env python3
"""
run_cycle.py — Run one Crucible agent pass (one cycle) via the claude CLI.

Usage:
  python scripts/run_cycle.py --cycle 001 --mode strawman --doc docs/active/design-doc.md
  python scripts/run_cycle.py --cycle 002 --mode steelman --doc docs/active/design-doc.md --rounds 3
"""

import argparse
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

parser = argparse.ArgumentParser(description="Run one Crucible agent pass.")
parser.add_argument("--cycle", required=True, help="Cycle number, e.g. 001")
parser.add_argument(
    "--mode",
    required=True,
    choices=["strawman", "steelman", "adversarial"],
    help="Agent mode",
)
parser.add_argument("--doc", required=True, help="Path to the document to review")
parser.add_argument(
    "--rounds", type=int, default=None, help="Total number of rounds (display only)"
)
args = parser.parse_args()

# ---------------------------------------------------------------------------
# Resolve paths (relative to repo root, not cwd)
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent

doc_path = Path(args.doc)
if not doc_path.is_absolute():
    doc_path = REPO_ROOT / doc_path
doc_path = doc_path.resolve()

if not doc_path.exists():
    print(f"error: document not found: {doc_path}", file=sys.stderr)
    sys.exit(1)

agent_path = REPO_ROOT / "agents" / f"{args.mode}.md"
if not agent_path.exists():
    print(f"error: agent definition not found: {agent_path}", file=sys.stderr)
    sys.exit(1)

concepts_csv = REPO_ROOT / "concepts" / "registry" / "concepts.csv"
cycle_dir = REPO_ROOT / "reviews" / "cycles" / f"cycle-{args.cycle}"

# ---------------------------------------------------------------------------
# Step 1: Scaffold the cycle directory (idempotent)
# ---------------------------------------------------------------------------

if cycle_dir.exists():
    print(f"cycle dir already exists, skipping scaffold: {cycle_dir}")
else:
    cycle_dir.mkdir(parents=True, exist_ok=True)

    (cycle_dir / "rationale.md").write_text(
        f"""# Rationale — Cycle {args.cycle} — {args.mode}

Created: {datetime.now(timezone.utc).isoformat()}
Document: `{args.doc}`

## Summary

TBD

## Changes Made

- TBD

## Why These Changes Matter

- TBD

## Recommended Next Pass

TBD
""",
        encoding="utf-8",
    )

    (cycle_dir / "concept_delta.yaml").write_text(
        f"""cycle: "{args.cycle}"
mode: {args.mode}
agent: {args.mode}
document: {args.doc}

concepts_added: []
concepts_modified: []
concepts_removed: []
concepts_resurrected: []

dead_ends_identified: []
walls_identified: []

stance:
  supports: []
  challenges: []
  neutral: []

rationale: []

next_recommended_mode: null
confidence: null
""",
        encoding="utf-8",
    )

    print(f"created {cycle_dir.relative_to(REPO_ROOT)}")

# ---------------------------------------------------------------------------
# Step 2: Read source material
# ---------------------------------------------------------------------------

agent_content = agent_path.read_text(encoding="utf-8")
doc_content = doc_path.read_text(encoding="utf-8")

# Concepts CSV — header + up to 50 data rows
if concepts_csv.exists():
    csv_lines = concepts_csv.read_text(encoding="utf-8").splitlines()
    concepts_content = "\n".join(csv_lines[:51])  # header + 50 rows
else:
    concepts_content = "concept_id,name,status,first_seen_cycle,last_seen_cycle,description\n(empty)"

# Detect issue number from doc frontmatter
issue_number: str | None = None
frontmatter_match = re.search(r"^issue:\s*(\d+)", doc_content, re.MULTILINE)
if frontmatter_match:
    issue_number = frontmatter_match.group(1)

# Doc path as stored in the repo (relative or as provided)
doc_display = args.doc

# ---------------------------------------------------------------------------
# Step 3: Build the prompt
# ---------------------------------------------------------------------------

rounds_note = f" (round {args.cycle} of {args.rounds})" if args.rounds else ""

prompt = f"""# Crucible Agent Pass — Cycle {args.cycle} — {args.mode.upper()}{rounds_note}

## Your Role

{agent_content}

## The Document (current state)

Path: {doc_display}

{doc_content}

## Existing Concept Registry

{concepts_content}

## Your Task

Perform your review pass. You MUST:

1. Edit the document at `{doc_display}` in place — make your changes directly.

2. Fill in `reviews/cycles/cycle-{args.cycle}/rationale.md` — replace the TBD sections with:
   - Summary: 2-4 sentences on what you changed and why
   - Changes Made: bullet list of specific edits
   - Why These Changes Matter: reasoning from your agent stance
   - Recommended Next Pass: strawman | steelman | adversarial | done

3. Update `reviews/cycles/cycle-{args.cycle}/concept_delta.yaml`:
   - concepts_added: list of {{id, name, description}}
   - concepts_modified: list of {{id, change}}
   - concepts_removed: list of {{id, reason}}
   - next_recommended_mode: strawman | steelman | adversarial | null
   - confidence: 0.0–1.0

4. Update `concepts/registry/concepts.csv` — append any new concepts (do not duplicate existing rows). Columns: concept_id,name,status,first_seen_cycle,last_seen_cycle,description

5. Update `concepts/registry/edges.csv` if you identify relationships between concepts. Columns: source_concept_id,target_concept_id,edge_type,cycle,rationale
   edge_type values: support | contradict | mutation | lineage

Do NOT create new files. Do NOT modify any file not listed above.
When done, output a single line: CYCLE_COMPLETE
"""

# ---------------------------------------------------------------------------
# Step 4: Write temporary prompt file
# ---------------------------------------------------------------------------

tmp_prompt = Path(f"/tmp/crucible-cycle-{args.cycle}-{args.mode}.md")
tmp_prompt.write_text(prompt, encoding="utf-8")
print(f"prompt written to {tmp_prompt}")

# ---------------------------------------------------------------------------
# Step 5: Invoke Claude CLI
# ---------------------------------------------------------------------------

claude_cmd = ["claude", "--dangerously-skip-permissions", "-p", prompt]

print(f"\n--- invoking claude (cycle {args.cycle}, {args.mode}) ---\n")

try:
    result = subprocess.run(
        claude_cmd,
        cwd=str(REPO_ROOT),
        check=False,
    )
except FileNotFoundError:
    print(
        "error: 'claude' CLI not found. Is it installed and on your PATH?",
        file=sys.stderr,
    )
    sys.exit(1)

if result.returncode != 0:
    print(
        f"\nerror: claude exited with code {result.returncode}",
        file=sys.stderr,
    )
    sys.exit(result.returncode)

print("\n--- claude finished ---\n")

# ---------------------------------------------------------------------------
# Step 6: Git commit
# ---------------------------------------------------------------------------

git_add_cmd = [
    "git",
    "add",
    str(doc_path.relative_to(REPO_ROOT)),
    f"reviews/cycles/cycle-{args.cycle}/",
    "concepts/registry/",
]

ref_line = f"\nRef #{issue_number}" if issue_number else ""
commit_message = (
    f"cycle({args.cycle}/{args.mode}): {args.mode} pass"
    f"{ref_line}"
    f"\n\nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
)

try:
    subprocess.run(git_add_cmd, cwd=str(REPO_ROOT), check=True)
    subprocess.run(
        ["git", "commit", "-m", commit_message],
        cwd=str(REPO_ROOT),
        check=True,
    )
except subprocess.CalledProcessError as e:
    print(f"error: git operation failed: {e}", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Step 7: Print summary
# ---------------------------------------------------------------------------

try:
    sha_result = subprocess.run(
        ["git", "rev-parse", "--short", "HEAD"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        check=True,
    )
    short_sha = sha_result.stdout.strip()
except subprocess.CalledProcessError:
    short_sha = "unknown"

print(f"✓ cycle {args.cycle} ({args.mode}) committed as {short_sha}")
