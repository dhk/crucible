import csv
from pathlib import Path

required = {
    "concepts.csv": ["concept_id", "name", "status", "first_seen_cycle", "last_seen_cycle", "description"],
    "edges.csv": ["source_concept_id", "target_concept_id", "edge_type", "cycle", "rationale"],
    "mutations.csv": ["cycle", "mode", "concept_id", "mutation_type", "rationale", "commit_sha"],
    "dead_ends.csv": ["cycle", "concept_id", "reason", "status"],
    "walls.csv": ["cycle", "concept_id", "resistant_population", "resistance_type", "evidence", "status"],
}

root = Path("concepts/registry")
errors = []
for filename, headers in required.items():
    path = root / filename
    if not path.exists():
        errors.append(f"missing {path}")
        continue
    with path.open() as f:
        reader = csv.reader(f)
        actual = next(reader, [])
    if actual != headers:
        errors.append(f"bad header for {path}: {actual}")

if errors:
    for err in errors:
        print(err)
    raise SystemExit(1)
print("registry validation passed")
