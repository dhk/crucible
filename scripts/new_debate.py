#!/usr/bin/env python3
"""Initialise a new Crucible debate from a GitHub issue.

Usage:
    python scripts/new_debate.py --issue <url-or-number>
    python scripts/new_debate.py --issue 42 --doc docs/active/my-topic.md
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def run(cmd, check=True, capture=True):
    """Run a shell command, returning CompletedProcess."""
    return subprocess.run(
        cmd,
        check=check,
        capture_output=capture,
        text=True,
    )


def slugify(title: str, max_len: int = 40) -> str:
    """Convert a title to a URL-safe slug, max_len chars."""
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    # Trim to max_len without cutting in the middle of a word if possible
    if len(slug) > max_len:
        slug = slug[:max_len].rstrip("-")
    return slug


def fetch_issue(issue_ref: str) -> dict:
    """Fetch issue title, body, and number via gh CLI."""
    # Accept a full URL or a bare number/owner/repo#number
    result = run(
        ["gh", "issue", "view", issue_ref, "--json", "title,body,number"],
        check=False,
    )
    if result.returncode != 0:
        stderr = result.stderr.strip()
        print(f"error: could not fetch issue '{issue_ref}': {stderr}", file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


def ensure_branch(branch: str) -> None:
    """Create and check out branch, aborting cleanly if it already exists."""
    result = run(["git", "checkout", "-b", branch], check=False)
    if result.returncode != 0:
        stderr = result.stderr.strip()
        if "already exists" in stderr:
            print(
                f"error: branch '{branch}' already exists. "
                "Switch to it manually or delete it first.",
                file=sys.stderr,
            )
        else:
            print(f"error: git checkout -b failed: {stderr}", file=sys.stderr)
        sys.exit(1)


def run_make_init() -> None:
    """Run `make init` to ensure registry CSVs exist (idempotent)."""
    result = run(["make", "init"], check=False, capture=False)
    if result.returncode != 0:
        print("error: 'make init' failed.", file=sys.stderr)
        sys.exit(1)


def build_seed_doc(slug: str, number: int, title: str, body: str) -> str:
    return f"""---
document_id: {slug}
issue: {number}
status: seed
created_by: human
crucible_state: seed
fossil_export: true
---

# {title}

{body}

## Decision Record

| Date | Decision | Rationale |
|---|---|---|
| TBD | TBD | TBD |
"""


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Initialise a new Crucible debate from a GitHub issue."
    )
    parser.add_argument(
        "--issue",
        required=True,
        metavar="URL_OR_NUMBER",
        help="GitHub issue URL or number (e.g. 42 or https://github.com/owner/repo/issues/42)",
    )
    parser.add_argument(
        "--doc",
        metavar="PATH",
        help="Destination doc path (default: docs/active/<slug>.md)",
    )
    args = parser.parse_args()

    # 1. Fetch issue metadata
    issue = fetch_issue(args.issue)
    number: int = issue["number"]
    title: str = issue["title"]
    body: str = issue.get("body") or ""

    # 2. Derive slug
    slug = slugify(title)
    if not slug:
        print("error: could not derive a slug from the issue title.", file=sys.stderr)
        sys.exit(1)

    # 3. Resolve doc path
    doc_path = Path(args.doc) if args.doc else Path("docs/active") / f"{slug}.md"

    # 4. Create and check out branch
    branch = f"debate/{number}-{slug}"
    ensure_branch(branch)

    # 5. Run make init (idempotent)
    run_make_init()

    # 6. Write seed document
    doc_path.parent.mkdir(parents=True, exist_ok=True)
    if doc_path.exists():
        print(
            f"error: document '{doc_path}' already exists. Remove it or specify a different --doc path.",
            file=sys.stderr,
        )
        sys.exit(1)
    doc_path.write_text(build_seed_doc(slug, number, title, body))

    # 7. Commit
    run(["git", "add", str(doc_path)])
    commit_msg = (
        f"debate({slug}): seed document from issue #{number}\n\n"
        f"Ref #{number}\n\n"
        "Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
    )
    run(["git", "commit", "-m", commit_msg])

    # 8. Report success
    print(f"doc:    {doc_path}")
    print(f"branch: {branch}")


if __name__ == "__main__":
    main()
