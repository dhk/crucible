---
type: architecture
status: current
---

# Lineage Storage

How Crucible records concept lineage and turns it into the snapshot the Observatory viewer reads. File formats are in [metadata schema](metadata-schema.md).

## Storage model

Lineage is Git-native: there is no database or service.

- **Source of truth** — the registry CSVs in `concepts/registry/` and the per-cycle `reviews/cycles/cycle-NNN/` directories, plus the debated document under `docs/active/`.
- **History** — Git. On the automated path each pass is one commit: `scripts/run_cycle.py` stages the document, the cycle directory and all of `concepts/registry/`, then commits `cycle(NNN/<mode>): <mode> pass`. On the manual path the operator commits.
- **Derived snapshot** — `visualizations/observatory.json`, committed, and regenerated only when someone runs the builder.

The CSVs are append-only by convention, not by enforcement: `run_cycle.py` tells the agent to append and not duplicate rows, but nothing checks it, and `scripts/validate_registry.py` checks headers only.

## Build pipeline

`make build-observatory` runs a single script (`Makefile`, target `build-observatory`):

```
make build-observatory DOC=docs/active/<slug>.md
  → python3 scripts/build_observatory.py --doc $(DOC) --out visualizations/observatory.json
      reads  concepts/registry/{concepts,edges,mutations,dead_ends,walls}.csv
      reads  reviews/cycles/*/concept_delta.yaml and rationale.md
      runs   git log / git show to attach a document diff to each cycle
      writes visualizations/observatory.json
```

`scripts/run_debate.py` runs the same builder once after its last pass. `DOC` defaults to `docs/active/design-doc.md` (the generic seed document); pass the debated document explicitly to build its snapshot.

Per-cycle diffs: for each cycle, `_extract_cycle_diffs` takes the newest commit from `git log -- reviews/cycles/cycle-NNN/` and stores `git show --unified=5 <sha> -- <doc>` from its first hunk onward. If the cycles were squash-merged into one commit, as the committed debate was, every cycle gets the same diff. Outside a Git checkout the diffs are empty.

### Separate scripts, not part of the build

| Script | Make target | Output | Consumed by |
|---|---|---|---|
| `scripts/build_graph.py` | `make export-graph` | `concepts/lineage/graph.json` | nothing (CI runs it as a smoke check) |
| `scripts/compute_idea_health.py` | `make idea-health` | `concepts/lineage/idea_health.json` | nothing (CI runs it as a smoke check) |
| `scripts/extract_concepts.py` | `make extract-concepts` | appends candidate rows to `concepts/registry/concepts.csv` | the registry, so the next build |

`concepts/lineage/` is not tracked and not in `.gitignore`, so running either script locally leaves untracked files; delete them rather than committing them. `extract_concepts.py` is a regex extractor (capitalised words of six or more characters and backtick-quoted terms) that writes status `emergent`; review its diff before building.

## Viewer and snapshot freshness

`visualizations/observatory-ui/index.html` (and the experimental `Tree View.html`) fetch `../observatory.json` at load and fall back to the bundled `data.js` demonstration data, with a visible mock-data label, if the fetch fails. Serve from `visualizations/` so the relative path resolves (README, "Inspect the example Observatory").

The viewer reads a static file and never queries Git or the registry. After a cycle, re-run `make build-observatory` and commit the regenerated JSON if it should be shared.

## CI

`.github/workflows/crucible_validate.yml` runs on pull requests that touch `docs/`, `reviews/`, `concepts/`, `scripts/`, `templates/` or `.github/workflows/`. It runs `validate_registry.py`, `build_graph.py` and `compute_idea_health.py`, then `git diff --check` between the pull request's base commit and the merge commit, so whitespace errors anywhere in the change fail the job. It does not run `build_observatory.py` and does not check that the committed `observatory.json` is current.

## Planned, not implemented

- **Live query.** A live Observatory (real-time cycle replay) would replace the static snapshot with a small API that reads the registry and `git log` on demand. Nothing in the repository does this today.
