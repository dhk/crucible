---
type: architecture
status: current
---

# Metadata Schema

Crucible stores debate artifacts as plain files in the repository. This document describes the formats the code actually reads and writes, with the file that defines each one. Where the code and an older description disagree, the code wins; known mismatches are listed at the end.

## Concept registry (`concepts/registry/`)

Five CSV files. `scripts/init_registry.py` creates any that are missing with the headers below, and `scripts/validate_registry.py` fails unless each file exists and its header row matches these columns **exactly, in this order** (it checks only the header, not the rows).

| File | Columns (exact header) |
|---|---|
| `concepts.csv` | `concept_id,name,status,first_seen_cycle,last_seen_cycle,description` |
| `edges.csv` | `source_concept_id,target_concept_id,edge_type,cycle,rationale` |
| `mutations.csv` | `cycle,mode,concept_id,mutation_type,rationale,commit_sha` |
| `dead_ends.csv` | `cycle,concept_id,reason,status` |
| `walls.csv` | `cycle,concept_id,resistant_population,resistance_type,evidence,status` |

Values as they appear in the committed registry and the code that interprets them:

- `concept_id` is a free-form string (the committed debate uses `FPS-001`…). `scripts/extract_concepts.py` derives a slug id from the term instead.
- `status` is free text. `scripts/build_observatory.py` maps it to a viewer state via `STATUS_MAP`: the lifecycle states `seed`, `emergent`, `contested`, `adopted`, `dominant`, `fragmented`, `deprecated`, `archived`, `resurrected` pass through, and the aliases `active`→`adopted`, `proposed`→`seed`, `rejected`→`deprecated` are translated. Anything else becomes `seed`.
- `edge_type` is mapped via `EDGE_TYPE_MAP` to one of `support`, `contradict`, `mutation`, `lineage` (with aliases such as `supports`, `opposes`, `derived`); unknown values become `support`. `scripts/run_cycle.py` tells the agent to use the four canonical values.
- Cycle columns hold zero-padded strings such as `003`; `build_observatory.py` converts them to integers.

`scripts/run_cycle.py` instructs the agent to append to `concepts.csv` and `edges.csv` only. Nothing in `scripts/` writes `mutations.csv`, `dead_ends.csv` or `walls.csv`; rows there were added by agents or by hand. In the committed registry `mutations.csv` is header-only.

`build_observatory.py` also reads some columns that the validated headers do not include, falling back to defaults: `agent` (default `strawman`), `group` (`core`), `adoption` (`0.5`), `x`/`y` (`0`) on concepts; `agent` (`adversarial`) on dead ends; `severity` (`0.5`) and `cycles` on walls. Because the validator requires exact headers, these columns cannot currently be added, so the defaults always apply.

`walls.csv` holds what the viewer calls *islands*. `build_observatory.py` reads `islands.csv` if it exists and otherwise `walls.csv`; no `islands.csv` exists today and the validator does not know about one.

## Cycle artifacts (`reviews/cycles/cycle-NNN/`)

Each cycle is a directory named `cycle-NNN` (three-digit, zero-padded), created by `scripts/run_cycle.py` (automated path, skipped if it already exists) or `scripts/new_cycle.py` (manual path, overwrites both files). `scripts/run_debate.py` picks the next number by matching `cycle-(\d+)` directory names. The directory name does not carry the agent; the mode is recorded inside `concept_delta.yaml`.

| File | Written by | Contents |
|---|---|---|
| `rationale.md` | scaffolded by `run_cycle.py` / `new_cycle.py`, filled in by the agent | `Created:` timestamp, `Document:` path, then `Summary`, `Changes Made`, `Why These Changes Matter`, `Recommended Next Pass` sections |
| `concept_delta.yaml` | same | see below |
| `pr_body.md` | `scripts/generate_pr_summary.py` (`make pr-body`), optional | PR body embedding the rationale and delta; not present in any committed cycle |

The debated document itself is not copied into the cycle directory; it is edited in place under `docs/active/` and its history lives in Git.

