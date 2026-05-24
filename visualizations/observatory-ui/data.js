// Crucible Observability — mock data.
// Subject of the recursive debate: Crucible's own Observability UI design brief.
// "Crucible debating itself."
//
// Coordinates are normalized to a 1000x640 canvas and pre-computed so the graph
// reads as an intentional composition, not a random force field.

const AGENTS = {
  strawman:    { id: 'strawman',    name: 'Strawman',    color: '#5eead4', dim: '#2c5e58', glyph: 'S',  role: 'Exploration', desc: 'Expands possibilities. Tolerates ambiguity. Proposes alternatives.' },
  steelman:    { id: 'steelman',    name: 'Steelman',    color: '#a78bfa', dim: '#4a3d7a', glyph: 'St', role: 'Structure',   desc: 'Repairs weaknesses. Clarifies assumptions. Improves coherence.' },
  adversarial: { id: 'adversarial', name: 'Adversarial', color: '#fb7185', dim: '#6e2f3b', glyph: 'A',  role: 'Stress-test', desc: 'Attacks assumptions. Surfaces contradictions. Identifies failure modes.' },
};

const STATES = {
  seed:        { id: 'seed',        label: 'Seed',        color: '#9ca3af' },
  emergent:    { id: 'emergent',    label: 'Emergent',    color: '#fde68a' },
  contested:   { id: 'contested',   label: 'Contested',   color: '#f59e0b' },
  adopted:     { id: 'adopted',     label: 'Adopted',     color: '#5eead4' },
  dominant:    { id: 'dominant',    label: 'Dominant',    color: '#34d399' },
  fragmented:  { id: 'fragmented',  label: 'Fragmented',  color: '#c084fc' },
  deprecated:  { id: 'deprecated',  label: 'Deprecated',  color: '#475569' },
  archived:    { id: 'archived',    label: 'Archived',    color: '#2a3140' },
  resurrected: { id: 'resurrected', label: 'Resurrected', color: '#22d3ee' },
};

const DOC = {
  title: 'Crucible Observability UI — Design Brief',
  path: 'docs/active/crucible-observability-ui.md',
  status: 'Converging',
  convergence: 0.74,
  cycles: 12,
  branches: 5,
  mutations: 47,
  concepts: 24,
  walls: 4,
  deadEnds: 5,
  seededAt: '2026-04-18',
  lastCycle: '2026-05-22',
};

