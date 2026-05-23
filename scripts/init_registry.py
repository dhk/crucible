from pathlib import Path

REGISTRIES = {
    "concepts.csv": "concept_id,name,status,first_seen_cycle,last_seen_cycle,description\n",
    "edges.csv": "source_concept_id,target_concept_id,edge_type,cycle,rationale\n",
    "mutations.csv": "cycle,mode,concept_id,mutation_type,rationale,commit_sha\n",
    "dead_ends.csv": "cycle,concept_id,reason,status\n",
    "walls.csv": "cycle,concept_id,resistant_population,resistance_type,evidence,status\n",
}

root = Path("concepts/registry")
root.mkdir(parents=True, exist_ok=True)
for name, header in REGISTRIES.items():
    path = root / name
    if not path.exists():
        path.write_text(header)
        print(f"created {path}")
    else:
        print(f"exists {path}")
