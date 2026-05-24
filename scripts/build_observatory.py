#!/usr/bin/env python3
"""
build_observatory.py — Generate visualizations/observatory.json from the Crucible registry.

Usage:
    python3 scripts/build_observatory.py [--doc docs/active/design-doc.md] [--out visualizations/observatory.json]

Reads:
    concepts/registry/concepts.csv
    concepts/registry/edges.csv
    concepts/registry/mutations.csv
    concepts/registry/dead_ends.csv
    concepts/registry/walls.csv          (islands — legacy filename)
    reviews/cycles/*/concept-delta.yaml  (if present)

Emits:
    visualizations/observatory.json

The UI loads this file via fetch(). If the file is absent, the UI falls back
to data.js mock data (useful during development before any cycles have run).
"""

import argparse
import csv
import json
import math
import re
from collections import defaultdict
from datetime import date
from pathlib import Path


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args():
    p = argparse.ArgumentParser(description="Build observatory.json from Crucible registry")
    p.add_argument("--doc", default="docs/active/design-doc.md",
                   help="Path to the document under debate")
    p.add_argument("--out", default="visualizations/observatory.json",
                   help="Output path for observatory.json")
    p.add_argument("--root", default=".",
                   help="Repository root (default: current directory)")
    return p.parse_args()


# ---------------------------------------------------------------------------
# Registry readers
# ---------------------------------------------------------------------------

def read_concepts(registry: Path) -> list[dict]:
    """Read concepts.csv → list of concept dicts."""
    path = registry / "concepts.csv"
    if not path.exists():
        return []
    rows = []
    with path.open() as f:
        for row in csv.DictReader(f):
            if not row.get("concept_id"):
                continue
            rows.append({
                "id":          row["concept_id"],
                "name":        row.get("name", row["concept_id"]),
                "state":       _map_status(row.get("status", "seed")),
                "agent":       row.get("agent", "strawman"),
                "originCycle": _int(row.get("first_seen_cycle", 1)),
                "group":       row.get("group", "core"),
                "desc":        row.get("description", ""),
                "adoption":    _float(row.get("adoption", 0.5)),
                # x/y are layout hints; set to 0,0 — the UI uses pre-baked
                # positions from data.js for the force graph. The tree view
                # computes its own layout from edges, so these are unused there.
                "x": _float(row.get("x", 0)),
                "y": _float(row.get("y", 0)),
            })
    return rows


def read_edges(registry: Path) -> list[dict]:
    """Read edges.csv → list of edge dicts."""
    path = registry / "edges.csv"
    if not path.exists():
        return []
    rows = []
    with path.open() as f:
        for i, row in enumerate(csv.DictReader(f)):
            src = row.get("source_concept_id", "")
            tgt = row.get("target_concept_id", "")
            if not src or not tgt:
                continue
            rows.append({
                "from":      src,
                "to":        tgt,
                "type":      _map_edge_type(row.get("edge_type", "support")),
                "cycle":     _int(row.get("cycle", 1)),
                "rationale": row.get("rationale", ""),
            })
    return rows


def read_mutations(registry: Path) -> list[dict]:
    """Read mutations.csv → list of mutation records."""
    path = registry / "mutations.csv"
    if not path.exists():
        return []
    rows = []
    with path.open() as f:
        for row in csv.DictReader(f):
            if not row.get("concept_id"):
                continue
            rows.append({
                "conceptId":   row["concept_id"],
                "cycle":       _int(row.get("cycle", 1)),
                "mutationType": row.get("mutation_type", ""),
                "rationale":   row.get("rationale", ""),
                "commit":      row.get("commit_sha", ""),
            })
    return rows


def read_dead_ends(registry: Path) -> list[dict]:
    """Read dead_ends.csv → list of dead-end records."""
    path = registry / "dead_ends.csv"
    if not path.exists():
        return []
    rows = []
    with path.open() as f:
        for i, row in enumerate(csv.DictReader(f)):
            cid = row.get("concept_id", "")
            if not cid:
                continue
            rows.append({
                "id":    f"D{i+1}",
                "name":  cid,   # enriched below when we have concept names
                "cycle": _int(row.get("cycle", 1)),
                "agent": row.get("agent", "adversarial"),
                "reason": row.get("reason", ""),
            })
    return rows


