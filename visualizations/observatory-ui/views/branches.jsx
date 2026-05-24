/* global React, AGENTS, CYCLES, BRANCHES */
// Branch Explorer — §6 of observatory-ui-spec.
// Git-style horizontal branch tracks, fork/merge bezier curves, per-branch detail cards.

const { useState: useBEState, useMemo: useBEMemo } = React;

function BranchExplorer({ selectedCycle, onSelectCycle }) {
  const [hover, setHover] = useBEState(null); // hovered cycle id

  // Canvas geometry
  const W = 1200;
  const LEFT_PAD = 148;
  const RIGHT_PAD = 248;   // leaves room for detail cards
  const TOP_PAD = 80;
  const TRACK_GAP = 70;
  const CYCLE_STEP = (W - LEFT_PAD - RIGHT_PAD) / (CYCLES.length - 1);

  const cycleX = (cycleId) => LEFT_PAD + (cycleId - 1) * CYCLE_STEP;

  // Branch order: main in the middle, others above/below by their natural order in BRANCHES
  // Spec: main in vertical center, others ordered by branch.id
  const branchOrder = useBEMemo(() => {
    const mainIdx = BRANCHES.findIndex(b => b.id === 'main');
    // Put main in middle of the sorted list by placing others relative to it
    const others = BRANCHES.filter(b => b.id !== 'main');
    // half above, half below — split evenly
    const above = others.slice(0, Math.floor(others.length / 2));
    const below = others.slice(Math.floor(others.length / 2));
    return [...above, BRANCHES[mainIdx], ...below];
  }, []);

  const trackY = (branchId) => {
    const idx = branchOrder.findIndex(b => b.id === branchId);
    return TOP_PAD + idx * TRACK_GAP;
  };

  const mainY = trackY('main');

  const SVG_H = TOP_PAD + branchOrder.length * TRACK_GAP + 30;

  // Status badge colors
  const statusColor = (s) => ({
    active:  '#34d399',
    merged:  '#a78bfa',
    open:    '#22d3ee',
    stale:   '#5e6776',
    closed:  '#fb7185',
  }[s] || '#5e6776');

  const statusLabel = (s) => s.toUpperCase();

  return (
    <div style={{ position: 'absolute', inset: '56px 0 0 0', display: 'flex', flexDirection: 'column' }}>
      {/* Header strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '0 24px 12px',
        fontSize: 11, color: 'var(--text-dim)',
      }}>
        <span className="uppercase faint">
          {BRANCHES.length} branches
          {' · '}
          {BRANCHES.filter(b => b.status === 'active').length} active
          {' · '}
          {BRANCHES.filter(b => b.status === 'merged').length} merged
          {' · '}
          {BRANCHES.filter(b => b.status === 'open').length} open
          {' · '}
          {BRANCHES.filter(b => b.status === 'stale').length} stale
          {' · '}
          {BRANCHES.filter(b => b.status === 'closed').length} closed
        </span>
        <div style={{ flex: 1 }}></div>
        <button className="chip-btn">Show merged</button>
        <button className="chip-btn">Show closed</button>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'auto', padding: '0 0 24px 24px' }}>
        {/* SVG track area — does NOT include the right panel (that's HTML) */}
        <div style={{ position: 'relative' }}>
          <svg
            viewBox={`0 0 ${W} ${SVG_H}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', minHeight: 400 }}
          >
            <defs>
              <marker id="be-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                <path d="M 0 0 L 6 3 L 0 6 z" fill="rgba(255,255,255,0.18)"/>
              </marker>
              <filter id="be-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Cycle column labels */}
            {CYCLES.map(c => (
              <text key={'cx-' + c.id}
                x={cycleX(c.id)} y={48}
                textAnchor="middle"
                fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.04em"
                fill={c.id === selectedCycle ? 'var(--text)' : 'var(--text-faint)'}
              >
                C·{String(c.id).padStart(2, '0')}
              </text>
            ))}
            {/* Cycle date sub-labels */}
            {CYCLES.map(c => (
              <text key={'cdate-' + c.id}
                x={cycleX(c.id)} y={62}
                textAnchor="middle"
                fontFamily="var(--font-sans)" fontSize="8.5"
                fill="var(--text-faint)"
              >
                {c.at.slice(5)}
              </text>
            ))}

            {/* Separator line */}
            <line x1={LEFT_PAD - 20} y1={68} x2={W - RIGHT_PAD + 20} y2={68}
              stroke="rgba(255,255,255,0.05)" strokeWidth={1}/>

            {/* Selected cycle — vertical dashed line */}
            {selectedCycle && (
              <line
                x1={cycleX(selectedCycle)} y1={65}
                x2={cycleX(selectedCycle)} y2={SVG_H - 8}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
            )}

            {/* ── Branch tracks ── */}
            {branchOrder.map((b) => {
              const y = trackY(b.id);
              const isMain = b.id === 'main';
              const hasCycles = b.cycles && b.cycles.length > 0;
              const opacity = (b.status === 'closed' || b.status === 'stale') ? 0.38 : 1;

              // First and last cycle IDs on this branch
              const first = hasCycles ? Math.min(...b.cycles) : null;
              const last  = hasCycles ? Math.max(...b.cycles) : null;

              // Where the branch line starts and ends in X
              const lineX1 = hasCycles ? cycleX(first) : LEFT_PAD + 10;
              const lineX2 = hasCycles ? cycleX(last)  : LEFT_PAD + 90;

              // For merged branches, draw merge curve back to main at last+1
              const mergedAtId = (b.status === 'merged' && hasCycles)
                ? Math.min(last + 1, CYCLES.length)
                : null;
              const mergeX = mergedAtId ? cycleX(mergedAtId) : null;

              // Fork from parent: cubic bezier from parent branch at (forkX, parentY) to (forkX+40, y)
              const forkX = hasCycles && !isMain ? cycleX(first) : null;
              const parentId = b.parent || 'main';
              const parentY = trackY(parentId);

              return (
                <g key={b.id} opacity={opacity}>
                  {/* Branch label (left side) */}
                  <text
                    x={12} y={y + 4}
                    fontFamily="var(--font-mono)" fontSize="10"
                    fill={b.color} dominantBaseline="middle"
                  >
                    {b.label}
                  </text>
                  <text
                    x={12} y={y + 16}
                    fontFamily="var(--font-sans)" fontSize="9"
                    fill={statusColor(b.status)} dominantBaseline="middle"
                    style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    {statusLabel(b.status)}
                  </text>

                  {/* Fork curve from parent branch — cubic bezier per spec:
                      start (forkX, parentY), end (forkX+40, childY) */}
                  {!isMain && hasCycles && forkX !== null && (
                    <path
                      d={`M ${forkX},${parentY} C ${forkX},${(parentY + y) / 2} ${forkX + 40},${(parentY + y) / 2} ${forkX + 40},${y}`}
                      stroke={b.color} strokeWidth={1.5} fill="none" opacity={0.65}
                    />
                  )}

                  {/* Merge curve back to main */}
                  {!isMain && b.status === 'merged' && hasCycles && mergeX !== null && (
                    <path
                      d={`M ${lineX2},${y} C ${(lineX2 + mergeX) / 2},${y} ${(lineX2 + mergeX) / 2},${mainY} ${mergeX},${mainY}`}
                      stroke={b.color} strokeWidth={1.5} fill="none" opacity={0.6}
                    />
                  )}

                  {/* Main branch line (solid, full width) */}
                  {isMain && (
                    <line
                      x1={cycleX(1)} y1={y} x2={cycleX(CYCLES.length)} y2={y}
                      stroke={b.color} strokeWidth={2} opacity={0.75}
                    />
                  )}

                  {/* Non-main: solid line from fork to last cycle */}
                  {!isMain && hasCycles && (
                    <>
                      <line
                        x1={forkX + 40} y1={y}
                        x2={b.status === 'merged' ? lineX2 : lineX2 + 10}
                        y2={y}
                        stroke={b.color} strokeWidth={1.5} opacity={0.55}
                      />
                      {/* open: dashed trailing extension */}
                      {b.status === 'open' && (
                        <line
                          x1={lineX2 + 10} y1={y}
                          x2={Math.min(W - RIGHT_PAD + 20, cycleX(CYCLES.length) + 40)}
                          y2={y}
                          stroke={b.color} strokeWidth={1.5} opacity={0.35}
                          strokeDasharray="5 5"
                        />
                      )}
                    </>
                  )}

                  {/* Stale/closed: stub with X marker */}
                  {!isMain && !hasCycles && (
                    <g>
                      <line
                        x1={lineX1} y1={y} x2={lineX2} y2={y}
                        stroke={b.color} strokeWidth={1.5} strokeDasharray="3 4" opacity={0.45}
                      />
                      {/* X marker at stub end */}
                      <line x1={lineX2 - 6} y1={y - 6} x2={lineX2 + 6} y2={y + 6}
                        stroke={b.color} strokeWidth={1.5} opacity={0.7}/>
                      <line x1={lineX2 + 6} y1={y - 6} x2={lineX2 - 6} y2={y + 6}
                        stroke={b.color} strokeWidth={1.5} opacity={0.7}/>
                    </g>
                  )}

                  {/* Cycle nodes on this branch */}
                  {hasCycles && b.cycles.map(cid => {
                    const c = CYCLES.find(x => x.id === cid);
                    if (!c) return null;
                    const cx = cycleX(cid);
                    const isSel = cid === selectedCycle;
                    const isHov = hover === cid;
                    return (
                      <g key={'node-' + cid}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHover(cid)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => onSelectCycle && onSelectCycle(cid)}
                      >
                        {/* selected ring */}
                        {isSel && (
                          <circle cx={cx} cy={y} r={10}
                            fill="none"
                            stroke={b.color} strokeWidth={1.5} opacity={0.7}
                          />
                        )}
                        {/* hover halo */}
                        {isHov && !isSel && (
                          <circle cx={cx} cy={y} r={8}
                            fill={AGENTS[c.agent].color} opacity={0.18}
                          />
                        )}
                        {/* main node circle */}
                        <circle cx={cx} cy={y} r={isSel ? 7 : 5}
                          fill={AGENTS[c.agent].color}
                          stroke="var(--bg-0)" strokeWidth={2}
                          filter={isSel || isHov ? 'url(#be-glow)' : undefined}
                        />
                        {/* specular */}
                        <circle cx={cx - 1.2} cy={y - 1.2} r={1.5}
                          fill="rgba(255,255,255,0.65)" opacity={0.55}
                          style={{ pointerEvents: 'none' }}
                        />
                      </g>
                    );
                  })}

                  {/* Hover tooltip — cycle title */}
                  {hover && hasCycles && b.cycles.includes(hover) && (() => {
                    const c = CYCLES.find(x => x.id === hover);
                    if (!c) return null;
                    const cx = cycleX(c.id);
                    const boxW = 220;
                    const flip = cx + boxW + 14 > W - RIGHT_PAD;
                    const bx = flip ? cx - boxW - 10 : cx + 10;
                    const by = y - 44;
                    return (
                      <g style={{ pointerEvents: 'none' }}>
                        <rect x={bx} y={by} width={boxW} height={38} rx={5}
                          fill="rgba(10,13,18,0.96)"
                          stroke="rgba(255,255,255,0.09)" strokeWidth={0.75}
                        />
                        <rect x={bx} y={by} width={boxW} height={1.5} rx={1}
                          fill={AGENTS[c.agent].color} opacity={0.6}
                        />
                        <text x={bx + 10} y={by + 14}
                          fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.05em"
                          fill={AGENTS[c.agent].color}>
                          C·{String(c.id).padStart(2, '0')} {AGENTS[c.agent].name.toUpperCase()}
                        </text>
                        <text x={bx + 10} y={by + 29}
                          fontFamily="var(--font-sans)" fontSize="11" fontWeight={500}
                          fill="var(--text)">
                          {c.title.length > 28 ? c.title.slice(0, 27) + '…' : c.title}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}
          </svg>

          {/* ── Right-side branch detail cards (HTML, not SVG) ── */}
          <div style={{
            position: 'absolute',
            top: 70,
            right: 0,
            width: 226,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            paddingRight: 20,
          }}>
            <div style={{
              fontSize: 10, color: 'var(--text-dim)',
              textTransform: 'uppercase', letterSpacing: '0.1em',
              marginBottom: 4, fontFamily: 'var(--font-mono)',
            }}>
              Branch detail
            </div>
            {branchOrder.map(b => (
              <div key={b.id} style={{
                padding: '8px 10px',
                border: '1px solid var(--border-soft)',
                borderLeft: `2px solid ${b.color}`,
                background: 'rgba(255,255,255,0.013)',
                borderRadius: 6,
                opacity: (b.status === 'closed' || b.status === 'stale') ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: b.color,
                    letterSpacing: '-0.02em',
                  }}>
                    {b.label}
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    fontSize: 9,
                    color: statusColor(b.status),
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    background: `${statusColor(b.status)}18`,
                    border: `1px solid ${statusColor(b.status)}40`,
                    borderRadius: 3,
                    padding: '1px 4px',
                  }}>
                    {b.status}
                  </span>
                </div>
                <div style={{
                  fontSize: 10.5,
                  color: 'var(--text-mute)',
                  lineHeight: 1.45,
                }}>
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.BranchExplorer = BranchExplorer;
