/* global React, ReactDOM, AGENTS, STATES, CONCEPTS, EDGES, CYCLES, DOC,
   DocumentEvolution */
// Tree View — Crucible Observatory rendered in the DHK design system.
// Concept Graph as horizontal phylogenetic tree: cycle on x-axis, lineage on y-axis.

const { useState, useMemo } = React;

// Map agent ids to the DHK accent palette
const AGENT_COLOR = {
  strawman:    'var(--strawman)',     /* green */
  steelman:    'var(--steelman)',     /* blue  */
  adversarial: 'var(--adversarial)',  /* orange */
};
const AGENT_COLOR_HEX = {
  strawman:    '#16a34a',
  steelman:    '#2970d6',
  adversarial: '#d94f2a',
};

const STATE_TONE = {
  seed:        { color: '#5a5850', bg: 'rgba(90, 88, 80, 0.10)' },
  emergent:    { color: '#a16207', bg: 'rgba(217, 79, 42, 0.10)' },
  contested:   { color: '#d94f2a', bg: 'rgba(217, 79, 42, 0.12)' },
  adopted:     { color: '#16a34a', bg: 'rgba(22, 163, 74, 0.10)' },
  dominant:    { color: '#15803d', bg: 'rgba(22, 163, 74, 0.16)' },
  fragmented:  { color: '#7c5ce0', bg: 'rgba(124, 92, 224, 0.10)' },
  deprecated:  { color: '#5a5850', bg: 'rgba(90, 88, 80, 0.06)' },
  archived:    { color: '#5a5850', bg: 'rgba(90, 88, 80, 0.06)' },
  resurrected: { color: '#2970d6', bg: 'rgba(41, 112, 214, 0.12)' },
};

// ---------- Layout: phylogenetic tree ----------
// Topology-driven layout. x = depth from root (clean horizontal spread).
// y = DFS leaf slot (siblings stacked vertically).
// Cycle is shown as metadata on each node rather than driving x.
function buildTreeLayout(concepts, edges, opts) {
  const { width, padX, padY, levelGap, rowGap } = opts;

  const cycleOf = Object.fromEntries(concepts.map(c => [c.id, c.originCycle]));
  const parentOf = {};

  concepts.forEach(c => {
    const inbound = edges
      .filter(e => e.to === c.id && (e.type === 'support' || e.type === 'mutation'))
      .filter(e => cycleOf[e.from] != null && cycleOf[e.from] < c.originCycle);
    inbound.sort((a, b) => cycleOf[b.from] - cycleOf[a.from]);
    if (inbound.length > 0) {
      parentOf[c.id] = inbound[0].from;
    }
  });

  // Forced parent hints for cleaner shape where data is ambiguous.
  const HINTS = {
    C16: 'C15', C17: 'C15',
    C14: 'C13', C22: 'C10',
    C19: 'C18', C20: 'C13',
    C21: 'C03',
    C02: 'C01', C24: 'C10', C23: 'C02',
    C05: 'C02', C03: 'C02',
    C11: 'C01', C12: 'C03',
    C13: 'C07', C08: 'C05', C06: 'C05',
    C04: 'C03', C18: 'C05',
    C07: 'C08', C09: 'C08',
  };
  Object.entries(HINTS).forEach(([k, v]) => {
    if (concepts.find(c => c.id === k) && concepts.find(c => c.id === v)) {
      parentOf[k] = v;
    }
  });

  const childrenOf = {};
  concepts.forEach(c => { childrenOf[c.id] = []; });
  Object.entries(parentOf).forEach(([child, parent]) => {
    if (childrenOf[parent]) childrenOf[parent].push(child);
  });

  // Sort children: by originCycle ascending, then adoption descending
  Object.values(childrenOf).forEach(arr => {
    arr.sort((a, b) => {
      const ca = concepts.find(c => c.id === a);
      const cb = concepts.find(c => c.id === b);
      return ca.originCycle - cb.originCycle ||
             cb.adoption - ca.adoption ||
             (ca.id < cb.id ? -1 : 1);
    });
  });

  // Roots
  const roots = concepts
    .filter(c => !parentOf[c.id])
    .map(c => c.id)
    .sort((a, b) => {
      const ca = concepts.find(c => c.id === a);
      const cb = concepts.find(c => c.id === b);
      return ca.originCycle - cb.originCycle || (ca.id < cb.id ? -1 : 1);
    });

  // Compute depth (x level) for each node
  const depthOf = {};
  function computeDepth(id, d) {
    depthOf[id] = d;
    (childrenOf[id] || []).forEach(c => computeDepth(c, d + 1));
  }
  roots.forEach(r => computeDepth(r, 0));

  // Assign y slots via DFS — leaves sequential
  let slot = 0;
  const slotOf = {};
  function dfs(id) {
    const ch = childrenOf[id];
    if (ch.length === 0) {
      slotOf[id] = slot++;
      return slotOf[id];
    }
    const ys = ch.map(c => dfs(c));
    slotOf[id] = (ys[0] + ys[ys.length - 1]) / 2;
    return slotOf[id];
  }
  roots.forEach(r => { dfs(r); slot += 0.6; /* gap between root subtrees */ });

  const maxSlot = Math.max(1, slot - 1);
  const maxDepth = Math.max(...Object.values(depthOf));

  // Final positions
  const positions = {};
  const height = padY * 2 + maxSlot * rowGap;
  concepts.forEach(c => {
    const d = depthOf[c.id] ?? 0;
    positions[c.id] = {
      x: padX + d * levelGap,
      y: padY + slotOf[c.id] * rowGap,
    };
  });

  return { positions, parentOf, childrenOf, roots, depthOf, maxDepth, height };
}

