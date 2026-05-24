/* global React, AGENTS, CYCLES, CONCEPTS */
// Debate Timeline — chronological replay of cycles.
// Three horizontal lanes (one per agent), one column per cycle.
// Cycle dots sized by mutation count; branch fork/merge markers on a top row.

const { useState: useTLState, useMemo: useTLMemo } = React;

function DebateTimeline({ selectedCycle, onSelectCycle, currentCycle = 12 }) {
  const [hover, setHover] = useTLState(null);

  const W = 1200, H = 540;
  const LANE_H = 90;
  const TOP_PAD = 110;
  const LEFT_PAD = 140;
  const RIGHT_PAD = 40;
  const cycleX = (i) => LEFT_PAD + (i) * ((W - LEFT_PAD - RIGHT_PAD) / (CYCLES.length - 1));

  const agentList = ['strawman', 'steelman', 'adversarial'];
  const agentY = (id) => TOP_PAD + agentList.indexOf(id) * LANE_H + LANE_H / 2;

  // Branch lines — top row shows where each branch was active.
  const branchEvents = useTLMemo(() => {
    const events = [];
    // Forks: when a cycle's branch != prev cycle's branch
    let prev = 'main';
    CYCLES.forEach((c, i) => {
      if (c.branch !== prev) {
        events.push({ cycle: c.id, type: 'fork', from: prev, to: c.branch });
        prev = c.branch;
      }
    });
    return events;
  }, []);

  return (
    <div style={{ position: 'absolute', inset: '56px 0 0 0', display: 'flex', flexDirection: 'column' }}>
      {/* Header strip with controls */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 24px 12px',
        fontSize: 11, color: 'var(--text-dim)',
      }}>
        <span className="uppercase faint">12 cycles · 47 mutations · 5 branches</span>
        <span className="dim">·</span>
        <span>Apr 18 – May 22, 2026</span>
        <div className="spacer"></div>
        <div className="hstack" style={{ gap: 4 }}>
          <span className="uppercase faint">Filter:</span>
          {agentList.map(a => (
            <button key={a} className="chip-btn"
              style={{ borderColor: AGENTS[a].dim, color: AGENTS[a].color }}>
              {AGENTS[a].name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'auto', padding: '0 24px 24px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', minHeight: 480 }}>
          <defs>
            <linearGradient id="tlActive" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.04)"/>
              <stop offset="50%" stopColor="rgba(255,255,255,0.08)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,0.04)"/>
            </linearGradient>
          </defs>

          {/* Cycle column grid */}
          {CYCLES.map((c, i) => (
            <line key={'g-' + c.id}
              x1={cycleX(i)} y1={70}
              x2={cycleX(i)} y2={TOP_PAD + agentList.length * LANE_H}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
            />
          ))}

          {/* Selected cycle column highlight */}
          {selectedCycle && (
            <rect
              x={cycleX(selectedCycle - 1) - 24}
              y={60}
              width={48}
              height={TOP_PAD + agentList.length * LANE_H - 60}
              fill="rgba(255,255,255,0.025)"
              rx={4}
            />
          )}

          {/* Cycle numbers (top) */}
          {CYCLES.map((c, i) => (
            <g key={'n-' + c.id}>
              <text x={cycleX(i)} y={48} textAnchor="middle"
                fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.05em"
                fill={c.id === selectedCycle ? 'var(--text)' : 'var(--text-dim)'}>
                CYCLE·{String(c.id).padStart(2, '0')}
              </text>
              <text x={cycleX(i)} y={62} textAnchor="middle"
                fontFamily="var(--font-sans)" fontSize="9.5"
                fill="var(--text-faint)">
                {c.at.slice(5)}
              </text>
            </g>
          ))}

          {/* Branch row */}
          <text x={20} y={84} fontSize="9.5" className="uppercase" fill="var(--text-faint)" letterSpacing="0.12em">BRANCH</text>
          <line x1={LEFT_PAD} y1={84} x2={W - RIGHT_PAD} y2={84} stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>
          {CYCLES.map((c, i) => {
            const color = c.branch === 'main' ? '#9ca3af' :
                          c.branch === 'metaphor-fork' ? '#5eead4' :
                          c.branch === 'risk-branch' ? '#fb7185' :
                          c.branch === 'tree-graph' ? '#f59e0b' : '#475569';
            return (
              <g key={'b-' + c.id}>
                {i > 0 && (
                  <line
                    x1={cycleX(i - 1)} y1={84}
                    x2={cycleX(i)} y2={84}
                    stroke={CYCLES[i - 1].branch === c.branch ? color : 'rgba(255,255,255,0.08)'}
                    strokeWidth={2}
                  />
                )}
                <circle cx={cycleX(i)} cy={84} r={3} fill={color} />
              </g>
            );
          })}

          {/* Agent lane backgrounds + labels */}
          {agentList.map((a, idx) => {
            const y = TOP_PAD + idx * LANE_H;
            return (
              <g key={'lane-' + a}>
                <rect x={LEFT_PAD - 20} y={y + 10} width={W - LEFT_PAD - RIGHT_PAD + 30} height={LANE_H - 20}
                  fill="rgba(255,255,255,0.012)" rx={6}/>
                <line
                  x1={LEFT_PAD - 8} y1={y + LANE_H / 2}
                  x2={W - RIGHT_PAD + 8} y2={y + LANE_H / 2}
                  stroke="rgba(255,255,255,0.05)" strokeWidth={1} strokeDasharray="2 4"
                />
                {/* Lane label */}
                <g>
                  <rect x={16} y={y + LANE_H / 2 - 14} width={6} height={28} rx={1} fill={AGENTS[a].color} opacity={0.7}/>
                  <text x={32} y={y + LANE_H / 2 - 2} fontFamily="var(--font-sans)" fontSize="12" fill="var(--text)" fontWeight={500}>
                    {AGENTS[a].name}
                  </text>
                  <text x={32} y={y + LANE_H / 2 + 12} fontFamily="var(--font-sans)" fontSize="10" fill="var(--text-dim)">
                    {AGENTS[a].role.toLowerCase()}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Cycle events */}
          {CYCLES.map((c, i) => {
            const cx = cycleX(i);
            const cy = agentY(c.agent);
            const totalDelta = c.added.length + c.mutated.length + c.removed.length;
            const r = 6 + Math.min(totalDelta, 8) * 1.4;
            const isSelected = c.id === selectedCycle;
            const isHovered = hover === c.id;
            const color = AGENTS[c.agent].color;
            return (
              <g key={'ev-' + c.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover(c.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectCycle && onSelectCycle(c.id)}
              >
                {/* halo */}
                <circle cx={cx} cy={cy} r={r * 2.4}
                  fill={color} opacity={isSelected || isHovered ? 0.18 : 0.07}/>
                {/* core */}
                <circle cx={cx} cy={cy} r={r}
                  fill={color}
                  stroke="rgba(0,0,0,0.4)" strokeWidth={0.5}/>
                {/* inner highlight */}
                <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.3}
                  fill="rgba(255,255,255,0.6)" opacity={0.5}/>
                {/* delta count label */}
                <text x={cx} y={cy + r + 14} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="9.5"
                  fill="var(--text-mute)">
                  +{c.added.length} ~{c.mutated.length}
                </text>
              </g>
            );
          })}

          {/* Connector lines between adjacent cycles (across lanes) */}
          {CYCLES.slice(1).map((c, idx) => {
            const prev = CYCLES[idx];
            const x1 = cycleX(idx), x2 = cycleX(idx + 1);
            const y1 = agentY(prev.agent), y2 = agentY(c.agent);
            return (
              <path key={'conn-' + c.id}
                d={`M ${x1 + 10},${y1} C ${(x1 + x2) / 2},${y1} ${(x1 + x2) / 2},${y2} ${x2 - 10},${y2}`}
                stroke="rgba(255,255,255,0.10)" strokeWidth={1} fill="none"
                strokeDasharray="3 3"/>
            );
          })}

          {/* Tooltip for hovered cycle */}
          {hover && (() => {
            const c = CYCLES.find(x => x.id === hover);
            const cx = cycleX(c.id - 1);
            const cy = agentY(c.agent);
            const boxW = 280;
            const flip = cx + boxW + 20 > W;
            const bx = flip ? cx - boxW - 18 : cx + 18;
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect x={bx} y={cy - 60} width={boxW} height={120} rx={6}
                  fill="rgba(10,13,18,0.95)" stroke="rgba(255,255,255,0.10)"/>
                <text x={bx + 12} y={cy - 38} fontFamily="var(--font-mono)" fontSize="10" fill={AGENTS[c.agent].color}>
                  CYCLE·{String(c.id).padStart(2, '0')} · {AGENTS[c.agent].name.toUpperCase()}
                </text>
                <text x={bx + 12} y={cy - 20} fontFamily="var(--font-sans)" fontSize="12" fill="var(--text)" fontWeight={500}>
                  {c.title}
                </text>
                <foreignObject x={bx + 12} y={cy - 8} width={boxW - 24} height={60}>
                  <div xmlns="http://www.w3.org/1999/xhtml"
                    style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.45 }}>
                    {c.rationale}
                  </div>
                </foreignObject>
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}

window.DebateTimeline = DebateTimeline;
