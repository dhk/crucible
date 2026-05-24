# Crucible Observatory UI — Implementation Spec

**Status:** ready for build
**Owner:** Design → Engineering handoff
**Source brief:** `crucible/docs/design/crucible-observability-ui.md`
**Design prototype:** `index.html` (dark, all views) + `Tree View.html` (DHK light, tree-focused)
**Design system:** [github.com/dhk/DHK-website/blob/main/design-system.md](https://github.com/dhk/DHK-website/blob/main/design-system.md)

> **Terminology note:** the original brief refers to persistent resistance patterns as "walls." This spec renames them to **islands** (concept and `Island` type alike). Treat any "wall" reference in upstream documents as superseded. The source brief should be updated to match.

---

## 1. Product summary

The Observatory is a read-only inspection surface for Crucible's debate output. It makes the *process* of intellectual evolution observable, not just the final document. Users navigate concepts, lineage, branches, agents, and resistance patterns produced by recursive agentic review cycles.

This document specifies the UI for a single-document observatory. Multi-document/cross-repo is out of scope for v1 (see §10).

### Non-goals for v1
- Document editing
- Live agent invocation / starting a new cycle from the UI
- User accounts / sharing / permissions
- Real-time collaboration

---

## 2. Data model

Source of truth: the Crucible concept registry (CSV files under `crucible/concepts/registry/`) plus the cycle artifacts under `crucible/reviews/cycles/`. The UI reads a derived JSON snapshot — it does not write.

### 2.1 Entities

```ts
type AgentId = 'strawman' | 'steelman' | 'adversarial';

type LifecycleState =
  | 'seed' | 'emergent' | 'contested'
  | 'adopted' | 'dominant' | 'fragmented'
  | 'deprecated' | 'archived' | 'resurrected';

type EdgeType = 'support' | 'contradict' | 'mutation' | 'lineage';

interface Agent {
  id: AgentId;
  name: string;        // "Strawman", "Steelman", "Adversarial"
  role: string;        // one-line purpose
  desc: string;        // 1-sentence behavior
}

interface Document {
  title: string;
  path: string;        // repo-relative
  status: string;      // "Converging" | "Stalled" | "Escalated" | "Terminated"
  convergence: number; // 0..1
  cycles: number;
  branches: number;
  mutations: number;
  concepts: number;
  islands: number;
  deadEnds: number;
  seededAt: string;    // ISO date
  lastCycle: string;   // ISO date
}

interface Concept {
  id: string;               // e.g. "C05"
  name: string;
  agent: AgentId;           // originating agent
  state: LifecycleState;
  adoption: number;         // 0..1 — drives node size & adoption bar
  originCycle: number;
  desc: string;             // 1-3 sentences
  group?: string;           // optional taxonomy: core | metaphor | view | risk | future | aesthetic
}

interface Edge {
  from: string;    // concept id
  to: string;      // concept id
  type: EdgeType;
  cycle: number;   // cycle that introduced the edge
  rationale?: string;
}

interface Cycle {
  id: number;              // 1-indexed
  agent: AgentId;
  title: string;           // short pass title
  rationale: string;       // why this pass did what it did
  added: string[];         // concept ids introduced
  mutated: string[];       // concept ids modified
  removed: string[];       // concept ids deprecated/archived
  at: string;              // ISO date
  branch: string;          // branch id
}

interface Branch {
  id: string;
  label: string;
  parent: string | null;
  color: string;
  cycles: number[];                                        // cycle ids on this branch
  status: 'active' | 'merged' | 'open' | 'stale' | 'closed';
  desc: string;
}

interface Island {
  id: string;            // "I1"
  name: string;
  position: { x: number; y: number };  // 0..1 normalized — set by pipeline
  size: number;          // 0..1 — drives island radius / footprint
  severity: number;      // 0..1 — drives island color intensity
  cycles: number[];      // cycles where this island manifested
  desc: string;
}

interface DeadEnd {
  id: string;            // "D1"
  name: string;
  cycle: number;
  agent: AgentId;
  reason: string;        // cause-of-death
}
```

### 2.2 Source format

The build pipeline produces one file:

```
crucible/visualizations/observatory.json
```

Schema: `{ document, agents, concepts, edges, cycles, branches, islands, deadEnds }`. The UI fetches this once on load. No mutation API. Re-run `make build-observatory` to regenerate.

---

## 3. Application shell

```
┌─────────────────────────────────────────────────────────────────┐
│ TOPBAR · brand · doc crumb · status pills · view tabs           │
├──────────┬──────────────────────────────────┬───────────────────┤
│          │                                   │                   │
│  RAIL    │   MAIN VIEW                       │   INSPECTOR       │
│  (240)   │   (flex)                          │   (340)           │
│          │                                   │                   │
│          ├──────────────────────────────────┤                   │
│          │   BOTTOM TIMELINE (116)           │                   │
└──────────┴──────────────────────────────────┴───────────────────┘
```

### 3.1 Topbar — `48px tall`
- Brand mark · "Crucible" · "OBSERVATORY" (mono, dim)
- Breadcrumb: `docs/active / <document-name>.md`
- Status pills: converging %, cycle counter, time-since-last-pass
- View tabs (5): Graph · Timeline · Branches · Agents · Islands

### 3.2 Left rail — `240px wide`, scroll-y
- Document block: title, path, key stats (status, convergence, cycles, concepts, branches, mutations, islands, dead-ends)
- Agents legend: per-agent swatch + name + concept count. Click toggles dim-state for that agent in the active view.
- Lifecycle legend: per-state swatch + label + count. Same toggle behavior.
- Recent cycles: last 5 cycles, click to set selected cycle.

### 3.3 Main view — switches per tab. Renders the active view (see §4-8).

### 3.4 Right inspector — `340px wide`, scroll-y
Drilldown panel. Surfaces details for whatever the user has selected. Default content: selected concept.
- Concept header: id, state badge, name, description
- Properties: origin (agent + cycle), adoption bar, supports / contradicts / mutations counts
- Lineage: vertical timeline of every cycle that touched this concept, with rationale quotes
- Selected cycle: id, agent, title, rationale (echoes the bottom timeline's playhead)

### 3.5 Bottom timeline — `116px tall`
- Transport controls: play, prev cycle, next cycle
- Playhead readout: `C07 / 12` · date · cycle title
- Progress bar
- Mini-strip: cycle dots colored by agent. Hovering a dot dims non-cycle nodes in the active view. Clicking selects it.

---

## 4. View — Concept Graph (centerpiece)

### 4.1 Purpose
Show conceptual topology: who supports whom, who contradicts whom, what mutated into what, what's dead.

### 4.2 Visual metaphor toggle
Header chip row exposes three layout metaphors:
- **Force** (default) — Obsidian-style force-directed graph with halo glow
- **Tree** — rectangular dendrogram, bend-at-parent (see §9)
- **Archipelago** — concepts laid out as territories around the islands of resistance they collide with

Switching is a layout swap; the same nodes and edges render in all three.

### 4.3 Nodes
- Position: pre-computed per metaphor (see §9)
- Radius: `base + adoption × scale`. Comfortable: `8 + a×14`. Dense: `6 + a×10`.
- Fill: originating agent's color, except:
  - `contested` → orange
  - `resurrected` → cyan accent
  - `fragmented` → purple
  - `deprecated`/`archived` → transparent fill, dashed outline (fossil)
- `dominant` adds an outer ring; `contested` adds a dashed orange ring
- Hover: outer ring + show full id/state line
- Selected: persistent ring + ancestry highlight (see §4.5)

### 4.4 Edges
| Type | Stroke | Style |
|---|---|---|
| support | teal (or `--accent` in DHK) | solid |
| contradict | coral / `--accent-orange` | dashed 4-4, slight curve |
| mutation | violet / `--accent-purple` | dashed 2-3 |
| lineage | gray | solid, faint |

Edges render below nodes. Edges fade to ~12% opacity when their nodes are not in the active ancestry chain.

### 4.5 Selection behavior
Clicking a node:
1. Updates `selectedConceptId` (lifted state)
2. Computes ancestry = chain from selected to roots via `parentOf`
3. Highlights nodes/edges in chain, dims everything else (~18% opacity)
4. Right inspector hydrates with the concept

### 4.6 Tweaks exposed
- Density: comfortable | dense
- Dead-ends visible: on | off (default on — fossils are knowledge)
- Islands visible: on | off
- Agent focus: all | strawman | steelman | adversarial

---

## 5. View — Debate Timeline

### 5.1 Layout
- 3 horizontal swimlanes, one per agent
- 1 column per cycle (12 cycles)
- Top row: branch indicator (which branch was active per cycle, with fork dots)

### 5.2 Cycle events
- Dot at `(cycleX, agentY)` sized by total delta (`added + mutated + removed`)
- Color = agent
- Halo glow on hover/selection
- Connector curve between adjacent cycles (across lanes) — shows the debate baton-pass

### 5.3 Tooltip
On hover, show a popover: cycle id, agent, title, rationale.

### 5.4 Click
Sets `selectedCycleId`. The Inspector + bottom playhead update.

---

## 6. View — Branch Explorer

### 6.1 Layout
Git-style branch tracks stacked vertically. Each branch is a horizontal line; cycles on the branch are nodes on the line.
- Main branch in the center, others above/below ordered visually
- Fork: curved line splits off main at the parent cycle
- Merge: curved line rejoins main at the merge cycle
- Open: branch line trails right with a fading dashed extension
- Stale / closed: short stub ending in an X marker

### 6.2 Right column
Per-branch detail card: label (mono, colored), status, description.

### 6.3 Interactions
Click a cycle node → sets selected cycle (echoes into inspector + bottom timeline).

---

## 7. View — Agent Observatory

### 7.1 Top row: three agent cards (1fr each)
For each agent:
- Glyph + name + role pill (active state)
- 1-line behavior description
- Stat grid (2×2): passes, concepts authored, mutations, survival rate
- 12-cycle activity sparkline — bar at each cycle, colored if this agent owned the cycle, sized by delta

### 7.2 Bottom row: two charts
- **Mutation velocity** — per-cycle stacked bar of `added + mutated`, colored by agent. Glow filter on bars.
- **Interaction matrix** — 3×3 grid. Row = challenger, column = challenged. Cell value = count of contradict/mutation edges between agents' concepts + cross-agent cycle revisions. Cell color intensity scales with value.

### 7.3 Data derivation
All stats computed client-side from `concepts`, `edges`, `cycles`. No new server fields.

---

## 8. View — Islands & Fossils

An island is a *persistent zone of resistance* the debate keeps hitting: an organizational objection, an ideological conflict, a structural limit. The view treats them as territory the agents have charted but not crossed. Fossils (dead-ends) are the concepts that died trying.

### 8.1 Archipelago canvas (left, 2fr)
- Top-down map view. Sea-colored background (`--bg2`), no axes — spatial position is symbolic, not data-driven.
- One island per `Island` record, positioned by its `position` field (set by the Crucible pipeline). Irregular blob shape (deterministic from `id` so the layout is stable).
- Island radius scales with `size`; fill saturation scales with `severity` (low = pale, high = deeply tinted in `--accent-orange`).
- Each island carries: id (mono), name (Barlow Condensed), 1-line description (Barlow 300), severity meter (0–100), recurrence chips for each cycle it appeared in.
- Fossils (dead-ends) drift as small dashed circles in the sea between islands. Hover for cause-of-death; click for full card.
- No "sky" or "bedrock" bands — the metaphor is horizontal, not vertical.

### 8.2 Dead-end gallery (right, 1fr)
Vertical list of dead-end cards:
- Mono id
- Originating agent pill, cycle stamp
- Concept name with strikethrough
- Cause-of-death (italic)
- Visual: left edge dashed gray bar (fossil affordance)
- Clicking a card pans the archipelago to highlight the nearest island, if any.

---

## 9. Tree view layout algorithm

Used by the Concept Graph "Tree" metaphor.

### 9.1 Parent derivation
For each concept `c`:
1. Collect inbound `support` or `mutation` edges from concepts older than `c.originCycle`.
2. Sort by source `originCycle` descending → pick the most-recent earlier predecessor as parent.
3. Override with explicit hints map for concepts where the data-derived parent is semantically wrong. (Hint table lives in the Observatory builder, NOT the UI. Ship as part of the JSON snapshot.)

A concept with no inbound edge is a **root**.

### 9.2 Children & ordering
Build `childrenOf` from `parentOf`. Sort each child list by:
1. `originCycle` ascending
2. `adoption` descending
3. id ascending (tiebreak)

This gives a stable, deterministic layout.

### 9.3 Coordinates
- **x = depth from root × `levelGap`** (default `150px`)
  - Topology-driven. *Not* time-driven — `originCycle` is shown as metadata on each node instead.
  - Rationale: time-on-x clusters everything in cycles 1–4 because that's where most concepts are introduced. Depth-on-x produces a balanced, readable tree.
- **y = DFS leaf-slot order × `rowGap`** (default `40px`)
  - Walk roots in cycle order. Leaves get sequential slot numbers. Internal nodes get midpoint of their children's slots.
  - Add `+0.6` slot gap between root subtrees.

### 9.4 Edge routing
Rectangular dendrogram with **bend at parent**:

```
path = `M parent.x,parent.y V child.y H child.x`
```

That is: leave the parent vertically, then turn right toward the child. This keeps the horizontal segment off to the right of the parent so labels next to parent are never crossed by edge geometry.

### 9.5 Labels
- Name (Barlow Condensed 13/500, paper-colored stroke halo)
- ID line below: `C05 · C02 · ADOPTED` (mono 9, stroke halo)
- Halo via `paint-order: stroke fill; stroke: var(--bg); stroke-width: 3px`. Mandatory — edges and grid otherwise visually strikethrough text.

### 9.6 Contradiction overlay
Drawn on top of the tree as curved orange dotted arcs between contradicting concepts. Toggleable.

---

## 10. Design system contracts

### 10.1 DHK light theme (primary)
Strict adherence to [the DHK design system](https://github.com/dhk/DHK-website/blob/main/design-system.md).

Hard rules:
- All colors via CSS custom properties on `:root`. **No hardcoded hex in components.** State and edge type colors map to DHK accents:
  - Strawman ↔ `--accent` (green)
  - Steelman ↔ `--accent-blue`
  - Adversarial ↔ `--accent-orange`
  - Mutation edges ↔ `--accent-purple`
- Fonts: Barlow (sans 300/400/500), Barlow Condensed (h1/h2/h3, mono-display labels), DM Mono (meta, tags, ids, dates, code). **No serifs anywhere.**
- Spacing: only the `--space-N` scale (1=4 … 10=120). No arbitrary px gaps.
- Cards use the `border-left: 3px solid transparent` → `var(--accent)` on selection/hover pattern from the system.
- Body text weight 300, `line-height: 1.6+`. h1 uses `clamp(42px, 5vw, 68px)` and 700.

### 10.2 Dark variant (Obsidian)
A secondary theme is preserved at `index.html` for users who prefer the "neural / synaptic" mood (it was the original brief direction). It is *not* a configurable theme switch — it is a separate entry point with its own token set:
- Background: deep near-black `#06080c`
- Agents: teal / violet / coral
- Halo glow on nodes via SVG `feGaussianBlur` filters

This document does not specify both styles in parallel; the dark variant exists as the prototype reference. Tokens for it live in `styles.css`. If we ship only one theme for v1, **ship DHK**.

### 10.3 Tokens to add to DHK for the observatory
The base DHK system covers most of what's needed. The Observatory introduces a handful of derived tokens — they should be defined in observatory-local CSS and **not** added to the canonical DHK system, since they are app-specific:

```css
:root {
  /* Agents */
  --strawman:    var(--accent);
  --steelman:    var(--accent-blue);
  --adversarial: var(--accent-orange);

  /* Concept state tones (chip backgrounds) */
  --state-dominant-bg:  rgba(22,163,74,0.16);
  --state-adopted-bg:   rgba(22,163,74,0.10);
  --state-contested-bg: rgba(217,79,42,0.12);
  /* ... etc */
}
```

---

## 11. State model

Lifted state (top of app):
```ts
{
  view: 'graph' | 'timeline' | 'branches' | 'agents' | 'islands',
  selectedConceptId: string | null,
  selectedCycleId: number | null,
  hoveredCycleId: number | null,
  graphMetaphor: 'force' | 'tree' | 'archipelago',
  showDeadEnds: boolean,
  showIslands: boolean,
  showContradictions: boolean,
  agentFilter: AgentId | 'all',
  density: 'comfortable' | 'dense',
}
```

Routing: encode `view`, `selectedConceptId`, `selectedCycleId` in URL params so links are shareable. Other state is session-only.

---

## 12. Interactions / keyboard

- `←` / `→`: prev / next cycle (advances `selectedCycleId`, replays delta animations if any)
- `Space`: toggle play (auto-advances cycles every 1.5s)
- `1`–`5`: jump to view tab
- `Esc`: clear selection
- Clicking outside any node clears `selectedConceptId`

---

## 13. Performance & scale

For v1: ~50 concepts, ~100 edges, ~20 cycles, 1 document. Targets:
- Initial paint < 200ms after JSON load
- View switches < 50ms (no recompute beyond layout pass)
- 60fps on hover/select dimming (CSS-driven, no JS layout)

Hard limits before requiring a re-architecture:
- ~200 concepts — force-directed layout starts to look like spaghetti, tree depth gets unreadable
- ~50 cycles — timeline lane runs out of horizontal space at typical viewport widths

At those limits, the brief calls out scale as a known island (`I2 — Scale beyond ~100 concepts`). v1 ships with the island acknowledged in the UI rather than solved.

---

## 14. Accessibility

- All interactive elements reachable by Tab; focus rings use `--accent` on `:focus-visible`
- Node hit areas ≥ 12px even when visual radius is smaller
- Color is not the sole signal: state and agent are *also* in text (id line under each node, agent name in inspector)
- Contradict / mutation edges use stroke patterns *in addition to* color
- `prefers-reduced-motion`: disable cycle auto-advance animations and edge fade transitions

---

## 15. Resolved decisions

1. **Multi-document — punted.** v1 is single-document. No document switcher in the topbar; the breadcrumb stays static. Revisit when cross-document lineage ships.
2. **Live cycles — out of scope.** No "agent currently working" indicator in v1. The UI is a read-only inspection surface for completed cycles.
3. **Island severity — pipeline-computed.** The Crucible build pipeline computes severity (recurrence-count weighted by cycles-since-first-seen, or whatever formula it chooses) and emits the final 0..1 value into `observatory.json`. The UI never computes it.
4. **Inspector empty state — global summary.** When nothing is selected, the inspector shows a document-level summary panel: convergence score, top 3 dominant concepts, top 3 contested concepts, last 3 cycles. As soon as the user selects something, the inspector swaps to drilldown mode.
5. **Export — in scope for v1.** A topbar "Export" button offers:
   - **Current view as PNG** — rasterized at 2× resolution
   - **Current view as SVG** — vector, retains node/edge selectors so it's editable downstream
   - **Full snapshot as JSON** — the underlying `observatory.json` payload
   - **Selected concept lineage as Markdown** — only available when a concept is selected. Outputs the concept's name, description, and the full lineage timeline (agent, cycle, rationale).

   Filenames: `<doc-slug>--<view>--<iso-date>.<ext>`.

---

## 16. File map (prototype reference)

```
index.html                   dark Obsidian variant entry
Tree View.html               DHK light tree variant entry
styles.css                   dark tokens
tree-styles.css              DHK tokens + observatory locals
data.js                      mock data (replace with fetched observatory.json)
app.jsx                      dark shell: topbar, rail, inspector, bottom timeline
tree-view.jsx                tree app: shell + tree canvas + layout algorithm + inspector
views/
  graph.jsx                  force-directed concept graph
  timeline.jsx               debate timeline (agent swimlanes)
  branches.jsx               branch explorer
  agents.jsx                 agent observatory (cards + charts + matrix)
  islands.jsx                islands & fossils
tweaks-panel.jsx             tweak panel scaffold (dev-only — strip for prod)
```

Build target: the prototype is plain `<script type="text/babel">` + React 18 UMD for fast iteration. **Productionizing:** lift each `.jsx` file into a Vite + TypeScript module, replace mock `data.js` with a `fetch('observatory.json')`, drop the tweaks panel.

---

## 17. Acceptance criteria (per view)

| View | Must do | Visual checks |
|---|---|---|
| Concept Graph | Click any node → ancestry highlights, inspector hydrates | Three lineages visible; deprecated concepts dashed; contradict edges curved orange |
| Timeline | All 12 cycles visible in 3 lanes; hover shows rationale | Branch row shows fork/merge bumps; events sized by delta |
| Branches | Each branch labeled with status; fork/merge curves connect | Stale/closed end in X; open ends in fading dashed |
| Agents | 3 cards, 4 stats each, sparkline per agent | Mutation velocity bars colored by agent; matrix readable |
| Islands | Archipelago map with sized/colored islands; dead-end cards | Cause-of-death visible; strikethrough on concept names |

---

End of spec.