`concept_delta.yaml` scaffold (from `scripts/run_cycle.py`; `templates/concept_delta.yaml` is the same shape):

```yaml
cycle: "001"
mode: strawman            # strawman | steelman | adversarial
agent: strawman
document: docs/active/<slug>.md

concepts_added: []        # agent fills with {id, name, description}
concepts_modified: []     # {id, change}
concepts_removed: []      # {id, reason}
concepts_resurrected: []

dead_ends_identified: []
walls_identified: []

stance:
  supports: []
  challenges: []
  neutral: []

rationale: []

next_recommended_mode: null   # strawman | steelman | adversarial | null
confidence: null              # 0.0–1.0
```

`build_observatory.py` reads `concept_delta.yaml` (falling back to `concept-delta.yaml`) and uses only `concepts_added`, `concepts_modified` and `concepts_removed`. It parses with PyYAML when installed and otherwise with a line-based fallback.

## Debate document front matter (`docs/active/<slug>.md`)

`scripts/new_debate.py` seeds the document with this front matter:

```yaml
document_id: <slug>
issue: <issue number>
status: seed
created_by: human
crucible_state: seed
fossil_export: true
```

`run_cycle.py` and `run_debate.py` read `issue:` to add `Ref #N` to commit messages and `Closes #N` to the PR body. No script reads the other keys; `fossil_export` is a hint for a possible future consumer (see README, "Fossil: implemented vs intended").

## Derived outputs

| File | Written by | Tracked in Git |
|---|---|---|
| `visualizations/observatory.json` | `scripts/build_observatory.py` (`make build-observatory`, and the end of `run_debate.py`) | yes |
| `concepts/lineage/graph.json` | `scripts/build_graph.py` (`make export-graph`, CI) | no |
| `concepts/lineage/idea_health.json` | `scripts/compute_idea_health.py` (`make idea-health`, CI) | no |

### `observatory.json`

Top-level keys, as assembled in `main()` of `scripts/build_observatory.py`:

| Key | Contents |
|---|---|
| `document` | `title` (first `# ` heading of the document, else the filename), `path`, `status` (`Seed`/`Converging`/`Stalled`/`Escalated` from a convergence ratio), `convergence`, counts of cycles/branches/mutations/concepts/islands/deadEnds, `seededAt`, `lastCycle` |
| `agents` | the three roles with fixed names, glyphs and colors (hard-coded) |
| `concepts` | `id, name, state, agent, originCycle, group, desc, adoption, x, y` |
| `edges` | `from, to, type, cycle, rationale` |
| `cycles` | `id, agent, title, rationale, added, mutated, removed, at, branch, commit, diff` |
| `branches` | derived from each cycle's `branch` field; always `main` today |
| `islands` | from `walls.csv`: `id, name, stratum, severity, cycles, desc` |
| `deadEnds` | from `dead_ends.csv`: `id, name, cycle, agent, reason` |

`graph.json` is `{nodes, edges}` built from `concepts.csv` and `edges.csv`. `idea_health.json` maps each concept id to `mutations`, `dead_end_count`, `wall_count` and `score = mutations − 2·dead_end_count − wall_count`. Nothing reads either file; see [lineage storage](lineage-storage.md).

## Known mismatches in the current code

These are recorded so the schema above is not mistaken for intent:

- A cycle's `agent` in `observatory.json` is `unknown` for `cycle-NNN` directories: `_parse_cycle_dir` only infers an agent from a name suffix (`cycle-001-strawman`), and the `mode`/`agent` read from `concept_delta.yaml` are not used.
- `build_observatory.py` looks for `pr-summary.md` (for a commit sha and rationale fallback), but `generate_pr_summary.py` writes `pr_body.md`, so `commit` is always empty.
- A cycle's `rationale` is the first non-heading line of `rationale.md`, which with the scaffold is the `Created:` timestamp line rather than the summary.
- `document.path` is the absolute path on the machine that built the file.
