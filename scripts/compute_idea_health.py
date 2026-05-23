import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

root = Path("concepts/registry")
out = Path("concepts/lineage/idea_health.json")
out.parent.mkdir(parents=True, exist_ok=True)

health = defaultdict(lambda: {
    "mutations": 0,
    "dead_end_count": 0,
    "wall_count": 0,
    "score": 0,
})

mutations = root / "mutations.csv"
if mutations.exists():
    with mutations.open() as f:
        for row in csv.DictReader(f):
            if row.get("concept_id"):
                health[row["concept_id"]]["mutations"] += 1

dead_ends = root / "dead_ends.csv"
if dead_ends.exists():
    with dead_ends.open() as f:
        for row in csv.DictReader(f):
            if row.get("concept_id"):
                health[row["concept_id"]]["dead_end_count"] += 1

walls = root / "walls.csv"
if walls.exists():
    with walls.open() as f:
        for row in csv.DictReader(f):
            if row.get("concept_id"):
                health[row["concept_id"]]["wall_count"] += 1

for concept_id, stats in health.items():
    stats["score"] = stats["mutations"] - (2 * stats["dead_end_count"]) - stats["wall_count"]

out.write_text(json.dumps(health, indent=2))
print(out)
