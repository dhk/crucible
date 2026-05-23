import argparse
import csv
import re
from pathlib import Path

parser = argparse.ArgumentParser(description="Naive concept extractor. Replace with LLM-assisted extraction later.")
parser.add_argument("--cycle", required=True)
parser.add_argument("--mode", required=True)
parser.add_argument("--doc", required=True)
args = parser.parse_args()

text = Path(args.doc).read_text(errors="ignore")
terms = sorted(set(re.findall(r"\b[A-Z][A-Za-z0-9_-]{5,}\b|`([^`]+)`", text)))
terms = [t if isinstance(t, str) else t[0] for t in terms]
terms = [t.strip("`") for t in terms if t]

registry = Path("concepts/registry/concepts.csv")
existing = set()
if registry.exists():
    with registry.open() as f:
        for row in csv.DictReader(f):
            existing.add(row["name"])

with registry.open("a", newline="") as f:
    writer = csv.writer(f)
    for term in terms:
        if term not in existing:
            concept_id = re.sub(r"[^a-z0-9]+", "-", term.lower()).strip("-")
            writer.writerow([concept_id, term, "emergent", args.cycle, args.cycle, "extracted candidate concept"])
            print(f"added concept: {term}")
