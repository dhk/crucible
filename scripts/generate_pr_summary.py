import argparse
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument("--cycle", required=True)
parser.add_argument("--mode", required=True)
args = parser.parse_args()

cycle_dir = Path("reviews/cycles") / f"cycle-{args.cycle}"
rationale = (cycle_dir / "rationale.md").read_text() if (cycle_dir / "rationale.md").exists() else ""
concept_delta = (cycle_dir / "concept_delta.yaml").read_text() if (cycle_dir / "concept_delta.yaml").exists() else ""

body = f"""# Crucible Review Pass

## Cycle

- Cycle: {args.cycle}
- Mode: {args.mode}

## Summary

This PR contains the `{args.mode}` pass for cycle `{args.cycle}`.

## Rationale

{rationale}

## Concept Delta

```yaml
{concept_delta}
```

## Recommended Next Step

Review the concept delta, confirm dead ends and walls, then run the next Crucible pass.
"""

out = cycle_dir / "pr_body.md"
out.write_text(body)
print(out)
