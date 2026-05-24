/* global React, AGENTS, STATES, CONCEPTS, EDGES, CYCLES, ISLANDS */
// Concept Graph — centerpiece visualization (spec §4 full implementation).
// Ancestry-chain selection, edge types, glow filter, island bands, fossil nodes.

const { useState, useMemo, useCallback } = React;

function ConceptGraph({
  selectedId,
  onSelect,
  hoveredCycle = null,
  showDeadEnds = true,
  showIslands = true,
  density = 'comfortable',
  agentFilter = null,
}) {
  const [hover, setHover] = useState(null);

  const VW = 1000, VH = 640;

  // ── Helpers ──────────────────────────────────────────────────────────────

  const radiusFor = (c) => {
    const base = density === 'dense' ? 6 : 8;
    const scale = density === 'dense' ? 10 : 14;
    return base + c.adoption * scale;
  };

  const colorFor = (c) => {
    if (c.state === 'deprecated' || c.state === 'archived') return 'transparent';
    if (c.state === 'contested')   return 'var(--accent-orange, #fb7185)';
    if (c.state === 'resurrected') return 'var(--accent-cyan, #22d3ee)';
    if (c.state === 'fragmented')  return 'var(--accent-purple, #c084fc)';
    return AGENTS[c.agent] ? AGENTS[c.agent].color : '#9ca3af';
  };

  const isFossil = (c) => c.state === 'deprecated' || c.state === 'archived';

  // ── Ancestry chain computation ────────────────────────────────────────────
  // Walk inbound support + mutation edges recursively back to roots.
  const ancestryChain = useMemo(() => {
    if (!selectedId) return null;
    const nodeSet = new Set([selectedId]);
    const edgeSet = new Set();

    // Build adjacency: who points TO a given node via support/mutation?
    const inbound = {};
    EDGES.forEach((e, idx) => {
      if (e.type === 'support' || e.type === 'mutation') {
        if (!inbound[e.to]) inbound[e.to] = [];
        inbound[e.to].push({ from: e.from, edgeIdx: idx });
      }
    });

    // BFS from selectedId backwards through support/mutation
    const queue = [selectedId];
    while (queue.length) {
      const cur = queue.shift();
      const parents = inbound[cur] || [];
      parents.forEach(({ from, edgeIdx }) => {
        edgeSet.add(edgeIdx);
        if (!nodeSet.has(from)) {
          nodeSet.add(from);
          queue.push(from);
        }
      });
    }

    // Also include outbound support/mutation edges from selected node
    EDGES.forEach((e, idx) => {
      if (e.from === selectedId && (e.type === 'support' || e.type === 'mutation')) {
        edgeSet.add(idx);
        nodeSet.add(e.to);
      }
    });

    return { nodes: nodeSet, edges: edgeSet };
  }, [selectedId]);

  // ── Filtered concept list ─────────────────────────────────────────────────
  const concepts = useMemo(() => {
    return CONCEPTS.filter(c => {
      if (!showDeadEnds && isFossil(c)) return false;
      return true;
    });
  }, [showDeadEnds]);

  const conceptById = useMemo(() =>
    Object.fromEntries(concepts.map(c => [c.id, c])), [concepts]);

  const edges = useMemo(() =>
    EDGES.map((e, i) => ({ ...e, _idx: i }))
         .filter(e => conceptById[e.from] && conceptById[e.to]),
    [conceptById]);

  // ── Opacity logic ─────────────────────────────────────────────────────────
  const nodeOpacity = useCallback((c) => {
    // hoveredCycle: dim nodes not in that cycle
    if (hoveredCycle != null) {
      const cyc = CYCLES.find(cy => cy.id === hoveredCycle);
      if (cyc) {
        const inCycle = (cyc.added || []).includes(c.id) ||
                        (cyc.mutated || []).includes(c.id) ||
                        (cyc.removed || []).includes(c.id);
        if (!inCycle) return 0.18;
      }
    }
    // agentFilter
    if (agentFilter && c.agent !== agentFilter) return 0.20;
    // ancestry selection
    if (ancestryChain) {
      if (!ancestryChain.nodes.has(c.id)) return 0.18;
    }
    // fossil when showDeadEnds active: show at 60%
    if (isFossil(c)) return 0.60;
    return 1;
  }, [hoveredCycle, agentFilter, ancestryChain]);

  const edgeOpacity = useCallback((e) => {
    if (hoveredCycle != null) {
      return e.cycle === hoveredCycle ? 1 : 0.12;
    }
    if (ancestryChain) {
      return ancestryChain.edges.has(e._idx) ? 1 : 0.12;
    }
    return 1;
  }, [hoveredCycle, ancestryChain]);

  // ── Edge path ─────────────────────────────────────────────────────────────
  const edgePath = (from, to, type) => {
    const dx = to.x - from.x, dy = to.y - from.y;
    const len = Math.hypot(dx, dy) || 1;
    // perpendicular offset for curves
    const px = -dy / len, py = dx / len;
    const curve = type === 'contradict' ? 22 : type === 'mutation' ? 10 : 6;
    const mx = (from.x + to.x) / 2 + px * curve;
    const my = (from.y + to.y) / 2 + py * curve;
    return `M ${from.x},${from.y} Q ${mx},${my} ${to.x},${to.y}`;
  };

  const edgeStroke = (type) => {
    switch (type) {
      case 'support':    return 'var(--edge-support,    rgba(94,234,212,0.55))';
      case 'contradict': return 'var(--edge-contradict, rgba(251,113,133,0.60))';
      case 'mutation':   return 'var(--edge-mutation,   rgba(167,139,250,0.55))';
      case 'lineage':
      default:           return 'var(--edge-lineage,    rgba(255,255,255,0.15))';
    }
  };

  const edgeDash = (type) => {
    if (type === 'contradict') return '4 4';
    if (type === 'mutation')   return '2 3';
    return 'none';
  };

  const edgeWidth = (type) => {
    if (type === 'support')    return 1.5;
    if (type === 'contradict') return 1.5;
    if (type === 'mutation')   return 1;
    return 1;
  };

  // ── State ring logic ──────────────────────────────────────────────────────
  const renderStateRing = (c, r, color) => {
    if (c.state === 'dominant') {
      return (
        <circle
          cx={c.x} cy={c.y} r={r + 4}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.55}
        />
      );
    }
    if (c.state === 'contested') {
      return (
        <circle
          cx={c.x} cy={c.y} r={r + 4}
          fill="none"
          stroke="var(--accent-orange, #fb7185)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={0.75}
        />
      );
    }
    return null;
  };

  const handleNodeClick = useCallback((id) => {
    if (onSelect) onSelect(id);
  }, [onSelect]);

  return (
    <div className="graph-wrap">
      <div className="graph-bg-grid" />
      <svg
        className="graph-svg"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Spec §4: glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Stronger glow for selected/hovered */}
          <filter id="glow-strong" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Hatch pattern for island bands */}
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"/>
          </pattern>
          {/* Radial halos per agent / state */}
          <radialGradient id="haloTeal"   cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.50"/>
            <stop offset="100%" stopColor="#5eead4" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="haloViolet" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="haloCoral"  cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="haloCyan"   cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.50"/>
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="haloAmber"  cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="haloPurple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* ── Island bands ──────────────────────────────────────── */}
        {showIslands && ISLANDS.map((w, i) => {
          const top = 70 + i * 130;
          const height = 18 + w.severity * 16;
          return (
            <g key={w.id} opacity={0.75}>
              <rect
                x="0" y={top}
                width={VW} height={height}
                className="island-band"
                fill="url(#hatch)"
              />
              <text
                x="14"
                y={top + height / 2 + 4}
                className="island-label"
              >
                {w.id} · {w.name}
              </text>
            </g>
          );
        })}

        {/* ── Radial halos (behind edges + nodes) ──────────────── */}
        <g>
          {concepts.map(c => {
            const op = nodeOpacity(c);
            if (op < 0.3) return null;
            if (isFossil(c)) return null;
            const r = radiusFor(c);
            const haloR = r * 3.8;
            const haloId =
              c.state === 'resurrected' ? 'haloCyan'   :
              c.state === 'contested'   ? 'haloAmber'  :
              c.state === 'fragmented'  ? 'haloPurple' :
              c.agent  === 'strawman'   ? 'haloTeal'   :
              c.agent  === 'steelman'   ? 'haloViolet' :
              'haloCoral';
            return (
              <circle
                key={'halo-' + c.id}
                cx={c.x} cy={c.y} r={haloR}
                fill={`url(#${haloId})`}
                opacity={op * 0.85}
                style={{ pointerEvents: 'none' }}
              />
            );
          })}
        </g>

        {/* ── Edges ────────────────────────────────────────────── */}
        <g>
          {edges.map((e) => {
            const a = conceptById[e.from];
            const b = conceptById[e.to];
            const op = edgeOpacity(e);
            return (
              <path
                key={e._idx}
                d={edgePath(a, b, e.type)}
                stroke={edgeStroke(e.type)}
                strokeWidth={edgeWidth(e.type)}
                strokeDasharray={edgeDash(e.type)}
                fill="none"
                opacity={op}
                style={{ transition: 'opacity 200ms' }}
              />
            );
          })}
        </g>

        {/* ── Nodes ────────────────────────────────────────────── */}
        <g>
          {concepts.map(c => {
            const r       = radiusFor(c);
            const color   = colorFor(c);
            const op      = nodeOpacity(c);
            const isSelected = c.id === selectedId;
            const isHovered  = hover === c.id;
            const fossil     = isFossil(c);
            const useGlow    = isSelected || isHovered;

            return (
              <g
                key={c.id}
                opacity={op}
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 200ms',
                }}
                filter={useGlow ? 'url(#glow-strong)' : (op > 0.5 ? 'url(#glow)' : undefined)}
                onMouseEnter={() => setHover(c.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => handleNodeClick(c.id)}
              >
                {/* State ring: dominant outer ring or contested dashed ring */}
                {renderStateRing(c, r, color)}

                {/* Hover / selected glow ring */}
                {(isSelected || isHovered) && (
                  <circle
                    cx={c.x} cy={c.y} r={r + 6}
                    fill="none"
                    stroke={color === 'transparent' ? 'rgba(255,255,255,0.4)' : color}
                    strokeWidth={isSelected ? 1.5 : 1}
                    opacity={isSelected ? 0.9 : 0.5}
                  />
                )}

                {/* Core node circle */}
                <circle
                  cx={c.x} cy={c.y} r={r}
                  fill={fossil ? 'transparent' : color}
                  stroke={
                    fossil
                      ? 'rgba(255,255,255,0.28)'
                      : isSelected
                        ? 'rgba(255,255,255,0.5)'
                        : 'rgba(0,0,0,0.45)'
                  }
                  strokeWidth={fossil ? 1 : isSelected ? 1.5 : 0.75}
                  strokeDasharray={fossil ? '2 3' : 'none'}
                />

                {/* Dominant inner highlight */}
                {(c.state === 'dominant' || c.state === 'resurrected') && !fossil && (
                  <circle
                    cx={c.x - r * 0.28}
                    cy={c.y - r * 0.28}
                    r={r * 0.32}
                    fill="rgba(255,255,255,0.55)"
                    opacity={0.6}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* ── Labels ───────────────────────────────────────────── */}
        <g style={{ pointerEvents: 'none' }}>
          {concepts.map(c => {
            const r  = radiusFor(c);
            const op = nodeOpacity(c);
            // Show label at full if visible, skip if very dim and not hovered/selected
            if (op < 0.25 && hover !== c.id && c.id !== selectedId) return null;

            const isSelected = c.id === selectedId;
            const isHovered  = hover === c.id;
            const showId     = isHovered || isSelected;
            const fossil     = isFossil(c);

            const labelClass =
              fossil          ? 'node-label faint' :
              c.adoption < 0.5 ? 'node-label dim'  : 'node-label';

            const stateLabel = STATES[c.state] ? STATES[c.state].label.toUpperCase() : c.state.toUpperCase();

            return (
              <g key={'lbl-' + c.id} opacity={op}>
                <text
                  x={c.x}
                  y={c.y + r + 15}
                  textAnchor="middle"
                  className={labelClass}
                  style={{
                    fontSize: density === 'dense' ? '10px' : '12px',
                    paintOrder: 'stroke fill',
                    stroke: 'var(--bg-0, #06080c)',
                    strokeWidth: 3,
                    fill: fossil ? 'var(--text-dim, #5e6776)' : 'var(--text, #e8ecf2)',
                  }}
                >
                  {c.name}
                </text>
                {showId && (
                  <text
                    x={c.x}
                    y={c.y + r + 27}
                    textAnchor="middle"
                    className="node-id"
                    style={{
                      paintOrder: 'stroke fill',
                      stroke: 'var(--bg-0, #06080c)',
                      strokeWidth: 3,
                    }}
                  >
                    {c.id} · {stateLabel}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── Legend overlay ───────────────────────────────────────── */}
      <div style={{
        position: 'absolute', right: 16, bottom: 16,
        display: 'flex', flexDirection: 'column', gap: 7,
        padding: '10px 14px',
        background: 'rgba(10,13,18,0.72)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.10em', color: 'var(--text-dim,#5e6776)', fontWeight: 500, marginBottom: 2 }}>
          Edges
        </div>
        <LegendRow color="rgba(94,234,212,0.75)"  label="supports"    />
        <LegendRow color="rgba(251,113,133,0.75)" label="contradicts" dashed />
        <LegendRow color="rgba(167,139,250,0.75)" label="mutation"    dotted />
        <LegendRow color="rgba(255,255,255,0.20)" label="lineage"     />
      </div>
    </div>
  );
}

function LegendRow({ color, label, dashed, dotted }) {
  const dash = dotted ? '2 3' : dashed ? '4 4' : undefined;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 11, color: 'var(--text-mute,#97a0b0)' }}>
      <svg width="24" height="6" style={{ flexShrink: 0 }}>
        <line
          x1="0" y1="3" x2="24" y2="3"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={dash}
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}

window.ConceptGraph = ConceptGraph;
