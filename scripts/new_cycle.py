import argparse
from pathlib import Path
from datetime import datetime, timezone

parser = argparse.ArgumentParser()
parser.add_argument("--cycle", required=True)
parser.add_argument("--mode", required=True, choices=["strawman", "steelman", "adversarial"])
parser.add_argument("--doc", required=True)
args = parser.parse_args()

cycle_dir = Path("reviews/cycles") / f"cycle-{args.cycle}"
cycle_dir.mkdir(parents=True, exist_ok=True)

(cycle_dir / "rationale.md").write_text(f"""# Rationale — Cycle {args.cycle} — {args.mode}

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
""")

(cycle_dir / "concept_delta.yaml").write_text(f"""cycle: "{args.cycle}"
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
""")

print(f"created {cycle_dir}")
