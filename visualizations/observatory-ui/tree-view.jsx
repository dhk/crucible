/* global React, ReactDOM, AGENTS, STATES, CONCEPTS, EDGES, CYCLES, DOC */
// Tree View — Crucible Observatory · DHK light design system.
// Layout: depth-on-x phylogenetic tree, DFS leaf-slot y.

const { useState, useMemo, useEffect, useRef, useCallback } = React;

// ---- Agent color table (DHK palette) ----
const AGENT_HEX = {
  strawman:    '#16a34a',
  steelman:    '#2563eb',
  adversarial: '#d94f2a',
};

// ---- State tone table (light-mode colours) ----
const STATE_TONE = {
  seed:        { color: '#6b6860', bg: 'var(--state-seed-bg)' },
  emergent:    { color: '#a16207', bg: 'var(--state-emergent-bg)' },
  contested:   { color: '#d94f2a', bg: 'var(--state-contested-bg)' },
  adopted:     { color: '#16a34a', bg: 'var(--state-adopted-bg)' },
  dominant:    { color: '#15803d', bg: 'var(--state-dominant-bg)' },
  fragmented:  { color: '#7c3aed', bg: 'var(--state-fragmented-bg)' },
  deprecated:  { color: '#9c9a94', bg: 'var(--state-deprecated-bg)' },
  archived:    { color: '#9c9a94', bg: 'var(--state-deprecated-bg)' },
  resurrected: { color: '#0891b2', bg: 'var(--state-resurrected-bg)' },
};

// ============================================================
// §9 — Tree layout algorithm
// x = depth × levelGap  (topology, not time)
// y = DFS leaf-slot × rowGap  (with +0.6 gap between roots)
// ============================================================
function buildTreeLayout(concepts, edges, { padX, padY, levelGap, rowGap }) {
  // Build a lookup: concept id → originCycle
  const cycleOf = Object.fromEntries(concepts.map(c => [c.id, c.originCycle]));

  // --- Parent derivation (§9) ---
  // For each concept: inbound support/mutation edges where source.originCycle < c.originCycle
  // Sort by source.originCycle descending → pick the most-recent earlier predecessor.
  const parentOf = {};
  concepts.forEach(c => {
    const inbound = edges
      .filter(e =>
        e.to === c.id &&
        (e.type === 'support' || e.type === 'mutation') &&
        cycleOf[e.from] != null &&
        cycleOf[e.from] < c.originCycle
      );
    inbound.sort((a, b) => cycleOf[b.from] - cycleOf[a.from]);
    if (inbound.length > 0) parentOf[c.id] = inbound[0].from;
  });

  // Manual shape hints for ambiguous/cycle cases in the mock data
  const HINTS = {
    C16: 'C15', C17: 'C15',
    C14: 'C13', C22: 'C10',
    C19: 'C18', C20: 'C13',
    C21: 'C03', C02: 'C01',
    C24: 'C10', C23: 'C02',
    C05: 'C02', C03: 'C02',
    C11: 'C01', C12: 'C03',
    C13: 'C07', C08: 'C05',
    C06: 'C05', C04: 'C03',
    C18: 'C05', C07: 'C08',
    C09: 'C08',
  };
  const ids = new Set(concepts.map(c => c.id));
  Object.entries(HINTS).forEach(([k, v]) => {
    if (ids.has(k) && ids.has(v)) parentOf[k] = v;
  });

  // --- Children lists ---
  const childrenOf = Object.fromEntries(concepts.map(c => [c.id, []]));
  Object.entries(parentOf).forEach(([child, parent]) => {
    if (childrenOf[parent]) childrenOf[parent].push(child);
  });

  // Children ordering (§9): originCycle ASC, adoption DESC, id ASC
  const conceptMap = Object.fromEntries(concepts.map(c => [c.id, c]));
  Object.values(childrenOf).forEach(arr => {
    arr.sort((a, b) => {
      const ca = conceptMap[a], cb = conceptMap[b];
      return (ca.originCycle - cb.originCycle) ||
             (cb.adoption   - ca.adoption) ||
             (a < b ? -1 : 1);
    });
  });

  // Roots: no parent, sorted by originCycle then id
  const roots = concepts
    .filter(c => !parentOf[c.id])
    .map(c => c.id)
    .sort((a, b) => {
      const ca = conceptMap[a], cb = conceptMap[b];
      return (ca.originCycle - cb.originCycle) || (a < b ? -1 : 1);
    });

  // Depth (x level) via BFS from roots
  const depthOf = {};
  function computeDepth(id, d) {
    depthOf[id] = d;
    (childrenOf[id] || []).forEach(c => computeDepth(c, d + 1));
  }
  roots.forEach(r => computeDepth(r, 0));

  // DFS leaf-slot y assignment
  // Leaves get sequential integer slots; internal nodes get midpoint of children.
  // +0.6 slot gap between root subtrees.
  let slot = 0;
  const slotOf = {};
  function dfs(id) {
    const ch = childrenOf[id] || [];
    if (ch.length === 0) {
      slotOf[id] = slot++;
      return slotOf[id];
    }
    const ys = ch.map(dfs);
    slotOf[id] = (ys[0] + ys[ys.length - 1]) / 2;
    return slotOf[id];
  }
  roots.forEach(r => { dfs(r); slot += 0.6; });

  const maxSlot  = Math.max(1, slot - 1);
  const maxDepth = Math.max(0, ...Object.values(depthOf));

  // Final pixel coordinates
  const positions = {};
  concepts.forEach(c => {
    positions[c.id] = {
      x: padX + (depthOf[c.id] ?? 0) * levelGap,
      y: padY + slotOf[c.id] * rowGap,
    };
  });

  const height = padY * 2 + maxSlot * rowGap;
  const width  = padX * 2 + (maxDepth + 1) * levelGap;

  return { positions, parentOf, childrenOf, roots, depthOf, maxDepth, height, width };
}


