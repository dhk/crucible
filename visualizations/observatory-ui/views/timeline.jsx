/* global React, AGENTS, CYCLES, BRANCHES */
// Debate Timeline — §5 of observatory-ui-spec.
// Three horizontal swimlanes (one per agent), one column per cycle.
// Cycle dots sized by delta; baton-pass connector curves; branch row with fork indicators.

const { useState: useTLState, useMemo: useTLMemo, useEffect: useTLEffect } = React;

function DebateTimeline({ selectedCycle, onSelectCycle }) {
  const [hover, setHover] = useTLState(null);

  // Canvas geometry
  const W = 1200, H = 540;
  const LANE_H = 100;
  const TOP_PAD = 130;   // space for branch row + cycle labels
  const LEFT_PAD = 148;
  const RIGHT_PAD = 36;
  const BRANCH_ROW_Y = 86;

  const cycleX = (i) => LEFT_PAD + i * ((W - LEFT_PAD - RIGHT_PAD) / (CYCLES.length - 1));

  const agentList = ['strawman', 'steelman', 'adversarial'];
  const agentY = (id) => TOP_PAD + agentList.indexOf(id) * LANE_H + LANE_H / 2;

  const SVG_H = TOP_PAD + agentList.length * LANE_H + 24;

  // Branch color lookup — use BRANCHES array data, fall back to hash
  const branchColor = useTLMemo(() => {
    const map = {};
    BRANCHES.forEach(b => { map[b.id] = b.color; });
    return (id) => {
      if (map[id]) return map[id];
      // hash-based fallback
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffff;
      return '#' + ((h & 0x7fffff) | 0x404040).toString(16).padStart(6, '0');
    };
  }, []);

  // Identify fork positions (where branch changes from prev cycle)
  const forkIndices = useTLMemo(() => {
    const forks = new Set();
    for (let i = 1; i < CYCLES.length; i++) {
      if (CYCLES[i].branch !== CYCLES[i - 1].branch) forks.add(i);
    }
    return forks;
  }, []);

  return (
    <div style={{ position: 'absolute', inset: '56px 0 0 0', display: 'flex', flexDirection: 'column' }}>
      {/* Header strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 24px 12px',
        fontSize: 11, color: 'var(--text-dim)',
      }}>
        <span className="uppercase faint">
          {CYCLES.length} cycles · {BRANCHES.length} branches
        </span>
        <span className="faint">·</span>
        <span>{CYCLES[0].at.slice(0, 7)} – {CYCLES[CYCLES.length - 1].at.slice(0, 7)}</span>
        <div className="spacer" style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span className="uppercase faint" style={{ marginRight: 4 }}>Agents:</span>
          {agentList.map(a => (
            <span key={a} className="chip-btn"
              style={{ borderColor: AGENTS[a].dim, color: AGENTS[a].color }}>
              {AGENTS[a].glyph}
            </span>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'auto', padding: '0 24px 24px' }}>
        <svg
          viewBox={`0 0 ${W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ width: '100%', height: '100%', minHeight: 460 }}
        >
          <defs>
            {/* Glow filters per agent */}
            <filter id="glow-strawman" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feFlood floodColor="#5eead4" floodOpacity="0.7" result="color"/>
              <feComposite in="color" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-steelman" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feFlood floodColor="#a78bfa" floodOpacity="0.7" result="color"/>
              <feComposite in="color" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="glow-adversarial" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="5" result="blur"/>
              <feFlood floodColor="#fb7185" floodOpacity="0.7" result="color"/>
              <feComposite in="color" in2="blur" operator="in" result="glow"/>
              <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Subtle column grid lines */}
          {CYCLES.map((c, i) => (
            <line key={'grid-' + c.id}
              x1={cycleX(i)} y1={60}
              x2={cycleX(i)} y2={SVG_H - 10}
              stroke="rgba(255,255,255,0.035)" strokeWidth={1}
            />
          ))}

          {/* Selected cycle — dashed vertical highlight spanning all lanes */}
          {selectedCycle && (() => {
            const idx = selectedCycle - 1;
            const x = cycleX(idx);
            return (
              <line
                x1={x} y1={58}
                x2={x} y2={SVG_H - 10}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            );
          })()}

          {/* Cycle number labels */}
          {CYCLES.map((c, i) => (
            <g key={'label-' + c.id}>
              <text
                x={cycleX(i)} y={46}
                textAnchor="middle"
                fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.06em"
                fill={c.id === selectedCycle ? 'var(--text)' : 'var(--text-dim)'}
              >
                {String(c.id).padStart(2, '0')}
              </text>
              <text
                x={cycleX(i)} y={60}
                textAnchor="middle"
                fontFamily="var(--font-sans)" fontSize="9"
                fill="var(--text-faint)"
              >
                {c.at.slice(5)}
              </text>
            </g>
          ))}

          {/* ── Branch row ── */}
          <text
            x={14} y={BRANCH_ROW_Y + 4}
            fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.1em"
            fill="var(--text-faint)" textTransform="uppercase"
          >BRANCH</text>

          {/* Branch segment lines connecting consecutive cycles on same branch */}
          {CYCLES.slice(1).map((c, idx) => {
            const prev = CYCLES[idx];
            const sameBranch = prev.branch === c.branch;
            const color = branchColor(sameBranch ? c.branch : prev.branch);
            return (
              <line key={'bline-' + c.id}
                x1={cycleX(idx)} y1={BRANCH_ROW_Y}
                x2={cycleX(idx + 1)} y2={BRANCH_ROW_Y}
                stroke={sameBranch ? color : 'rgba(255,255,255,0.06)'}
                strokeWidth={sameBranch ? 2 : 1}
              />
            );
          })}

          {/* Branch dots and fork indicators */}
          {CYCLES.map((c, i) => {
            const color = branchColor(c.branch);
            const isFork = forkIndices.has(i);
            return (
              <g key={'bdot-' + c.id}>
                {/* Fork indicator: small diamond above the branch row dot */}
                {isFork && (
                  <g transform={`translate(${cycleX(i)}, ${BRANCH_ROW_Y - 10})`}>
                    <polygon points="0,-5 4,0 0,5 -4,0"
                      fill={color} opacity={0.9}/>
                    {/* fork label */}
                    <text y={-8} textAnchor="middle"
                      fontFamily="var(--font-mono)" fontSize="7.5" letterSpacing="0.05em"
                      fill={color} opacity={0.8}>
                      {CYCLES[i].branch}
                    </text>
                  </g>
                )}
                {/* Branch dot */}
                <circle
                  cx={cycleX(i)} cy={BRANCH_ROW_Y}
                  r={isFork ? 4 : 3}
                  fill={color}
                  stroke={isFork ? 'rgba(255,255,255,0.2)' : 'none'}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Horizontal separator below branch row */}
          <line
            x1={LEFT_PAD - 20} y1={BRANCH_ROW_Y + 14}
            x2={W - RIGHT_PAD + 10} y2={BRANCH_ROW_Y + 14}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1}
          />

          {/* ── Agent swimlanes ── */}
          {agentList.map((a, idx) => {
            const y = TOP_PAD + idx * LANE_H;
            const centerY = y + LANE_H / 2;
            return (
              <g key={'lane-' + a}>
                {/* Lane background */}
                <rect
                  x={LEFT_PAD - 16} y={y + 8}
                  width={W - LEFT_PAD - RIGHT_PAD + 26} height={LANE_H - 16}
                  fill="rgba(255,255,255,0.011)" rx={6}
                />
                {/* Lane center dashed line */}
                <line
                  x1={LEFT_PAD - 6} y1={centerY}
                  x2={W - RIGHT_PAD + 6} y2={centerY}
                  stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="2 5"
                />
                {/* Lane label — agent color bar + name + role */}
                <rect x={16} y={centerY - 15} width={5} height={30} rx={1}
                  fill={AGENTS[a].color} opacity={0.65}/>
                <text x={30} y={centerY - 3}
                  fontFamily="var(--font-sans)" fontSize="12" fontWeight={500}
                  fill="var(--text)">
                  {AGENTS[a].name}
                </text>
                <text x={30} y={centerY + 11}
                  fontFamily="var(--font-sans)" fontSize="10"
                  fill="var(--text-dim)">
                  {AGENTS[a].role.toLowerCase()}
                </text>
              </g>
            );
          })}

          {/* ── Baton-pass connector curves (quadratic bezier) ── */}
          {CYCLES.slice(1).map((c, idx) => {
            const prev = CYCLES[idx];
            const x1 = cycleX(idx);
            const x2 = cycleX(idx + 1);
            const y1 = agentY(prev.agent);
            const y2 = agentY(c.agent);
            const mx = (x1 + x2) / 2;
            // quadratic bezier: control point pulled toward midpoint between the two lane Ys
            const cy1 = (y1 + y2) / 2;
            return (
              <path key={'conn-' + c.id}
                d={`M ${x1},${y1} Q ${mx},${cy1} ${x2},${y2}`}
                stroke="rgba(255,255,255,0.09)" strokeWidth={1}
                fill="none" strokeDasharray="3 4"
              />
            );
          })}

          {/* ── Cycle dots ── */}
          {CYCLES.map((c, i) => {
            const cx = cycleX(i);
            const cy = agentY(c.agent);
            // Spec: 5 + min(added.length + mutated.length, 8) * 1.2
            const r = 5 + Math.min(c.added.length + c.mutated.length, 8) * 1.2;
            const isSelected = c.id === selectedCycle;
            const isHovered = hover === c.id;
            const color = AGENTS[c.agent].color;
            const filterId = `glow-${c.agent}`;
            return (
              <g key={'dot-' + c.id}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover(c.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectCycle && onSelectCycle(c.id)}
              >
                {/* outer halo */}
                <circle cx={cx} cy={cy} r={r * 2.2}
                  fill={color}
                  opacity={isSelected || isHovered ? 0.16 : 0.055}
                />
                {/* core dot — glow filter on hover/selected */}
                <circle cx={cx} cy={cy} r={r}
                  fill={color}
                  stroke={isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)'}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  filter={isSelected || isHovered ? `url(#${filterId})` : undefined}
                />
                {/* specular highlight */}
                <circle cx={cx - r * 0.28} cy={cy - r * 0.28} r={r * 0.28}
                  fill="rgba(255,255,255,0.55)" opacity={0.45}
                  style={{ pointerEvents: 'none' }}
                />
                {/* delta label below dot */}
                <text x={cx} y={cy + r + 13}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="9"
                  fill="var(--text-faint)">
                  +{c.added.length} ~{c.mutated.length}
                </text>
              </g>
            );
          })}

          {/* ── Tooltip (foreignObject) ── */}
          {hover && (() => {
            const c = CYCLES.find(x => x.id === hover);
            if (!c) return null;
            const i = c.id - 1;
            const cx = cycleX(i);
            const cy = agentY(c.agent);
            const boxW = 290;
            const boxH = 130;
            const flip = cx + boxW + 22 > W;
            const bx = flip ? cx - boxW - 18 : cx + 18;
            const by = Math.max(8, Math.min(cy - boxH / 2, SVG_H - boxH - 8));
            return (
              <g style={{ pointerEvents: 'none' }}>
                {/* connector nib */}
                <line
                  x1={cx} y1={cy}
                  x2={flip ? bx + boxW : bx}
                  y2={by + boxH / 2}
                  stroke={AGENTS[c.agent].color} strokeWidth={0.75} opacity={0.4}
                />
                {/* tooltip box */}
                <rect x={bx} y={by} width={boxW} height={boxH} rx={6}
                  fill="rgba(10,13,18,0.96)"
                  stroke="rgba(255,255,255,0.10)" strokeWidth={0.75}
                />
                {/* top accent strip */}
                <rect x={bx} y={by} width={boxW} height={2} rx={1}
                  fill={AGENTS[c.agent].color} opacity={0.6}
                />
                {/* cycle id + agent */}
                <text x={bx + 12} y={by + 20}
                  fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.06em"
                  fill={AGENTS[c.agent].color}>
                  CYCLE·{String(c.id).padStart(2, '0')} · {AGENTS[c.agent].name.toUpperCase()}
                </text>
                {/* title */}
                <text x={bx + 12} y={by + 38}
                  fontFamily="var(--font-sans)" fontSize="12" fontWeight={500}
                  fill="var(--text)">
                  {c.title}
                </text>
                {/* branch badge */}
                <text x={bx + boxW - 12} y={by + 20}
                  textAnchor="end"
                  fontFamily="var(--font-mono)" fontSize="9"
                  fill="var(--text-dim)">
                  {c.branch}
                </text>
                {/* rationale — foreignObject for text wrapping */}
                <foreignObject x={bx + 12} y={by + 46} width={boxW - 24} height={76}>
                  <div xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      color: 'var(--text-mute)',
                      lineHeight: 1.5,
                    }}>
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