// ---------- App ----------
function TreeApp() {
  const [activeTab, setActiveTab] = useState('tree');
  const [selectedId, setSelectedId] = useState('C05'); // Force-directed graph — illustrates lineage
  const [showDeadEnds, setShowDeadEnds] = useState(true);
  const [showContradict, setShowContradict] = useState(true);

  const concepts = useMemo(
    () => CONCEPTS.filter(c => showDeadEnds || (c.state !== 'deprecated' && c.state !== 'archived')),
    [showDeadEnds]
  );

  const W = 1240;
  const layout = useMemo(
    () => buildTreeLayout(concepts, EDGES, {
      width: W,
      padX: 50, padY: 50,
      levelGap: 150,
      rowGap: 40,
    }),
    [concepts]
  );
  const H = Math.max(680, layout.height);

  const selected = CONCEPTS.find(c => c.id === selectedId);
  const lineage = useMemo(() => {
    if (!selected) return [];
    const touched = CYCLES.filter(c =>
      c.added.includes(selected.id) ||
      c.mutated.includes(selected.id) ||
      c.removed.includes(selected.id)
    );
    return touched.map(c => ({
      ...c,
      evt: c.added.includes(selected.id) ? 'introduced'
         : c.mutated.includes(selected.id) ? 'mutated'
         : 'removed',
    }));
  }, [selected]);

  // Ancestry chain (for highlight)
  const ancestry = useMemo(() => {
    const chain = new Set();
    if (!selected) return chain;
    let cur = selected.id;
    chain.add(cur);
    while (layout.parentOf[cur]) {
      cur = layout.parentOf[cur];
      chain.add(cur);
    }
    return chain;
  }, [selected, layout]);

  return (
    <>
      <header className="site-header">
        <div className="brand">
          <span>Crucible</span>
          <span className="brand-sub">Observatory</span>
        </div>
        <div className="crumb">
          <span>docs/active</span>
          <span className="slash">/</span>
          <span className="doc">crucible-observability-ui.md</span>
        </div>
        <nav className="nav">
          <button className={`nav-tab${activeTab === 'timeline' ? ' active' : ''}`} onClick={() => setActiveTab('timeline')}>Timeline</button>
          <button className={`nav-tab${activeTab === 'tree' ? ' active' : ''}`} onClick={() => setActiveTab('tree')}>Concept&nbsp;Tree</button>
          <button className={`nav-tab${activeTab === 'branches' ? ' active' : ''}`} onClick={() => setActiveTab('branches')}>Branches</button>
          <button className={`nav-tab${activeTab === 'agents' ? ' active' : ''}`} onClick={() => setActiveTab('agents')}>Agents</button>
          <button className={`nav-tab${activeTab === 'islands' ? ' active' : ''}`} onClick={() => setActiveTab('islands')}>Islands</button>
          <button className={`nav-tab${activeTab === 'evolution' ? ' active' : ''}`} onClick={() => setActiveTab('evolution')}>Evolution</button>
        </nav>
      </header>

      {activeTab === 'evolution' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, height: 'calc(100vh - 56px)' }}>
          <DocumentEvolution />
        </div>
      ) : (
        <>
          <div className="hero">
            <div className="hero-top">
              <span className="tag tag-study">DOC · DESIGN BRIEF</span>
              <span className="tag tag-tree">CONCEPT TREE</span>
              <span className="meta">cycle 12 · last pass 2d ago</span>
            </div>
            <h1>Concept tree</h1>
            <p className="hero-lede">
              A phylogeny of the ideas that survived twelve debate cycles. Time runs left to right.
              Lineages descend from three seed concepts and branch as the strawman proposes, the steelman
              reinforces, and the adversarial probes. Concepts that failed are kept visible as fossils.
            </p>
            <div className="hero-stats">
              <div className="hero-stat"><span className="val">24</span><span className="label">Concepts</span></div>
              <div className="hero-stat"><span className="val">12</span><span className="label">Cycles</span></div>
              <div className="hero-stat"><span className="val">3</span><span className="label">Lineage roots</span></div>
              <div className="hero-stat"><span className="val">5</span><span className="label">Dead ends</span></div>
              <div className="hero-stat"><span className="val">74%</span><span className="label">Convergence</span></div>
            </div>
          </div>

          <div className="section-divider">
            <span>Phylogeny</span>
            <div className="rule"></div>
            <span>cycles 1 – 12 · 2026-04-18 → 2026-05-22</span>
          </div>

          <div className="tree-toolbar">
            <div className="metaphor-tabs">
              <button className="metaphor-tab">Force graph</button>
              <button className="metaphor-tab active">Tree</button>
              <button className="metaphor-tab">Strata</button>
            </div>
            <div className="spacer"></div>
            <button className={`chip-toggle ${showDeadEnds ? 'active' : ''}`} onClick={() => setShowDeadEnds(v => !v)}>
              <span className="sw" style={{ background: 'var(--text-dim)', opacity: 0.5 }}></span>
              Dead ends
            </button>
            <button className={`chip-toggle ${showContradict ? 'active' : ''}`} onClick={() => setShowContradict(v => !v)}>
              <span className="sw" style={{ background: 'var(--accent-orange)' }}></span>
              Contradictions
            </button>
          </div>

          <div className="tree-stage">
            <div className="tree-card">
              <div className="tree-canvas">
                <TreeCanvas
                  width={W} height={H}
                  concepts={concepts}
                  layout={layout}
                  selectedId={selectedId}
                  ancestry={ancestry}
                  onSelect={setSelectedId}
                  showContradict={showContradict}
                />
              </div>
            </div>
            <Inspector concept={selected} lineage={lineage} layout={layout} />
          </div>

          <div className="tree-legend">
            <div className="legend-card">
              <div className="legend-title">Agents</div>
              {Object.values(AGENTS).map(a => {
                const n = CONCEPTS.filter(c => c.agent === a.id).length;
                return (
                  <div key={a.id} className="legend-row">
                    <span className="sw" style={{ background: AGENT_COLOR_HEX[a.id] }}></span>
                    <span className="name">{a.name}</span>
                    <span className="num">{n}</span>
                  </div>
                );
              })}
            </div>
            <div className="legend-card">
              <div className="legend-title">Lifecycle state</div>
              {['dominant','adopted','contested','emergent','fragmented','resurrected','deprecated'].map(s => {
                const tone = STATE_TONE[s];
                const n = CONCEPTS.filter(c => c.state === s).length;
                return (
                  <div key={s} className="legend-row">
                    <span className="sw" style={{ background: tone.color, opacity: s === 'deprecated' ? 0.35 : 1 }}></span>
                    <span className="name">{STATES[s].label}</span>
                    <span className="num">{n}</span>
                  </div>
                );
              })}
            </div>
            <div className="legend-card">
              <div className="legend-title">Edges</div>
              <div className="legend-row">
                <span className="legend-edge" style={{ borderColor: 'var(--accent)', borderTopStyle: 'solid' }}></span>
                <span className="name">Lineage · parent → child</span>
              </div>
              <div className="legend-row">
                <span className="legend-edge" style={{ borderColor: 'var(--accent-purple)', borderTopStyle: 'dashed' }}></span>
                <span className="name">Mutation · concept evolved</span>
              </div>
              <div className="legend-row">
                <span className="legend-edge" style={{ borderColor: 'var(--accent-orange)', borderTopStyle: 'dotted', borderTopWidth: 2 }}></span>
                <span className="name">Contradiction</span>
              </div>
            </div>
          </div>

          <footer className="site-footer">
            <div className="inner">
              <span>Crucible · Observatory</span>
              <span className="spacer"></span>
              <span>generated 2026-05-22</span>
              <span>·</span>
              <a href="../index.html">← dark mode</a>
            </div>
          </footer>
        </>
      )}
    </>
  );
}