def read_islands(registry: Path) -> list[dict]:
    """Read walls.csv (legacy name for islands) → list of island records."""
    # Try the renamed file first, then fall back to legacy name
    for filename in ("islands.csv", "walls.csv"):
        path = registry / filename
        if not path.exists():
            continue
        rows = []
        with path.open() as f:
            for i, row in enumerate(csv.DictReader(f)):
                cid = row.get("concept_id", "")
                if not cid:
                    continue
                rows.append({
                    "id":       f"I{i+1}",
                    "name":     row.get("resistance_type", cid),
                    "stratum":  i,
                    "severity": _float(row.get("severity", 0.5)),
                    "cycles":   _parse_int_list(row.get("cycles", str(row.get("cycle", "1")))),
                    "desc":     row.get("evidence", row.get("resistant_population", "")),
                })
        return rows
    return []


# ---------------------------------------------------------------------------
# Cycle artifact reader
# ---------------------------------------------------------------------------

def read_cycles(root: Path, mutations: list[dict]) -> list[dict]:
    """
    Scan reviews/cycles/* for cycle artifacts.
    Directory naming convention: CYC-NNN-<agent>/ or <NNN>-<agent>/
    Falls back to deriving cycles from mutations.csv if no directories exist.
    """
    cycles_dir = root / "reviews" / "cycles"
    cycles = []

    if cycles_dir.exists():
        for d in sorted(cycles_dir.iterdir()):
            if not d.is_dir():
                continue
            meta = _parse_cycle_dir(d)
            if not meta:
                continue

            # Try to read concept-delta.yaml
            delta = _read_concept_delta(d)
            # Try to read rationale.md
            rationale_text = _read_rationale(d)
            # Try to read commit sha from pr-summary or git
            commit = _read_commit(d)

            cycles.append({
                "id":       meta["id"],
                "agent":    meta["agent"],
                "title":    meta.get("title", f"Cycle {meta['id']}"),
                "rationale": rationale_text,
                "added":    delta.get("added", []),
                "mutated":  delta.get("mutated", []),
                "removed":  delta.get("removed", []),
                "at":       meta.get("at", str(date.today())),
                "branch":   meta.get("branch", "main"),
                "commit":   commit,
            })

    if not cycles and mutations:
        # Derive sparse cycle list from mutation records
        by_cycle = defaultdict(list)
        for m in mutations:
            by_cycle[m["cycle"]].append(m)
        for cycle_id in sorted(by_cycle.keys()):
            ms = by_cycle[cycle_id]
            cycles.append({
                "id":       cycle_id,
                "agent":    ms[0].get("agent", "strawman"),
                "title":    f"Cycle {cycle_id:02d}",
                "rationale": "; ".join(m["rationale"] for m in ms if m["rationale"]),
                "added":    [],
                "mutated":  [m["conceptId"] for m in ms],
                "removed":  [],
                "at":       str(date.today()),
                "branch":   "main",
                "commit":   ms[0].get("commit", ""),
            })

    return cycles


# ---------------------------------------------------------------------------
# Branch derivation
# ---------------------------------------------------------------------------

def derive_branches(cycles: list[dict]) -> list[dict]:
    """Derive branch records from cycle branch fields."""
    branch_cycles = defaultdict(list)
    for c in cycles:
        branch_cycles[c.get("branch", "main")].append(c["id"])

    COLORS = {
        "main":        "#9ca3af",
        "metaphor-fork": "#5eead4",
        "risk-branch": "#fb7185",
    }
    DEFAULT_COLORS = ["#f59e0b", "#a78bfa", "#34d399", "#60a5fa"]
    color_idx = 0

    branches = []
    for branch_id, cids in sorted(branch_cycles.items()):
        color = COLORS.get(branch_id)
        if color is None:
            color = DEFAULT_COLORS[color_idx % len(DEFAULT_COLORS)]
            color_idx += 1
        branches.append({
            "id":     branch_id,
            "label":  branch_id,
            "parent": None if branch_id == "main" else "main",
            "color":  color,
            "cycles": sorted(cids),
            "status": "active" if branch_id == "main" else "open",
            "desc":   "",
        })

    if not branches:
        branches = [{"id": "main", "label": "main", "parent": None,
                     "color": "#9ca3af", "cycles": [], "status": "active", "desc": ""}]
    return branches


