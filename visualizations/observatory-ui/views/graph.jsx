/* global React, AGENTS, STATES, CONCEPTS, EDGES, ISLANDS */
// Concept Graph — the centerpiece visualization.
// Obsidian-style force-ish graph with glow halos. Positions are pre-baked.
// Renders concepts as glowing nodes, edges by type, and islands as faint horizontal bands.

const { useState, useMemo } = React;

function ConceptGraph({
  selectedId,
  onSelect,
  hoveredCycle = null,
  showDeadEnds = true,
  showIslands = true,
  density = 'comfortable',
  agentFilter = null, // null = all
}) {
  const [hover, setHover] = useState(null);

  const VW = 1000, VH = 640;

  // Filter concepts
  const concepts = useMemo(() => {
    return CONCEPTS.filter(c => {
      if (!showDeadEnds && c.state === 'deprecated') return false;
      if (agentFilter && c.agent !== agentFilter) return false;
      return true;
    });
  }, [showDeadEnds, agentFilter]);

  const conceptById = useMemo(() => Object.fromEntries(concepts.map(c => [c.id, c])), [concepts]);
  const edges = useMemo(() => EDGES.filter(e => conceptById[e.from] && conceptById[e.to]), [conceptById]);

  // Node radius by adoption
  const radiusFor = (c) => {
    const base = density === 'dense' ? 6 : 8;
    return base + c.adoption * (density === 'dense' ? 10 : 14);
  };

  // Color for node
  const colorFor = (c) => {
    if (c.state === 'deprecated' || c.state === 'archived') return 'rgba(255,255,255,0.18)';
    if (c.state === 'resurrected') return STATES.resurrected.color;
    if (c.state === 'contested') return STATES.contested.color;
    if (c.state === 'fragmented') return STATES.fragmented.color;
    if (c.state === 'emergent') return STATES.emergent.color;
    return AGENTS[c.agent].color;
  };

  const isDimmed = (c) => {
    if (hoveredCycle != null) {
      const inCycle = c.originCycle === hoveredCycle;
      return !inCycle;
    }
    if (selectedId) {
      if (c.id === selectedId) return false;
      // Neighbors of selected
      const neighbors = new Set([selectedId]);
      EDGES.forEach(e => {
        if (e.from === selectedId) neighbors.add(e.to);
        if (e.to === selectedId) neighbors.add(e.from);
      });
      return !neighbors.has(c.id);
    }
    return false;
  };

  const edgeColor = (type) => {
    switch (type) {
      case 'support':    return 'rgba(94, 234, 212, 0.45)';
      case 'contradict': return 'rgba(251, 113, 133, 0.55)';
      case 'mutation':   return 'rgba(167, 139, 250, 0.55)';
      case 'lineage':
      default:           return 'rgba(255, 255, 255, 0.10)';
    }
  };

  // Edge path — gentle curve based on midpoint perturbation
  const edgePath = (from, to, type) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    // perpendicular offset
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    const curve = type === 'contradict' ? 18 : 8;
    const cx = mx + px * curve;
    const cy = my + py * curve;
    return `M ${from.x},${from.y} Q ${cx},${cy} ${to.x},${to.y}`;
  };

  return (
    <div className="graph-wrap">
      <div className="graph-bg-grid"></div>
      <svg className="graph-svg" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="haloTeal"   cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#5eead4" stopOpacity="0.55"/><stop offset="100%" stopColor="#5eead4" stopOpacity="0"/></radialGradient>
          <radialGradient id="haloViolet" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5"/><stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/></radialGradient>
          <radialGradient id="haloCoral"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fb7185" stopOpacity="0.5"/><stop offset="100%" stopColor="#fb7185" stopOpacity="0"/></radialGradient>
          <radialGradient id="haloAmber"  cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45"/><stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/></radialGradient>
          <radialGradient id="haloCyan"   cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5"/><stop offset="100%" stopColor="#22d3ee" stopOpacity="0"/></radialGradient>

          <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          </pattern>
        </defs>

        {/* Islands — resistance bands behind everything */}
        {showIslands && ISLANDS.map((w, i) => {
          const top = 70 + i * 130;
          const height = 16 + w.severity * 14;
          return (
            <g key={w.id} opacity={0.7}>
              <rect x="0" y={top} width={VW} height={height} className="island-band" fill="url(#hatch)" />
              <text x="14" y={top + height / 2 + 3} className="island-label">{w.id} · {w.name}</text>
            </g>
          );
        })}

        {/* Edges */}
        <g>
          {edges.map((e, i) => {
            const a = conceptById[e.from], b = conceptById[e.to];
            const dimmed = (selectedId && e.from !== selectedId && e.to !== selectedId) ||
                           (hoveredCycle != null && e.cycle !== hoveredCycle);
            const isContradict = e.type === 'contradict';
            return (
              <path
                key={i}
                d={edgePath(a, b, e.type)}
                stroke={edgeColor(e.type)}
                strokeWidth={isContradict ? 1.2 : 1}
                strokeDasharray={isContradict ? '4 4' : (e.type === 'mutation' ? '2 3' : 'none')}
                fill="none"
                opacity={dimmed ? 0.12 : 1}
                style={{ transition: 'opacity 180ms' }}
              />
            );
          })}
        </g>

        {/* Halos */}
        <g>
          {concepts.map(c => {
            const dimmed = isDimmed(c);
            if (dimmed) return null;
            const r = radiusFor(c);
            const haloId = c.state === 'resurrected' ? 'haloCyan' :
                           c.state === 'contested' ? 'haloAmber' :
                           c.agent === 'strawman' ? 'haloTeal' :
                           c.agent === 'steelman' ? 'haloViolet' : 'haloCoral';
            const haloR = r * 3.5;
            return (
              <circle key={'h-' + c.id} cx={c.x} cy={c.y} r={haloR} fill={`url(#${haloId})`} opacity={c.state === 'deprecated' ? 0 : 0.85}/>
            );
          })}
        </g>

        {/* Nodes */}
        <g>
          {concepts.map(c => {
            const r = radiusFor(c);
            const color = colorFor(c);
            const dimmed = isDimmed(c);
            const isSelected = c.id === selectedId;
            const isHovered = hover === c.id;
            const isDeprecated = c.state === 'deprecated' || c.state === 'archived';

            return (
              <g
                key={c.id}
                style={{ cursor: 'pointer', opacity: dimmed ? 0.18 : 1, transition: 'opacity 180ms' }}
                onMouseEnter={() => setHover(c.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect && onSelect(c.id)}
              >
                {/* outer ring for selected */}
                {(isSelected || isHovered) && (
                  <circle cx={c.x} cy={c.y} r={r + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={isSelected ? 0.8 : 0.4}
                  />
                )}
                {/* core */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={r}
                  fill={isDeprecated ? 'transparent' : color}
                  stroke={isDeprecated ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.4)'}
                  strokeWidth={isDeprecated ? 1 : 0.5}
                  strokeDasharray={isDeprecated ? '2 3' : 'none'}
                />
                {/* inner highlight for dominant */}
                {(c.state === 'dominant' || c.state === 'resurrected') && (
                  <circle cx={c.x - r * 0.3} cy={c.y - r * 0.3} r={r * 0.35} fill="rgba(255,255,255,0.55)" opacity="0.6" />
                )}
                {/* state indicator: small ring offset for contested */}
                {c.state === 'contested' && (
                  <circle cx={c.x} cy={c.y} r={r + 3} fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" opacity="0.7"/>
                )}
              </g>
            );
          })}
        </g>

        {/* Labels — separate layer so they sit above */}
        <g>
          {concepts.map(c => {
            const r = radiusFor(c);
            const dimmed = isDimmed(c);
            if (dimmed && hover !== c.id) return null;
            const labelClass =
              c.state === 'deprecated' ? 'node-label faint' :
              c.adoption < 0.5 ? 'node-label dim' : 'node-label';
            return (
              <g key={'l-' + c.id} style={{ pointerEvents: 'none' }}>
                <text x={c.x} y={c.y + r + 14} textAnchor="middle" className={labelClass}>{c.name}</text>
                {(hover === c.id || c.id === selectedId) && (
                  <text x={c.x} y={c.y + r + 26} textAnchor="middle" className="node-id">{c.id} · {STATES[c.state].label.toUpperCase()}</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend overlay */}
      <div style={{
        position: 'absolute', right: 16, bottom: 16,
        display: 'flex', flexDirection: 'column', gap: 6,
        padding: '10px 12px',
        background: 'rgba(10, 13, 18, 0.7)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border-soft)',
        borderRadius: 8,
        fontSize: 10.5,
        color: 'var(--text-mute)',
      }}>
        <div className="uppercase faint" style={{ marginBottom: 2 }}>Edges</div>
        <LegendRow color="rgba(94, 234, 212, 0.7)" label="supports" />
        <LegendRow color="rgba(251, 113, 133, 0.7)" label="contradicts" dashed />
        <LegendRow color="rgba(167, 139, 250, 0.7)" label="mutation" dashed />
      </div>
    </div>
  );
}

function LegendRow({ color, label, dashed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="24" height="6">
        <line x1="0" y1="3" x2="24" y2="3" stroke={color} strokeWidth="1.5" strokeDasharray={dashed ? '3 3' : 'none'} />
      </svg>
      <span>{label}</span>
    </div>
  );
}

window.ConceptGraph = ConceptGraph;
