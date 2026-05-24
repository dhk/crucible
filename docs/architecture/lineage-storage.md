---
type: architecture
status: stub
---

# Lineage Storage

How Crucible accumulates and exposes concept lineage over time.

## Storage model

Lineage is Git-native. Each cycle is a commit (or PR merge) on the repository. The full history of every concept is recoverable from git log + the concept registry CSVs.

The `concepts/registry/` CSVs are the append-only source of truth. The `visualizations/observatory.json` is a derived read-only snapshot for the Observatory UI.

## Build pipeline

```
make build-observatory
  → scripts/build_graph.py          builds edge graph from registry CSVs
  → scripts/compute_idea_health.py  computes adoption scores, island severity
  → scripts/extract_concepts.py     emits concept list with current state
  → output: visualizations/observatory.json
```

## Snapshot freshness

The Observatory reads a static snapshot. It does not query git in real time. Re-run `make build-observatory` after each cycle to update the snapshot.

## Future: live query

For a live Observatory (real-time cycle replay), the snapshot approach needs replacing with a lightweight API that queries the registry CSVs + git log on demand. Out of scope for v1.
