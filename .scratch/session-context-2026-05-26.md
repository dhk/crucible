# Context Snapshot: crucible
Generated: 2026-06-20T21:33:07Z
Branch: main
Status: in-progress
Description: End-to-end debate loop shipped; Observatory UI live with real data

## Objective
Crucible is a Git-native agentic debate engine. The goal this session was to close the end-to-end loop: GitHub issue → automated agent debate → concept registry → Observatory UI visualization.

## Where Things Stand

**Done and on main:**
- Full automated debate runner: `make new-debate ISSUE=<n>` → `make run-debate` → PR
- First real debate shipped: issue #12 (freedom-preserving software), 9 cycles, 42 concepts, 80 edges, 6 islands, 12 dead ends — all on main
- Observatory UI serves real data from `visualizations/observatory.json`; falls back to mock data if absent
- Document Evolution view: per-cycle git diffs extracted by pipeline, rendered in UI with agent-coloured badges
- Two production bugs fixed: `make new-debate` URL parsing, silent observatory.json fallback due to wrong server root

**How to run the UI:**
```bash
cd visualizations && python3 -m http.server 7890
# open http://localhost:7890/observatory-ui/Tree View.html
```
Server must run from `visualizations/`, not `observatory-ui/` — the fetch is `../observatory.json`.

**Open issue:**
- #10 — namespace debate docs by issue number (`docs/debates/12-<slug>.md` instead of `docs/active/<slug>.md`). Not yet implemented. Issue has been rewritten to be clear.

**Woven harvest (separate repo):**
- Full harvest of `dhk/woven` completed for Relationship Richness Graph design
- 8 files saved to `~/Documents/woven-harvest/`
- Key finding: Relationship Richness slots into `mcp/src/` as a new module extending `EdgeData`; alumni detection (Positions.csv) is highest-ROI new signal

## Next Actions
- [ ] Implement #10 — move debate docs to `docs/debates/<issue>-<slug>.md` in `scripts/new_debate.py`
- [ ] Design Relationship Richness Graphs for Woven using harvest output in `~/Documents/woven-harvest/`
- [ ] Address browser cache problem for Observatory UI JSX (add cache-busting query strings or document the incognito workaround)

## Warnings
- ⚠️ Babel standalone aggressively caches `.jsx` files. After any UI change, use `Cmd+Shift+R` (hard refresh) or open in incognito to see updates.
- ⚠️ HTTP server must be started from `visualizations/` not `visualizations/observatory-ui/` or observatory.json will silently 404 and the UI shows mock data.

---
*Resume:* load this file in your next session.