// Concepts. originCycle = cycle that introduced them.
// state = current lifecycle state. agent = originating agent.
// adoption [0..1] roughly maps to node radius.
// Coordinates manually composed: "core spine" in the middle, branches radiating,
// dead-ends drifting outward and dimmed.
const CONCEPTS = [
  // — Core spine —
  { id: 'C01', name: 'Debate observability',      x: 280, y: 320, agent: 'strawman',    state: 'dominant',    adoption: 0.95, originCycle: 1,  group: 'core',
    desc: 'The process itself is observable, not just the artifact. First-class status for the debate.' },
  { id: 'C02', name: 'Conceptual lineage',        x: 430, y: 290, agent: 'steelman',    state: 'dominant',    adoption: 0.90, originCycle: 2,  group: 'core',
    desc: 'Concepts have parentage. Every mutation points to its origin and rationale.' },
  { id: 'C03', name: 'Replayability',             x: 580, y: 320, agent: 'steelman',    state: 'dominant',    adoption: 0.85, originCycle: 3,  group: 'core',
    desc: 'Users can scrub through history and replay how the document evolved.' },
  { id: 'C04', name: 'Explainable mutation',      x: 720, y: 285, agent: 'steelman',    state: 'adopted',     adoption: 0.80, originCycle: 4,  group: 'core',
    desc: 'Every mutation exposes originating agent, rationale, downstream impact.' },

  // — Visualization metaphors (branch: graph) —
  { id: 'C05', name: 'Force-directed graph',      x: 450, y: 170, agent: 'strawman',    state: 'adopted',     adoption: 0.78, originCycle: 2,  group: 'metaphor',
    desc: 'Obsidian-like graph: nodes as concepts, edges as support/contradict.' },
  { id: 'C06', name: 'Phylogenetic tree',         x: 620, y: 140, agent: 'strawman',    state: 'contested',   adoption: 0.55, originCycle: 3,  group: 'metaphor',
    desc: 'Evolutionary descent. Strong for lineage, weak for non-tree edges.' },
  { id: 'C07', name: 'Geological strata',         x: 780, y: 170, agent: 'strawman',    state: 'adopted',     adoption: 0.65, originCycle: 5,  group: 'metaphor',
    desc: 'Walls visualized as bedrock layers — persistent, structural resistance.' },
  { id: 'C08', name: 'Argument graph',            x: 320, y: 175, agent: 'strawman',    state: 'fragmented',  adoption: 0.45, originCycle: 4,  group: 'metaphor',
    desc: 'Support/attack edges as in formal argumentation theory. Splintered into C05+C09.' },
  { id: 'C09', name: 'Neural / synaptic',         x: 195, y: 140, agent: 'strawman',    state: 'deprecated',  adoption: 0.25, originCycle: 5,  group: 'metaphor',
    desc: 'Felt cinematic but lacked semantic clarity. Rolled into glow treatment, not topology.' },

  // — Process structures —
  { id: 'C10', name: 'Debate cycles',             x: 230, y: 410, agent: 'steelman',    state: 'dominant',    adoption: 0.92, originCycle: 1,  group: 'core',
    desc: 'A pass by one agent. Carries rationale, concept deltas, branch metadata.' },
  { id: 'C11', name: 'Agent observatory',         x: 350, y: 470, agent: 'strawman',    state: 'adopted',     adoption: 0.72, originCycle: 4,  group: 'view',
    desc: 'Per-agent dashboard: conflict patterns, mutation velocity, convergence.' },
  { id: 'C12', name: 'Branch explorer',           x: 510, y: 460, agent: 'strawman',    state: 'adopted',     adoption: 0.70, originCycle: 3,  group: 'view',
    desc: 'Git-like branching of competing conceptual directions.' },
  { id: 'C13', name: 'Wall explorer',             x: 660, y: 480, agent: 'adversarial', state: 'adopted',     adoption: 0.62, originCycle: 6,  group: 'view',
    desc: 'Archaeological surface for persistent objections and structural resistance.' },
  { id: 'C14', name: 'Dead-end gallery',          x: 800, y: 440, agent: 'adversarial', state: 'adopted',     adoption: 0.60, originCycle: 6,  group: 'view',
    desc: 'Failed concepts preserved as negative knowledge. Explored terrain stays visible.' },

  // — Aesthetic decisions —
  { id: 'C15', name: 'Dark-mode first',           x: 130, y: 280, agent: 'strawman',    state: 'dominant',    adoption: 0.95, originCycle: 1,  group: 'aesthetic',
    desc: 'Premium editorial, cinematic. Not a configurable theme — a foundational stance.' },
  { id: 'C16', name: 'Bloomberg restraint',       x: 110, y: 380, agent: 'steelman',    state: 'adopted',     adoption: 0.70, originCycle: 3,  group: 'aesthetic',
    desc: 'Information density without ornament. Function-forward chrome.' },
  { id: 'C17', name: 'Obsidian glow',             x: 220, y: 90,  agent: 'strawman',    state: 'adopted',     adoption: 0.68, originCycle: 4,  group: 'aesthetic',
    desc: 'Halo nodes, mood, depth. Carries the emotional charge of the visualization.' },

  // — Adversarial-introduced —
  { id: 'C18', name: 'Scale to many docs',        x: 880, y: 320, agent: 'adversarial', state: 'contested',   adoption: 0.50, originCycle: 7,  group: 'risk',
    desc: 'Cross-document lineage. Will the graph still read at 1000+ concepts?' },
  { id: 'C19', name: 'Cross-repo lineage',        x: 880, y: 230, agent: 'adversarial', state: 'emergent',    adoption: 0.35, originCycle: 8,  group: 'risk',
    desc: 'Concept identity across repositories. Hard problem. Open.' },
  { id: 'C20', name: 'AI arbitration',            x: 590, y: 555, agent: 'adversarial', state: 'contested',   adoption: 0.40, originCycle: 9,  group: 'risk',
    desc: 'Auto-resolving deadlocks via meta-agent. Risk: hides resistance signal.' },
  { id: 'C21', name: 'Convergence prediction',    x: 440, y: 555, agent: 'steelman',    state: 'emergent',    adoption: 0.42, originCycle: 9,  group: 'future',
    desc: 'Forecast whether cycles will converge. Useful only if calibration is honest.' },

  // — Resurrected —
  { id: 'C22', name: 'Live multi-agent debate',   x: 760, y: 555, agent: 'strawman',    state: 'resurrected', adoption: 0.48, originCycle: 5,  group: 'future',
    desc: 'Abandoned cycle 5 (perf). Resurrected cycle 10 with bounded-context scoping.' },

  // — Auxiliary —
  { id: 'C23', name: 'Concept registry',          x: 540, y: 365, agent: 'steelman',    state: 'dominant',    adoption: 0.88, originCycle: 2,  group: 'core',
    desc: 'CSV-backed registry. Concepts, edges, mutations, dead ends, walls.' },
  { id: 'C24', name: 'Rationale-as-data',         x: 380, y: 365, agent: 'steelman',    state: 'adopted',     adoption: 0.72, originCycle: 2,  group: 'core',
    desc: 'Agent reasoning is structured metadata, not prose afterthought.' },
];