# ---------------------------------------------------------------------------
# Document metadata
# ---------------------------------------------------------------------------

def build_document(doc_path: Path, concepts: list, cycles: list,
                   branches: list, mutations: list, islands: list,
                   dead_ends: list) -> dict:
    title = doc_path.stem.replace("-", " ").replace("_", " ").title()
    if doc_path.exists():
        first_line = doc_path.read_text().splitlines()[0]
        if first_line.startswith("# "):
            title = first_line[2:].strip()

    # Convergence heuristic: ratio of adopted+dominant to total non-archived
    active = [c for c in concepts if c["state"] not in ("deprecated", "archived")]
    stable = [c for c in active if c["state"] in ("adopted", "dominant")]
    convergence = round(len(stable) / max(len(active), 1), 2)

    seeded_at = cycles[0]["at"] if cycles else str(date.today())
    last_cycle = cycles[-1]["at"] if cycles else str(date.today())

    return {
        "title":       title,
        "path":        str(doc_path),
        "status":      _convergence_status(convergence, cycles),
        "convergence": convergence,
        "cycles":      len(cycles),
        "branches":    len(branches),
        "mutations":   len(mutations),
        "concepts":    len(concepts),
        "islands":     len(islands),
        "deadEnds":    len(dead_ends),
        "seededAt":    seeded_at,
        "lastCycle":   last_cycle,
    }


# ---------------------------------------------------------------------------
# Layout helpers
# ---------------------------------------------------------------------------

def assign_positions(concepts: list[dict], edges: list[dict]) -> list[dict]:
    """
    Assign x/y positions for the force graph view.
    Uses a simple radial layout based on originCycle and concept index within cycle.
    The tree view ignores these and computes its own layout from edges.
    """
    if not concepts:
        return concepts

    by_cycle = defaultdict(list)
    for c in concepts:
        by_cycle[c["originCycle"]].append(c)

    max_cycle = max(by_cycle.keys()) if by_cycle else 1
    CX, CY = 500, 320   # canvas centre (matches 1000x640 viewBox)
    BASE_R = 120
    R_STEP = 80

    for cycle_id, group in by_cycle.items():
        r = BASE_R + (cycle_id - 1) * R_STEP
        n = len(group)
        for i, c in enumerate(group):
            if c["x"] == 0 and c["y"] == 0:
                angle = (2 * math.pi * i / max(n, 1)) + (cycle_id * 0.3)
                c["x"] = round(CX + r * math.cos(angle))
                c["y"] = round(CY + r * math.sin(angle))

    return concepts


# ---------------------------------------------------------------------------
# Enrich dead-end names from concept list
# ---------------------------------------------------------------------------

def enrich_dead_ends(dead_ends: list[dict], concepts: list[dict]) -> list[dict]:
    name_map = {c["id"]: c["name"] for c in concepts}
    for d in dead_ends:
        if d["name"] in name_map:
            d["name"] = name_map[d["name"]]
    return dead_ends


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

AGENT_ALIASES = {
    "s": "strawman", "st": "steelman", "a": "adversarial",
    "strawman": "strawman", "steelman": "steelman", "adversarial": "adversarial",
}

STATUS_MAP = {
    "seed": "seed", "emergent": "emergent", "contested": "contested",
    "adopted": "adopted", "dominant": "dominant", "fragmented": "fragmented",
    "deprecated": "deprecated", "archived": "archived", "resurrected": "resurrected",
    "active": "adopted", "proposed": "seed", "rejected": "deprecated",
}

EDGE_TYPE_MAP = {
    "support": "support", "supports": "support",
    "contradict": "contradict", "contradicts": "contradict", "opposes": "contradict",
    "mutation": "mutation", "mutates": "mutation", "evolved": "mutation",
    "lineage": "lineage", "derived": "lineage",
}


def _map_status(s: str) -> str:
    return STATUS_MAP.get(s.lower().strip(), "seed")


def _map_edge_type(t: str) -> str:
    return EDGE_TYPE_MAP.get(t.lower().strip(), "support")


def _int(v, default=1) -> int:
    try:
        return int(v)
    except (ValueError, TypeError):
        return default


def _float(v, default=0.5) -> float:
    try:
        return float(v)
    except (ValueError, TypeError):
        return default