// ---------- Tree canvas ----------
function TreeCanvas({ width, height, concepts, layout, selectedId, ancestry, onSelect, showContradict }) {
  const [hover, setHover] = useState(null);
  const { positions, parentOf, maxDepth } = layout;

  // Generation tick positions (depth = generation)
  const genX = (d) => 50 + d * 150;
  const totalGenerations = maxDepth + 1;

  // Compute label-side: right of node always (tree grows left-to-right)
  const labelSide = () => 'right';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ display: 'block', width: width + 'px', height: height + 'px', maxWidth: 'none' }}>
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="var(--border)" opacity="0.35"/>
        </pattern>
        <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.08)"/>
        </filter>
      </defs>

      {/* Soft dot grid background */}
      <rect x="40" y="40" width={width - 80} height={height - 60} fill="url(#dot-grid)" opacity="0.5"/>

      {/* Generation axis (top) */}
      <g>
        {Array.from({ length: totalGenerations }).map((_, d) => (
          <g key={d}>
            <line x1={genX(d)} y1={32} x2={genX(d)} y2={height - 20}
              stroke="var(--border-light)" strokeWidth="1"/>
            <text x={genX(d)} y={20} textAnchor="start" className="t-cycle-label" dx="-4">
              GEN&nbsp;{String(d).padStart(2, '0')}
            </text>
          </g>
        ))}
        <line x1={40} y1={38} x2={width - 40} y2={38} stroke="var(--border)" strokeWidth="1"/>
      </g>

      {/* Lineage edges (rectangular dendrogram) */}
      <g>
        {Object.entries(parentOf).map(([child, parent]) => {
          if (!positions[child] || !positions[parent]) return null;
          const p = positions[parent], c = positions[child];
          // Find the parent-child edge type
          const edge = EDGES.find(e => e.from === parent && e.to === child) ||
                       EDGES.find(e => e.to === parent && e.from === child);
          const isMutation = edge && edge.type === 'mutation';

          const inChain = ancestry.has(child) && ancestry.has(parent);
          const dimmed = ancestry.size > 0 && !inChain;
          const stroke = inChain ? 'var(--accent)' :
                         isMutation ? 'var(--accent-purple)' :
                         'var(--border)';
          const dash = isMutation ? '4 4' : 'none';
          const sw = inChain ? 2 : 1.2;
          // Bend-at-parent dendrogram: vertical from parent down/up to child.y, then horizontal to child.x.
          // This keeps the horizontal segment off to the right of parent, where labels won't get crossed.
          const d = `M ${p.x},${p.y} V ${c.y} H ${c.x}`;
          return (
            <path key={child}
              d={d}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
              fill="none"
              opacity={dimmed ? 0.25 : 1}
              style={{ transition: 'opacity 150ms' }}
            />
          );
        })}
      </g>

      {/* Contradiction edges (curved overlays) */}
      {showContradict && (
        <g>
          {EDGES.filter(e => e.type === 'contradict').map((e, i) => {
            if (!positions[e.from] || !positions[e.to]) return null;
            const a = positions[e.from], b = positions[e.to];
            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;
            const len = Math.hypot(b.x - a.x, b.y - a.y);
            const offset = Math.min(40, len * 0.12);
            const dx = -(b.y - a.y) / len * offset;
            const dy =  (b.x - a.x) / len * offset;
            return (
              <g key={i}>
                <path
                  d={`M ${a.x},${a.y} Q ${mx + dx},${my + dy} ${b.x},${b.y}`}
                  stroke="var(--accent-orange)"
                  strokeWidth="1.2"
                  strokeDasharray="2 3"
                  fill="none"
                  opacity="0.55"
                />
              </g>
            );
          })}
        </g>
      )}

      {/* Nodes */}
      <g>
        {concepts.map(c => {
          const p = positions[c.id];
          if (!p) return null;
          const r = 4 + c.adoption * 5;
          const isSel = c.id === selectedId;
          const isHover = hover === c.id;
          const isFossil = c.state === 'deprecated' || c.state === 'archived';
          const inChain = ancestry.has(c.id);
          const dimmed = ancestry.size > 0 && !inChain;
          const agentColor = AGENT_COLOR_HEX[c.agent];

          // State styling
          const stateTone = STATE_TONE[c.state];

          return (
            <g key={c.id}
              className="tree-node-hit"
              opacity={dimmed ? 0.35 : 1}
              style={{ transition: 'opacity 150ms' }}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelect(c.id)}>

              {/* Selection ring */}
              {(isSel || isHover) && (
                <circle cx={p.x} cy={p.y} r={r + 7}
                  fill="none" stroke={agentColor}
                  strokeWidth="1" opacity={isSel ? 0.5 : 0.3}/>
              )}

              {/* Hit area */}
              <circle cx={p.x} cy={p.y} r={Math.max(r + 8, 12)} fill="transparent"/>

              {/* Node */}
              {isFossil ? (
                <circle cx={p.x} cy={p.y} r={r}
                  fill="var(--bg)" stroke="var(--text-dim)"
                  strokeWidth="1" strokeDasharray="1.5 2"/>
              ) : (
                <>
                  <circle cx={p.x} cy={p.y} r={r}
                    fill={agentColor}
                    stroke="var(--bg2)" strokeWidth="1.5"
                    filter="url(#soft-shadow)"/>
                  {(c.state === 'dominant') && (
                    <circle cx={p.x} cy={p.y} r={r + 2.5}
                      fill="none" stroke={agentColor} strokeWidth="1" opacity="0.45"/>
                  )}
                  {(c.state === 'contested') && (
                    <circle cx={p.x} cy={p.y} r={r + 3.5}
                      fill="none" stroke="var(--accent-orange)" strokeWidth="1"
                      strokeDasharray="2 2" opacity="0.75"/>
                  )}
                  {(c.state === 'resurrected') && (
                    <circle cx={p.x} cy={p.y} r={r + 2.5}
                      fill="none" stroke="var(--accent-blue)" strokeWidth="1.2"/>
                  )}
                </>
              )}

              {/* Label */}
              <text x={p.x + r + 9} y={p.y + 3}
                className={`t-node-label ${isFossil ? 'dim' : ''}`}>
                {c.name}
              </text>
              <text x={p.x + r + 9} y={p.y + 16} className="t-node-id">
                {c.id} · C{String(c.originCycle).padStart(2, '0')} · <tspan fill={stateTone.color}>{STATES[c.state].label.toUpperCase()}</tspan>
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ---------- Inspector ----------
function Inspector({ concept, lineage, layout }) {
  if (!concept) {
    return (
      <aside className="inspector-col">
        <div className="insp-card muted">
          <div className="insp-h">No concept selected</div>
          <div className="insp-desc">Click a node in the tree to inspect its lineage and rationale.</div>
        </div>
      </aside>
    );
  }
  const tone = STATE_TONE[concept.state];
  const parentId = layout.parentOf[concept.id];
  const parent = parentId ? CONCEPTS.find(c => c.id === parentId) : null;
  const children = layout.childrenOf[concept.id] || [];

  return (
    <aside className="inspector-col">
      <div className="insp-card">
        <div className="insp-h">Concept</div>
        <div className="insp-name">{concept.name}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="insp-id">{concept.id}</span>
          <span className="state-pill" style={{ background: tone.bg, color: tone.color }}>
            <span className="sw" style={{ background: tone.color }}></span>
            {STATES[concept.state].label}
          </span>
          <span className="agent-pill">
            <span className="sw" style={{ background: AGENT_COLOR_HEX[concept.agent] }}></span>
            {AGENTS[concept.agent].name}
          </span>
        </div>
        <p className="insp-desc">{concept.desc}</p>
      </div>

      <div className="insp-card muted">
        <div className="insp-h">Properties</div>
        <dl className="insp-kv">
          <dt>Origin</dt>
          <dd>Cycle {concept.originCycle}</dd>
          <dt>Adoption</dt>
          <dd>
            <span className="adoption-bar">
              <span className="bar"><span className="fill" style={{ width: `${concept.adoption * 100}%`, background: tone.color }}></span></span>
              <span className="num">{Math.round(concept.adoption * 100)}%</span>
            </span>
          </dd>
          <dt>Parent</dt>
          <dd>{parent ? <span><span className="insp-id">{parent.id}</span> · {parent.name}</span> : <span style={{ color: 'var(--text-dim)' }}>— root</span>}</dd>
          <dt>Children</dt>
          <dd>{children.length === 0 ? <span style={{ color: 'var(--text-dim)' }}>— leaf</span> : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {children.map(id => <span key={id} className="insp-id" style={{ background: 'var(--bg2)', padding: '2px 6px', borderRadius: 3 }}>{id}</span>)}
            </div>
          )}</dd>
        </dl>
      </div>

      <div className="insp-card muted">
        <div className="insp-h">Lineage · {lineage.length} event{lineage.length === 1 ? '' : 's'}</div>
        <div className="lineage-list">
          {lineage.length === 0 && (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>No recorded events.</div>
          )}
          {lineage.map(step => (
            <div key={step.id} className="lineage-row">
              <div>
                <div className="dot" style={{ borderColor: AGENT_COLOR_HEX[step.agent] }}></div>
                <div className="c-tag">C{String(step.id).padStart(2, '0')}</div>
              </div>
              <div className="lineage-body">
                <div className="lineage-evt">{step.evt} · {AGENTS[step.agent].name}</div>
                <div className="lineage-title">{step.title}</div>
                <div className="lineage-quote">"{step.rationale}"</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

window.TreeApp = TreeApp;