// Edges between concepts.
// type: support | contradict | lineage | mutation
// cycle: when it was introduced
const EDGES = [
  // Core spine
  { from: 'C01', to: 'C02', type: 'support',  cycle: 2 },
  { from: 'C02', to: 'C23', type: 'support',  cycle: 2 },
  { from: 'C02', to: 'C24', type: 'support',  cycle: 2 },
  { from: 'C01', to: 'C10', type: 'support',  cycle: 1 },
  { from: 'C10', to: 'C24', type: 'support',  cycle: 2 },
  { from: 'C02', to: 'C03', type: 'support',  cycle: 3 },
  { from: 'C03', to: 'C04', type: 'support',  cycle: 4 },
  { from: 'C04', to: 'C24', type: 'support',  cycle: 4 },
  { from: 'C23', to: 'C03', type: 'support',  cycle: 3 },

  // Views supporting core
  { from: 'C01', to: 'C11', type: 'support',  cycle: 4 },
  { from: 'C03', to: 'C12', type: 'support',  cycle: 3 },
  { from: 'C01', to: 'C13', type: 'support',  cycle: 6 },
  { from: 'C01', to: 'C14', type: 'support',  cycle: 6 },

  // Metaphors
  { from: 'C05', to: 'C02', type: 'support',  cycle: 2 },
  { from: 'C08', to: 'C05', type: 'mutation', cycle: 4 }, // argument-graph split into force-directed + ...
  { from: 'C08', to: 'C09', type: 'mutation', cycle: 5 },
  { from: 'C06', to: 'C02', type: 'support',  cycle: 3 },
  { from: 'C06', to: 'C05', type: 'contradict', cycle: 4 }, // tree vs free graph
  { from: 'C07', to: 'C13', type: 'support',  cycle: 6 },
  { from: 'C09', to: 'C17', type: 'mutation', cycle: 5 }, // neural -> glow
  { from: 'C05', to: 'C17', type: 'support',  cycle: 4 },

  // Aesthetic
  { from: 'C15', to: 'C17', type: 'support',  cycle: 4 },
  { from: 'C15', to: 'C16', type: 'support',  cycle: 3 },
  { from: 'C16', to: 'C11', type: 'support',  cycle: 4 },

  // Adversarial
  { from: 'C18', to: 'C05', type: 'contradict', cycle: 7 }, // scale stresses force graph
  { from: 'C18', to: 'C19', type: 'support',  cycle: 8 },
  { from: 'C20', to: 'C13', type: 'contradict', cycle: 9 }, // AI arbitration hides walls
  { from: 'C21', to: 'C03', type: 'support',  cycle: 9 },

  // Resurrected
  { from: 'C22', to: 'C10', type: 'support',  cycle: 10 },
  { from: 'C22', to: 'C11', type: 'support',  cycle: 10 },
];

// Debate cycles — one pass each.
const CYCLES = [
  { id: 1,  agent: 'strawman',    title: 'Seed: pose the problem',           rationale: 'Establish that the debate itself is the artifact. Set dark-mode-first tone.', added: ['C01','C10','C15'], removed: [],     mutated: [], at: '2026-04-18', branch: 'main' },
  { id: 2,  agent: 'steelman',    title: 'Lineage as the load-bearing wall', rationale: 'Without concept lineage, replay is shallow. Promote lineage to core. Introduce registry.', added: ['C02','C05','C23','C24'], removed: [], mutated: ['C01'], at: '2026-04-20', branch: 'main' },
  { id: 3,  agent: 'strawman',    title: 'Scrub the river',                  rationale: 'Replayability deserves first-class status. Propose tree metaphor.', added: ['C03','C06','C12','C16'], removed: [], mutated: ['C02'], at: '2026-04-23', branch: 'main' },
  { id: 4,  agent: 'steelman',    title: 'Argument-shaped, not just graph-shaped', rationale: 'Argument graphs handle support/contradict natively. Make mutations explain themselves.', added: ['C04','C08','C11','C17'], removed: [], mutated: ['C05'], at: '2026-04-26', branch: 'main' },
  { id: 5,  agent: 'strawman',    title: 'Geology + ghosts',                 rationale: 'Walls as strata; abandoned ideas as ghost nodes. Neural metaphor proposed and tabled.', added: ['C07','C09','C22'], removed: [], mutated: ['C08'], at: '2026-04-29', branch: 'metaphor-fork' },
  { id: 6,  agent: 'strawman',    title: 'Walls and fossils get a home',     rationale: 'Promote walls + dead ends to dedicated views. Archaeological framing.', added: ['C13','C14'], removed: [], mutated: ['C09'], at: '2026-05-02', branch: 'main' },
  { id: 7,  agent: 'adversarial', title: 'Does the graph break at 1000?',    rationale: 'Force layout assumes ~50 concepts. At a population of orgs, this collapses.', added: ['C18'], removed: [], mutated: ['C05','C06'], at: '2026-05-06', branch: 'main' },
  { id: 8,  agent: 'adversarial', title: 'Identity across repos',            rationale: 'Same concept renamed across two repos — is it the same concept? Open.', added: ['C19'], removed: [], mutated: [], at: '2026-05-09', branch: 'risk-branch' },
  { id: 9,  agent: 'adversarial', title: 'Arbitration vs. honest signal',    rationale: 'Auto-resolving deadlocks hides resistance. Propose convergence prediction as alternative.', added: ['C20','C21'], removed: [], mutated: [], at: '2026-05-12', branch: 'risk-branch' },
  { id: 10, agent: 'steelman',    title: 'Resurrect live debate',            rationale: 'Live multi-agent debate previously failed on cost. With bounded scoping it returns.', added: [], removed: [], mutated: ['C22'], at: '2026-05-16', branch: 'main' },
  { id: 11, agent: 'adversarial', title: 'Probe the neural metaphor',        rationale: 'Synaptic visuals look good but don\'t add semantic information. Demote to ambient effect.', added: [], removed: [], mutated: ['C09','C17'], at: '2026-05-19', branch: 'main' },
  { id: 12, agent: 'steelman',    title: 'Tighten the spine',                rationale: 'Codify lineage→replay→explainability as the load-bearing chain.', added: [], removed: [], mutated: ['C01','C02','C03','C04'], at: '2026-05-22', branch: 'main' },
];