def _parse_int_list(s: str) -> list[int]:
    return [int(x) for x in re.findall(r"\d+", s)]


def _convergence_status(score: float, cycles: list) -> str:
    if not cycles:
        return "Seed"
    if score >= 0.7:
        return "Converging"
    if score >= 0.4:
        return "Stalled"
    return "Escalated"


def _parse_cycle_dir(d: Path) -> dict | None:
    """Parse directory name into cycle metadata."""
    name = d.name
    # Patterns: CYC-001-strawman, 001-strawman, 1-strawman
    m = re.match(r"(?:CYC-)?(\d+)-(\w+)", name)
    if not m:
        return None
    cycle_id = int(m.group(1))
    agent_raw = m.group(2).lower()
    agent = AGENT_ALIASES.get(agent_raw, agent_raw)
    return {"id": cycle_id, "agent": agent, "at": str(date.today())}


def _read_concept_delta(d: Path) -> dict:
    """Read concept-delta.yaml if present."""
    delta_path = d / "concept-delta.yaml"
    if not delta_path.exists():
        return {}
    try:
        import yaml
        data = yaml.safe_load(delta_path.read_text()) or {}
        return {
            "added":   data.get("added", []),
            "mutated": data.get("mutated", []),
            "removed": data.get("removed", data.get("deprecated", [])),
        }
    except Exception:
        pass
    # Fallback: simple line-by-line parse
    result = {"added": [], "mutated": [], "removed": []}
    current_key = None
    for line in delta_path.read_text().splitlines():
        line = line.strip()
        for key in result:
            if line.lower().startswith(key + ":"):
                current_key = key
                break
        if line.startswith("- ") and current_key:
            result[current_key].append(line[2:].strip())
    return result


def _read_rationale(d: Path) -> str:
    for name in ("rationale.md", "pr-summary.md"):
        p = d / name
        if p.exists():
            text = p.read_text().strip()
            # Return first non-heading, non-empty paragraph
            for line in text.splitlines():
                line = line.strip()
                if line and not line.startswith("#"):
                    return line[:300]
    return ""


def _read_commit(d: Path) -> str:
    pr = d / "pr-summary.md"
    if pr.exists():
        m = re.search(r"\b([0-9a-f]{7,40})\b", pr.read_text())
        if m:
            return m.group(1)[:7]
    return ""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()
    root = Path(args.root).resolve()
    registry = root / "concepts" / "registry"
    doc_path = root / args.doc
    out_path = root / args.out

    print(f"Building observatory.json from {registry} …")

    concepts    = read_concepts(registry)
    edges       = read_edges(registry)
    mutations   = read_mutations(registry)
    dead_ends   = read_dead_ends(registry)
    islands     = read_islands(registry)
    cycles      = read_cycles(root, mutations)
    branches    = derive_branches(cycles)
    dead_ends   = enrich_dead_ends(dead_ends, concepts)
    concepts    = assign_positions(concepts, edges)

    document = build_document(
        doc_path, concepts, cycles, branches, mutations, islands, dead_ends
    )

    agents = [
        {"id": "strawman",    "name": "Strawman",    "glyph": "S",
         "role": "Exploration", "color": "#5eead4", "dim": "#2c5e58",
         "desc": "Expands possibilities. Tolerates ambiguity. Proposes alternatives."},
        {"id": "steelman",    "name": "Steelman",    "glyph": "St",
         "role": "Structure",   "color": "#a78bfa", "dim": "#4a3d7a",
         "desc": "Repairs weaknesses. Clarifies assumptions. Improves coherence."},
        {"id": "adversarial", "name": "Adversarial", "glyph": "A",
         "role": "Stress-test", "color": "#fb7185", "dim": "#6e2f3b",
         "desc": "Attacks assumptions. Surfaces contradictions. Identifies failure modes."},
    ]

    payload = {
        "document": document,
        "agents":   agents,
        "concepts": concepts,
        "edges":    edges,
        "cycles":   cycles,
        "branches": branches,
        "islands":  islands,
        "deadEnds": dead_ends,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))

    print(f"  {len(concepts)} concepts, {len(edges)} edges, {len(cycles)} cycles")
    print(f"  {len(islands)} islands, {len(dead_ends)} dead ends, {len(branches)} branches")
    print(f"  → {out_path}")


if __name__ == "__main__":
    main()
