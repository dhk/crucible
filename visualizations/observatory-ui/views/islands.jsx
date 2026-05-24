/* global React, AGENTS, ISLANDS, DEAD_ENDS, CYCLES */
// Islands & Dead-Ends — geological strata metaphor.
// Islands rendered as horizontal strata (deeper = older, more persistent).
// Dead-ends shown as fossilized concepts in the side gallery.

function IslandsView() {
  const [highlightedIsland, setHighlightedIsland] = React.useState(null);
  const [hoveredIsland, setHoveredIsland] = React.useState(null);
  const [hoveredFossil, setHoveredFossil] = React.useState(null);

  const W = 800, H = 540;
  const SKY_H = 70;
  const STRATA_H = 96;

  // Generate pseudo-random fossil dot positions from dead-end id
  function fossilPos(d) {
    // Simple hash of the id character code sum
    const seed = d.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const x = 60 + ((seed * 37 + 11) % (W - 120));
    const y = 14 + ((seed * 53 + 7) % (SKY_H - 28));
    return { x, y };
  }

  // Find the island most relevant to a given dead-end (nearest cycle)
  function findNearestIsland(deadEnd) {
    let best = null, bestDist = Infinity;
    ISLANDS.forEach(island => {
      island.cycles.forEach(c => {
        const dist = Math.abs(c - deadEnd.cycle);
        if (dist < bestDist) {
          bestDist = dist;
          best = island.id;
        }
      });
    });
    return best;
  }

  function handleDeadEndClick(d) {
    const islandId = findNearestIsland(d);
    setHighlightedIsland(prev => prev === islandId ? null : islandId);
  }

  const bedrockY = SKY_H + ISLANDS.length * STRATA_H;

  return (
    <div className="islands-stage">
      {/* Left — strata canvas */}
      <div className="strata-canvas">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="strata-hatch-1" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(35)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
            </pattern>
            <pattern id="strata-hatch-2" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-25)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
            </pattern>
            <pattern id="strata-hatch-3" patternUnits="userSpaceOnUse" width="10" height="10">
              <circle cx="2" cy="2" r="0.7" fill="rgba(255,255,255,0.08)"/>
              <circle cx="7" cy="6" r="0.5" fill="rgba(255,255,255,0.05)"/>
            </pattern>
            <pattern id="strata-hatch-4" patternUnits="userSpaceOnUse" width="14" height="6">
              <line x1="0" y1="3" x2="14" y2="3" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" strokeWidth="1"/>
            </pattern>
            <filter id="fossil-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Sky region */}
          <rect x="0" y="0" width={W} height={SKY_H} fill="rgba(94, 234, 212, 0.025)"/>
          <text x={W / 2} y={22} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.15em"
            fill="var(--text-dim)">
            SURFACE · ACTIVE DEBATE
          </text>
          <line x1="0" y1={SKY_H} x2={W} y2={SKY_H}
            stroke="rgba(255,255,255,0.12)" strokeWidth={1}/>

          {/* Fossil drift dots — dead-ends positioned in sky */}
          {DEAD_ENDS.map(d => {
            const { x, y } = fossilPos(d);
            const isHovered = hoveredFossil === d.id;
            return (
              <g key={d.id} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredFossil(d.id)}
                onMouseLeave={() => setHoveredFossil(null)}
              >
                <circle
                  cx={x} cy={y} r={isHovered ? 6 : 4}
                  fill="none"
                  stroke={isHovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  filter={isHovered ? 'url(#fossil-glow)' : undefined}
                />
                <circle
                  cx={x} cy={y} r={2}
                  fill={isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}
                />
                {/* Mono id label */}
                <text x={x} y={y - 8} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="7.5"
                  fill="var(--text-dim)" opacity={isHovered ? 1 : 0}
                  style={{ transition: 'opacity 120ms' }}
                >
                  {d.id}
                </text>
                {/* Tooltip on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={Math.min(x - 80, W - 175)} y={y + 10}
                      width={170} height={36}
                      rx={4}
                      fill="var(--surface-3)"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={1}
                    />
                    <text
                      x={Math.min(x - 80, W - 175) + 8}
                      y={y + 24}
                      fontFamily="var(--font-sans)" fontSize="10"
                      fill="var(--text-mute)"
                    >
                      {d.name.length > 22 ? d.name.slice(0, 22) + '…' : d.name}
                    </text>
                    <text
                      x={Math.min(x - 80, W - 175) + 8}
                      y={y + 38}
                      fontFamily="var(--font-mono)" fontSize="9"
                      fill="var(--text-dim)"
                    >
                      {d.id} · C{String(d.cycle).padStart(2,'0')}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Island strata */}
          {ISLANDS.map((island, i) => {
            const top = SKY_H + i * STRATA_H;
            const pattern = `url(#strata-hatch-${(i % 4) + 1})`;
            const baseColor = i === 0 ? 'rgba(120,130,150,0.06)' :
                              i === 1 ? 'rgba(100,110,130,0.08)' :
                              i === 2 ? 'rgba(80,90,110,0.10)'  :
                                        'rgba(60,70,90,0.12)';
            const isHighlighted = highlightedIsland === island.id;
            const isHovered = hoveredIsland === island.id;

            return (
              <g key={island.id}
                onMouseEnter={() => setHoveredIsland(island.id)}
                onMouseLeave={() => setHoveredIsland(null)}
                style={{ cursor: 'default' }}
              >
                {/* Base fill */}
                <rect x="0" y={top} width={W} height={STRATA_H} fill={baseColor}/>
                <rect x="0" y={top} width={W} height={STRATA_H} fill={pattern}/>

                {/* Highlighted left border */}
                {isHighlighted && (
                  <rect x="0" y={top} width={3} height={STRATA_H}
                    fill="#fb7185"
                    style={{ filter: 'drop-shadow(0 0 6px #fb7185)' }}
                  />
                )}

                {/* Hover glow overlay */}
                {isHovered && (
                  <rect x="0" y={top} width={W} height={STRATA_H}
                    fill="rgba(255,255,255,0.015)"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Top edge */}
                <line x1="0" y1={top} x2={W} y2={top}
                  stroke={isHighlighted ? 'rgba(251,113,133,0.25)' : 'rgba(255,255,255,0.05)'}
                  strokeWidth={isHighlighted ? 1.5 : 1}
                />

                {/* Island ID */}
                <text x={24} y={top + 20}
                  fontFamily="var(--font-mono)" fontSize="10"
                  fill="var(--text-faint)" letterSpacing="0.08em">
                  {island.id}
                </text>

                {/* Island name */}
                <text x={24} y={top + 40}
                  fontFamily="var(--font-sans)" fontSize="15"
                  fill="var(--text)" fontWeight={500}>
                  {island.name}
                </text>

                {/* Description (clipped) */}
                <foreignObject x={24} y={top + 46} width={W - 250} height={46}>
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11.5,
                    color: 'var(--text-mute)',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {island.desc}
                  </div>
                </foreignObject>

                {/* Right side: severity meter */}
                <g transform={`translate(${W - 205}, ${top + 16})`}>
                  <text fontFamily="var(--font-mono)" fontSize="8.5"
                    fill="var(--text-dim)" letterSpacing="0.10em">
                    SEVERITY
                  </text>
                  {/* Track */}
                  <rect x="0" y="13" width="160" height="5" rx="2.5"
                    fill="rgba(255,255,255,0.05)"/>
                  {/* Fill */}
                  <rect x="0" y="13" width={160 * island.severity} height="5" rx="2.5"
                    fill="#fb7185" opacity="0.85"/>
                  {/* Glow */}
                  <rect x="0" y="13" width={160 * island.severity} height="5" rx="2.5"
                    fill="#fb7185" opacity="0.4"
                    style={{ filter: 'blur(2px)' }}/>
                  {/* Score */}
                  <text x="0" y="34"
                    fontFamily="var(--font-mono)" fontSize="11"
                    fill="var(--text)">
                    {Math.round(island.severity * 100)}
                    <tspan fill="var(--text-dim)">/100</tspan>
                  </text>
                </g>

                {/* Cycle recurrence chips */}
                <g transform={`translate(${W - 205}, ${top + 58})`}>
                  {island.cycles.map((cid, ci) => (
                    <g key={ci} transform={`translate(${ci * 24}, 0)`}>
                      <rect width="20" height="14" rx="2.5"
                        fill="rgba(251,113,133,0.15)"
                        stroke="rgba(251,113,133,0.35)" strokeWidth={0.5}/>
                      <text x="10" y="10" textAnchor="middle"
                        fontFamily="var(--font-mono)" fontSize="8.5"
                        fill="#fb7185">
                        C{cid}
                      </text>
                    </g>
                  ))}
                </g>

                {/* Hover tooltip overlay — right edge */}
                {isHovered && (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect
                      x={W - 220} y={top + STRATA_H - 48}
                      width={200} height={42}
                      rx={5}
                      fill="rgba(22,28,38,0.95)"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={1}
                    />
                    <text
                      x={W - 210} y={top + STRATA_H - 32}
                      fontFamily="var(--font-sans)" fontSize="10.5"
                      fill="var(--text)" fontWeight={500}>
                      Recurred {island.cycles.length}×
                    </text>
                    <text
                      x={W - 210} y={top + STRATA_H - 16}
                      fontFamily="var(--font-mono)" fontSize="9.5"
                      fill="var(--text-dim)">
                      Last: C{Math.max(...island.cycles)} · sev {Math.round(island.severity * 100)}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Bedrock */}
          <rect x="0" y={bedrockY} width={W} height={H - bedrockY}
            fill="rgba(255,255,255,0.022)"/>
          <text x={W / 2} y={H - 14} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.15em"
            fill="var(--text-faint)">
            BEDROCK · ASSUMED CONSTRAINTS
          </text>
        </svg>
      </div>

      {/* Right column — dead-end gallery */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
        <div className="hstack" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Dead-end gallery</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              Concepts that failed. Preserved as negative knowledge.
            </div>
          </div>
          <div className="state-badge"
            style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-mute)' }}>
            {DEAD_ENDS.length} fossils
          </div>
        </div>

        <div className="deadend-list">
          {DEAD_ENDS.map(d => {
            const nearestIsland = findNearestIsland(d);
            const isActive = highlightedIsland === nearestIsland;
            return (
              <div
                key={d.id}
                className={`deadend-card deadend-card--fossil${isActive ? ' deadend-card--active' : ''}`}
                onClick={() => handleDeadEndClick(d)}
                title={`Click to highlight nearest island (${nearestIsland})`}
              >
                <div className="hstack">
                  <span className="mono deadend-id">{d.id}</span>
                  <span className="agent-tag">
                    <span className="dot" style={{ background: AGENTS[d.agent].color }}></span>
                    {AGENTS[d.agent].name}
                  </span>
                  <span className="spacer"></span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                    C{String(d.cycle).padStart(2, '0')}
                  </span>
                </div>
                <div className="de-title">{d.name}</div>
                <div className="de-reason">{d.reason}</div>
                {isActive && (
                  <div className="deadend-island-hint">
                    ↑ highlighting {nearestIsland}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.IslandsView = IslandsView;