// Branches of conceptual exploration.
const BRANCHES = [
  { id: 'main',           label: 'main',              parent: null,        color: '#9ca3af', cycles: [1,2,3,4,6,10,11,12], status: 'active', desc: 'Spine of accepted concepts.' },
  { id: 'metaphor-fork',  label: 'metaphor-fork',     parent: 'main',      color: '#5eead4', cycles: [5],                  status: 'merged', desc: 'Forked at cycle 4 to explore strata + neural metaphors. Merged at cycle 6.' },
  { id: 'risk-branch',    label: 'risk-branch',       parent: 'main',      color: '#fb7185', cycles: [8,9],                status: 'open',   desc: 'Adversarial-led probing of scale + arbitration. Unresolved.' },
  { id: 'tree-graph',     label: 'tree-graph',        parent: 'main',      color: '#f59e0b', cycles: [],                   status: 'stale',  desc: 'Phylogenetic tree as primary metaphor. Lost to force-directed graph.' },
  { id: 'auto-summary',   label: 'auto-summary',      parent: 'main',      color: '#475569', cycles: [],                   status: 'closed', desc: 'Summarize debate into prose. Closed: erases nuance.' },
];

// Persistent walls — structural resistance.
const WALLS = [
  { id: 'W1', name: 'Velocity vs. depth',          stratum: 0, severity: 0.85, cycles: [1,3,7,12], desc: 'Pressure to ship fast vs. preserve every rationale. Recurs at every escalation.' },
  { id: 'W2', name: 'Scale beyond ~100 concepts',  stratum: 1, severity: 0.70, cycles: [7,18],     desc: 'Force-directed layouts degrade at population scale. No solution yet.' },
  { id: 'W3', name: 'Cross-repo concept identity', stratum: 2, severity: 0.60, cycles: [8,9],      desc: 'When is "the same concept" in two repos the same? Open structural problem.' },
  { id: 'W4', name: 'Hiding resistance signal',    stratum: 3, severity: 0.55, cycles: [9,11],     desc: 'Smoothing the debate (auto-summary, arbitration) erases the very signal Crucible exists to preserve.' },
];

// Dead ends — concepts that failed.
const DEAD_ENDS = [
  { id: 'D1', name: '3D concept graph',                 cycle: 4,  agent: 'strawman',    reason: 'Cinematic but unreadable. Z-axis added load without information.' },
  { id: 'D2', name: 'Auto-summary of debate',           cycle: 7,  agent: 'steelman',    reason: 'LLM compression erased the dissent that makes the debate valuable.' },
  { id: 'D3', name: 'Single-page artifact',             cycle: 2,  agent: 'strawman',    reason: 'Tried to fit Timeline + Graph + Inspector in one scroll. Density vs. focus collapsed.' },
  { id: 'D4', name: 'Gamified convergence score',       cycle: 6,  agent: 'strawman',    reason: 'Turned reasoning into points. Pulled toward unprincipled "wins."' },
  { id: 'D5', name: 'Real-time collaborative cursors',  cycle: 8,  agent: 'strawman',    reason: 'Optimized for synchronous editing — Crucible is fundamentally asynchronous.' },
];

// Expose to global scope for cross-script access.
Object.assign(window, { AGENTS, STATES, DOC, CONCEPTS, EDGES, CYCLES, BRANCHES, WALLS, DEAD_ENDS });