// ============================================================
// App root
// ============================================================
function TreeApp() {
  // ---- Core state ----
  const [selectedConceptId, setSelectedConceptId] = useState('C05');
  const [selectedCycleId,   setSelectedCycleId]   = useState(null);
  const [hoveredCycleId,    setHoveredCycleId]     = useState(null);
  const [showContradictions, setShowContradictions] = useState(true);
  const [showDeadEnds,       setShowDeadEnds]       = useState(true);
  const [dimmedAgents,       setDimmedAgents]       = useState(new Set());
  const [playing,            setPlaying]            = useState(false);
  const playRef = useRef(null);

  // Filter concepts (dead ends = deprecated/archived)
  const concepts = useMemo(
    () => CONCEPTS.filter(c =>
      showDeadEnds || (c.state !== 'deprecated' && c.state !== 'archived')
    ),
    [showDeadEnds]
  );

  // Layout constants
  const PAD_X = 60, PAD_Y = 50, LEVEL_GAP = 150, ROW_GAP = 40;
  const layout = useMemo(
    () => buildTreeLayout(concepts, EDGES, {
      padX: PAD_X, padY: PAD_Y,
      levelGap: LEVEL_GAP, rowGap: ROW_GAP,
    }),
    [concepts]
  );
  const SVG_W = Math.max(1100, layout.width  + 160);
  const SVG_H = Math.max(640,  layout.height + 40);

  // Selected concept
  const selectedConcept = CONCEPTS.find(c => c.id === selectedConceptId) || null;

  // Lineage events for selected concept
  const lineage = useMemo(() => {
    if (!selectedConcept) return [];
    return CYCLES
      .filter(cy =>
        cy.added.includes(selectedConcept.id) ||
        cy.mutated.includes(selectedConcept.id) ||
        cy.removed.includes(selectedConcept.id)
      )
      .map(cy => ({
        ...cy,
        evt: cy.added.includes(selectedConcept.id)   ? 'introduced'
           : cy.mutated.includes(selectedConcept.id) ? 'mutated'
           :                                            'removed',
      }));
  }, [selectedConcept]);

  // Ancestry chain for highlight
  const ancestry = useMemo(() => {
    const chain = new Set();
    if (!selectedConcept) return chain;
    let cur = selectedConcept.id;
    chain.add(cur);
    while (layout.parentOf[cur]) { cur = layout.parentOf[cur]; chain.add(cur); }
    return chain;
  }, [selectedConcept, layout]);

  // ---- Play controls ----
  const stopPlay = useCallback(() => {
    setPlaying(false);
    if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
  }, []);

  const togglePlay = useCallback(() => {
    setPlaying(prev => {
      if (prev) { stopPlay(); return false; }
      // Advance selectedCycleId every 1.5s
      playRef.current = setInterval(() => {
        setSelectedCycleId(cur => {
          const idx = CYCLES.findIndex(c => c.id === cur);
          if (idx === -1 || idx >= CYCLES.length - 1) { stopPlay(); return CYCLES[CYCLES.length - 1].id; }
          return CYCLES[idx + 1].id;
        });
      }, 1500);
      if (!selectedCycleId) setSelectedCycleId(CYCLES[0].id);
      return true;
    });
  }, [selectedCycleId, stopPlay]);

  const prevCycle = useCallback(() => {
    setSelectedCycleId(cur => {
      if (!cur) return CYCLES[CYCLES.length - 1].id;
      const idx = CYCLES.findIndex(c => c.id === cur);
      return idx > 0 ? CYCLES[idx - 1].id : CYCLES[0].id;
    });
  }, []);
  const nextCycle = useCallback(() => {
    setSelectedCycleId(cur => {
      if (!cur) return CYCLES[0].id;
      const idx = CYCLES.findIndex(c => c.id === cur);
      return idx < CYCLES.length - 1 ? CYCLES[idx + 1].id : CYCLES[CYCLES.length - 1].id;
    });
  }, []);

  // ---- §12 Keyboard shortcuts ----
  useEffect(() => {
    function onKey(e) {
      // Ignore if focus is in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prevCycle(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nextCycle(); }
      if (e.key === ' ')          { e.preventDefault(); togglePlay(); }
      if (e.key === 'Escape')     { e.preventDefault(); setSelectedConceptId(null); stopPlay(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prevCycle, nextCycle, togglePlay, stopPlay]);

  // Cleanup play timer on unmount
  useEffect(() => () => { if (playRef.current) clearInterval(playRef.current); }, []);

  // ---- Agent dim toggle ----
  const toggleAgent = useCallback((agentId) => {
    setDimmedAgents(prev => {
      const next = new Set(prev);
      next.has(agentId) ? next.delete(agentId) : next.add(agentId);
      return next;
    });
  }, []);

  // ---- Derived stats ----
  const agentCounts = useMemo(() => {
    const m = {};
    CONCEPTS.forEach(c => { m[c.agent] = (m[c.agent] || 0) + 1; });
    return m;
  }, []);
  const stateCounts = useMemo(() => {
    const m = {};
    CONCEPTS.forEach(c => { m[c.state] = (m[c.state] || 0) + 1; });
    return m;
  }, []);

  // Current cycle object
  const currentCycle = CYCLES.find(c => c.id === selectedCycleId) || null;
  const cycleIndex   = currentCycle ? CYCLES.indexOf(currentCycle) : -1;

  return (
    <div className="app-shell">

      {/* ===== TOPBAR ===== */}
      <header className="topbar">
        <div className="brand">
          Crucible
          <span className="brand-sub">Observatory</span>
        </div>
        <div className="crumb">
          <span>docs/active</span>
          <span className="slash">/</span>
          <span className="doc">{DOC.path.split('/').pop()}</span>
        </div>
        <div className="status-pills">
          <span className="status-pill green">
            <span className="sw"></span>
            {DOC.status}
          </span>
          <span className="status-pill">
            {Math.round(DOC.convergence * 100)}% convergence
          </span>
          <span className="status-pill">
            cycle {DOC.cycles}
          </span>
        </div>
        <nav className="nav-tabs">
          <button className="nav-tab">Timeline</button>
          <button className="nav-tab active">Concept Tree</button>
          <button className="nav-tab">Branches</button>
          <button className="nav-tab">Agents</button>
          <button className="nav-tab">Islands</button>
        </nav>
      </header>

      {/* ===== LEFT RAIL ===== */}
      <aside className="left-rail">

        {/* Document stats */}
        <section>
          <div className="rail-section-title">Document</div>
          <div className="doc-stats">
            <div className="doc-stat"><span className="label">Concepts</span><span className="val">{DOC.concepts}</span></div>
            <div className="doc-stat"><span className="label">Cycles</span><span className="val">{DOC.cycles}</span></div>
            <div className="doc-stat"><span className="label">Branches</span><span className="val">{DOC.branches}</span></div>
            <div className="doc-stat"><span className="label">Dead ends</span><span className="val">{DOC.deadEnds}</span></div>
            <div className="doc-stat"><span className="label">Mutations</span><span className="val">{DOC.mutations}</span></div>
          </div>
        </section>

        {/* Agent legend — click to dim */}
        <section>
          <div className="rail-section-title">Agents · click to dim</div>
          <div className="agent-legend">
            {Object.values(AGENTS).map(a => (
              <div key={a.id}
                className={`agent-row${dimmedAgents.has(a.id) ? ' dimmed' : ''}`}
                onClick={() => toggleAgent(a.id)}>
                <span className="sw" style={{ background: AGENT_HEX[a.id] }}></span>
                <span className="name">{a.name}</span>
                <span className="cnt">{agentCounts[a.id] || 0}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Lifecycle legend */}
        <section>
          <div className="rail-section-title">Lifecycle</div>
          <div className="lifecycle-legend">
            {['dominant','adopted','contested','emergent','fragmented','resurrected','deprecated'].map(s => {
              const tone = STATE_TONE[s];
              return (
                <div key={s} className="lifecycle-row">
                  <span className="sw" style={{ background: tone.color, opacity: s === 'deprecated' ? 0.4 : 1 }}></span>
                  <span className="name">{STATES[s].label}</span>
                  <span className="cnt">{stateCounts[s] || 0}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* View toggles */}
        <div className="rail-toggles">
          <button
            className={`chip-toggle${showDeadEnds ? ' active' : ''}`}
            onClick={() => setShowDeadEnds(v => !v)}>
            <span className="sw" style={{ background: 'var(--text-mute)', opacity: 0.5 }}></span>
            Dead ends
          </button>
          <button
            className={`chip-toggle${showContradictions ? ' active' : ''}`}
            onClick={() => setShowContradictions(v => !v)}>
            <span className="sw" style={{ background: 'var(--accent-orange)' }}></span>
            Contradictions
          </button>
        </div>

      </aside>

      {/* ===== CANVAS ===== */}
      <main className="canvas-area">
        <div className="tree-svg-wrap">
          <TreeCanvas
            width={SVG_W}
            height={SVG_H}
            concepts={concepts}
            layout={layout}
            selectedConceptId={selectedConceptId}
            ancestry={ancestry}
            dimmedAgents={dimmedAgents}
            showContradictions={showContradictions}
            onSelectConcept={setSelectedConceptId}
          />
        </div>
      </main>

      {/* ===== INSPECTOR ===== */}
      <aside className="inspector">
        <Inspector
          concept={selectedConcept}
          lineage={lineage}
          layout={layout}
        />
      </aside>

      {/* ===== BOTTOM TIMELINE ===== */}
      <footer className="bottom-timeline">
        <div className="play-controls">
          <button className="play-btn" title="Previous cycle (←)" onClick={prevCycle}>‹</button>
          <button className={`play-btn primary`} title="Play/pause (Space)" onClick={togglePlay}>
            {playing ? '⏸' : '▶'}
          </button>
          <button className="play-btn" title="Next cycle (→)" onClick={nextCycle}>›</button>
        </div>

        <div className="cycle-strip">
          {CYCLES.map(cy => {
            const agentColor = AGENT_HEX[cy.agent];
            const isSel = selectedCycleId === cy.id;
            return (
              <div
                key={cy.id}
                className={`cycle-dot-wrap${isSel ? ' selected' : ''}`}
                title={`Cycle ${cy.id} · ${cy.title}`}
                onMouseEnter={() => setHoveredCycleId(cy.id)}
                onMouseLeave={() => setHoveredCycleId(null)}
                onClick={() => setSelectedCycleId(isSel ? null : cy.id)}>
                <div
                  className="cycle-dot"
                  style={isSel ? {} : { borderColor: agentColor, opacity: 0.7 }}>
                </div>
                <span className="cycle-dot-label">C{String(cy.id).padStart(2,'0')}</span>
              </div>
            );
          })}
        </div>

        {currentCycle ? (
          <div className="cycle-info">
            C{String(currentCycle.id).padStart(2,'0')} · {currentCycle.title}
          </div>
        ) : (
          <div className="cycle-info" style={{ color: 'var(--text-faint)' }}>
            ← / → navigate · Space play · Esc clear
          </div>
        )}
      </footer>

    </div>
  );
}


// ============================================================
// Tree Canvas SVG
// ============================================================
function TreeCanvas({
  width, height, concepts, layout,
  selectedConceptId, ancestry, dimmedAgents,
  showContradictions, onSelectConcept,
}) {
  const [hover, setHover] = useState(null);
  const { positions, parentOf, maxDepth } = layout;

  // Generation axis positions
  const genX = d => 60 + d * 150;
  const totalGen = maxDepth + 1;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ display: 'block', minWidth: width }}>

      <defs>
        <pattern id="dhk-dot-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="rgba(0,0,0,0.07)"/>
        </pattern>
        <filter id="dhk-shadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.09)"/>
        </filter>
      </defs>

      {/* Background dot grid */}
      <rect x="0" y="0" width={width} height={height} fill="url(#dhk-dot-grid)" opacity="0.7"/>

      {/* Generation axis (depth columns) */}
      <g>
        <line x1={40} y1={36} x2={width - 20} y2={36} stroke="rgba(0,0,0,0.07)" strokeWidth="1"/>
        {Array.from({ length: totalGen }).map((_, d) => (
          <g key={d}>
            <line
              x1={genX(d)} y1={36}
              x2={genX(d)} y2={height - 20}
              stroke="rgba(0,0,0,0.04)" strokeWidth="1"/>
            <text
              x={genX(d)} y={24}
              textAnchor="middle"
              className="t-gen-label">
              GEN {String(d).padStart(2,'0')}
            </text>
          </g>
        ))}
      </g>

      {/* ---- Lineage edges (bend-at-parent, §9) ----
          path: M px,py  V cy  H cx
          Leave parent vertically, then turn right toward child.
      */}
      <g>
        {Object.entries(parentOf).map(([child, parent]) => {
          const p = positions[parent], c = positions[child];
          if (!p || !c) return null;
          const edge = EDGES.find(e => e.from === parent && e.to === child) ||
                       EDGES.find(e => e.to === parent && e.from === child);
          const isMutation = edge && edge.type === 'mutation';
          const inChain = ancestry.has(child) && ancestry.has(parent);
          const dimByAncestry = ancestry.size > 0 && !inChain;
          const parentConcept = concepts.find(c => c.id === parent);
          const dimByAgent = parentConcept && dimmedAgents.has(parentConcept.agent);
          const dimmed = dimByAncestry || dimByAgent;

          const stroke = inChain
            ? 'var(--accent)'
            : isMutation
              ? 'var(--accent-purple)'
              : 'rgba(0,0,0,0.14)';
          const sw   = inChain ? 2 : 1.2;
          const dash = isMutation ? '4 4' : 'none';

          return (
            <path
              key={child}
              d={`M ${p.x},${p.y} V ${c.y} H ${c.x}`}
              stroke={stroke}
              strokeWidth={sw}
              strokeDasharray={dash}
              fill="none"
              opacity={dimmed ? 0.18 : 1}
              style={{ transition: 'opacity 150ms' }}
            />
          );
        })}
      </g>

      {/* ---- Nodes ---- */}
      <g>
        {concepts.map(c => {
          const p = positions[c.id];
          if (!p) return null;
          const r = 4 + c.adoption * 5;
          const isSel   = c.id === selectedConceptId;
          const isHover = hover === c.id;
          const isFossil = c.state === 'deprecated' || c.state === 'archived';
          const inChain  = ancestry.has(c.id);
          const dimByAncestry = ancestry.size > 0 && !inChain;
          const dimByAgent    = dimmedAgents.has(c.agent);
          const dimmed   = dimByAncestry || dimByAgent;
          const agentColor = AGENT_HEX[c.agent];
          const stateTone  = STATE_TONE[c.state] || STATE_TONE.seed;

          return (
            <g
              key={c.id}
              className="tree-node-hit"
              opacity={dimmed ? 0.28 : 1}
              style={{ transition: 'opacity 150ms' }}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelectConcept(c.id === selectedConceptId ? null : c.id)}>

              {/* Selection / hover ring */}
              {(isSel || isHover) && (
                <circle cx={p.x} cy={p.y} r={r + 7}
                  fill="none" stroke={agentColor}
                  strokeWidth="1.5" opacity={isSel ? 0.55 : 0.3}/>
              )}

              {/* Invisible hit target */}
              <circle cx={p.x} cy={p.y} r={Math.max(r + 8, 13)} fill="transparent"/>

              {/* Node body */}
              {isFossil ? (
                <circle cx={p.x} cy={p.y} r={r}
                  fill="var(--bg)" stroke="var(--text-mute)"
                  strokeWidth="1.2" strokeDasharray="2 2"/>
              ) : (
                <>
                  <circle cx={p.x} cy={p.y} r={r}
                    fill={agentColor}
                    stroke="var(--bg)" strokeWidth="1.5"
                    filter="url(#dhk-shadow)"/>
                  {c.state === 'dominant' && (
                    <circle cx={p.x} cy={p.y} r={r + 3}
                      fill="none" stroke={agentColor} strokeWidth="1" opacity="0.4"/>
                  )}
                  {c.state === 'contested' && (
                    <circle cx={p.x} cy={p.y} r={r + 3.5}
                      fill="none" stroke="var(--accent-orange)"
                      strokeWidth="1" strokeDasharray="2 2" opacity="0.7"/>
                  )}
                  {c.state === 'resurrected' && (
                    <circle cx={p.x} cy={p.y} r={r + 3}
                      fill="none" stroke="var(--accent-cyan)" strokeWidth="1.2"/>
                  )}
                </>
              )}

              {/* Labels — halo via paint-order (§9) */}
              <text
                x={p.x + r + 9}
                y={p.y + 3}
                className={`t-node-label${isFossil ? ' dim' : ''}`}>
                {c.name}
              </text>
              <text
                x={p.x + r + 9}
                y={p.y + 15}
                className="t-node-id">
                {c.id} · <tspan fill={stateTone.color}>{(STATES[c.state]?.label || c.state).toUpperCase()}</tspan>
              </text>

            </g>
          );
        })}
      </g>

      {/* ---- Contradiction arcs (drawn last, on top) ----
          Quadratic bezier curving above the tree.
          Control point y = min(fromY, toY) - 60
      */}
      {showContradictions && (
        <g>
          {EDGES.filter(e => e.type === 'contradict').map((e, i) => {
            const a = positions[e.from], b = positions[e.to];
            if (!a || !b) return null;
            const cx = (a.x + b.x) / 2;
            const cy = Math.min(a.y, b.y) - 60;
            return (
              <path
                key={i}
                d={`M ${a.x},${a.y} Q ${cx},${cy} ${b.x},${b.y}`}
                stroke="var(--accent-orange)"
                strokeWidth="1.5"
                strokeDasharray="3 4"
                fill="none"
                opacity="0.7"
              />
            );
          })}
        </g>
      )}

    </svg>
  );
}


// ============================================================
// Inspector panel
// ============================================================
function Inspector({ concept, lineage, layout }) {
  if (!concept) {
    return (
      <div className="insp-empty">
        <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.3 }}>⬡</div>
        <div>Click a node to inspect</div>
        <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-faint)' }}>
          Esc to clear · ←/→ navigate cycles
        </div>
      </div>
    );
  }

  const tone    = STATE_TONE[concept.state] || STATE_TONE.seed;
  const parentId = layout.parentOf[concept.id];
  const parent   = parentId ? CONCEPTS.find(c => c.id === parentId) : null;
  const children = layout.childrenOf[concept.id] || [];

  return (
    <>
      {/* Identity */}
      <div className="insp-section">
        <div className="insp-h">Concept</div>
        <div className="insp-name">{concept.name}</div>
        <div className="insp-badges">
          <span className="insp-id">{concept.id}</span>
          <span className="state-pill" style={{ background: tone.bg, color: tone.color }}>
            <span className="sw" style={{ background: tone.color }}></span>
            {STATES[concept.state]?.label || concept.state}
          </span>
          <span className="agent-pill">
            <span className="sw" style={{ background: AGENT_HEX[concept.agent] }}></span>
            {AGENTS[concept.agent]?.name || concept.agent}
          </span>
        </div>
        <p className="insp-desc">{concept.desc}</p>
      </div>

      {/* Properties */}
      <div className="insp-section">
        <div className="insp-h">Properties</div>
        <dl className="insp-kv">
          <dt>Origin</dt>
          <dd>Cycle {concept.originCycle}</dd>

          <dt>Adoption</dt>
          <dd>
            <span className="adoption-bar">
              <span className="bar">
                <span className="fill" style={{ width: `${concept.adoption * 100}%`, background: tone.color }}></span>
              </span>
              <span className="num">{Math.round(concept.adoption * 100)}%</span>
            </span>
          </dd>

          <dt>Parent</dt>
          <dd>
            {parent
              ? <span><span className="insp-id">{parent.id}</span> · {parent.name}</span>
              : <span style={{ color: 'var(--text-mute)' }}>— root</span>
            }
          </dd>

          <dt>Children</dt>
          <dd>
            {children.length === 0
              ? <span style={{ color: 'var(--text-mute)' }}>— leaf</span>
              : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {children.map(id => (
                    <span key={id} className="insp-id"
                      style={{ background: 'var(--bg2)', padding: '1px 5px', borderRadius: 3 }}>
                      {id}
                    </span>
                  ))}
                </div>
              )
            }
          </dd>
        </dl>
      </div>

      {/* Lineage timeline */}
      <div className="insp-section">
        <div className="insp-h">Lineage · {lineage.length} event{lineage.length !== 1 ? 's' : ''}</div>
        <div className="lineage-list">
          {lineage.length === 0 && (
            <div style={{ color: 'var(--text-mute)', fontSize: 11 }}>No recorded events.</div>
          )}
          {lineage.map(step => (
            <div key={step.id} className="lineage-row">
              <div>
                <div className="dot" style={{ borderColor: AGENT_HEX[step.agent] }}></div>
              </div>
              <div className="lineage-body">
                <div className="lineage-cycle">C{String(step.id).padStart(2,'0')} · {step.at}</div>
                <div className="lineage-evt">{step.evt} · {AGENTS[step.agent]?.name}</div>
                <div className="lineage-title">{step.title}</div>
                <div className="lineage-quote">"{step.rationale}"</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

window.TreeApp = TreeApp;
