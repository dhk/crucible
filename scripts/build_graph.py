import csv
import json
from pathlib import Path

root = Path("concepts/registry")
out = Path("concepts/lineage/graph.json")
out.parent.mkdir(parents=True, exist_ok=True)

nodes = []
edges = []

concepts = root / "concepts.csv"
if concepts.exists():
    with concepts.open() as f:
        for row in csv.DictReader(f):
            nodes.append({
                "id": row["concept_id"],
                "label": row["name"],
                "type": "Concept",
                "status": row["status"],
                "first_seen_cycle": row["first_seen_cycle"],
                "last_seen_cycle": row["last_seen_cycle"],
            })

edge_file = root / "edges.csv"
if edge_file.exists():
    with edge_file.open() as f:
        for row in csv.DictReader(f):
            if row.get("source_concept_id") and row.get("target_concept_id"):
                edges.append({
                    "source": row["source_concept_id"],
                    "target": row["target_concept_id"],
                    "type": row["edge_type"],
                    "cycle": row["cycle"],
                    "rationale": row["rationale"],
                })

out.write_text(json.dumps({"nodes": nodes, "edges": edges}, indent=2))
print(out)
