/* global React, AGENTS, CYCLES, BRANCHES, CONCEPTS */
// Branch Explorer — Git-like branching visualization with status per branch.

function BranchExplorer({ selectedCycle, onSelectCycle }) {
  const W = 1200, H = 540;
  const LEFT_PAD = 140;
  const RIGHT_PAD = 240;
  const cycleX = (id) => LEFT_PAD + (id - 1) * ((W - LEFT_PAD - RIGHT_PAD) / (CYCLES.length - 1));

  const branchOrder = ['tree-graph', 'metaphor-fork', 'main', 'risk-branch', 'auto-summary'];
  const branchY = (id) => 100 + branchOrder.indexOf(id) * 78;

  return (
    <div style={{ position: 'absolute', inset: '56px 0 0 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 24px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="uppercase faint" style={{ color: 'var(--text-dim)', fontSize: 11 }}>
          5 branches · 1 merged · 1 open · 2 stale · 1 closed
        </span>
        <div className="spacer"></div>
        <button className="chip-btn">Show merged</button>
        <button className="chip-btn">Show closed</button>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'auto', padding: '0 24px 24px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height: '100%', minHeight: 480 }}>
          <defs>
            <linearGradient id="fadeRight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(150,160,180,0.4)"/>
              <stop offset="100%" stopColor="rgba(150,160,180,0)"/>
            </linearGradient>
          </defs>

          {/* Cycle column labels */}
          {CYCLES.map(c => (
            <text key={'cx-' + c.id} x={cycleX(c.id)} y={56} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="9.5"
              fill={c.id === selectedCycle ? 'var(--text)' : 'var(--text-faint)'}>
              C·{String(c.id).padStart(2, '0')}
            </text>
          ))}
          <line x1={LEFT_PAD - 20} y1={66} x2={W - RIGHT_PAD + 20} y2={66}
            stroke="rgba(255,255,255,0.05)" strokeWidth={1}/>

          {/* Branch tracks */}
          {BRANCHES.map(b => {
            const y = branchY(b.id);
            const isMain = b.id === 'main';
            const trackOpacity = b.status === 'closed' || b.status === 'stale' ? 0.35 : 1;

            // Compute fork/merge cycles
            const branchCycles = CYCLES.filter(c => c.branch === b.id).map(c => c.id);
            const hasCycles = branchCycles.length > 0;
            const first = hasCycles ? Math.min(...branchCycles) : null;
            const last  = hasCycles ? Math.max(...branchCycles) : null;

            // Where does it fork from main?
            let forkX = LEFT_PAD - 30;
            let mergeX = W - RIGHT_PAD + 20;
            if (!isMain && hasCycles) {
              forkX = cycleX(first) - 30;
              if (b.status === 'merged') {
                // assume merges back at last + 1 if within range
                const mergeCycle = Math.min(last + 1, CYCLES.length);
                mergeX = cycleX(mergeCycle);
              }
            } else if (!isMain && !hasCycles) {
              // stale / closed — short stub
              forkX = LEFT_PAD - 10;
              mergeX = LEFT_PAD + 90;
            }

            return (
              <g key={b.id} opacity={trackOpacity}>
                {/* Branch label */}
                <g transform={`translate(20, ${y})`}>
                  <text fontFamily="var(--font-mono)" fontSize="11" fill={b.color}
                    dominantBaseline="middle" y={-4}>
                    {b.label}
                  </text>
                  <text fontFamily="var(--font-sans)" fontSize="10" fill="var(--text-dim)"
                    dominantBaseline="middle" y={10} textTransform="uppercase">
                    {b.status}
                  </text>
                </g>

                {/* Fork curve from main */}
                {!isMain && hasCycles && (
                  <path
                    d={`M ${cycleX(Math.max(1, first - 1))},${branchY('main')} C ${(cycleX(Math.max(1, first - 1)) + forkX) / 2},${branchY('main')} ${(cycleX(Math.max(1, first - 1)) + forkX) / 2},${y} ${forkX + 30},${y}`}
                    stroke={b.color} strokeWidth={1.5} fill="none" opacity={0.6}/>
                )}
                {/* Merge curve back to main */}
                {!isMain && b.status === 'merged' && hasCycles && (
                  <path
                    d={`M ${cycleX(last) + 12},${y} C ${(cycleX(last) + mergeX) / 2},${y} ${(cycleX(last) + mergeX) / 2},${branchY('main')} ${mergeX},${branchY('main')}`}
                    stroke={b.color} strokeWidth={1.5} fill="none" opacity={0.6}/>
                )}

                {/* Branch line */}
                {hasCycles && (
                  <line
                    x1={forkX + 30}
                    y1={y}
                    x2={b.status === 'merged' ? cycleX(last) + 12 : (b.status === 'open' ? W - RIGHT_PAD + 20 : cycleX(last) + 18)}
                    y2={y}
                    stroke={b.color} strokeWidth={isMain ? 2 : 1.5}
                    opacity={isMain ? 0.8 : 0.5}
                  />
                )}

                {/* Open-ended tail (frayed) */}
                {b.status === 'open' && (
                  <line
                    x1={cycleX(last) + 16}
                    y1={y}
                    x2={W - RIGHT_PAD + 60}
                    y2={y}
                    stroke="url(#fadeRight)" strokeWidth={1.5} strokeDasharray="3 4"
                  />
                )}

                {/* Stale / closed stub */}
                {!hasCycles && (
                  <g>
                    <line x1={forkX} y1={y} x2={mergeX} y2={y}
                      stroke={b.color} strokeWidth={1.5} strokeDasharray="3 4" opacity={0.5}/>
                    <line x1={mergeX} y1={y - 6} x2={mergeX + 6} y2={y + 6}
                      stroke={b.color} strokeWidth={1.2} opacity={0.7}/>
                    <line x1={mergeX + 6} y1={y - 6} x2={mergeX} y2={y + 6}
                      stroke={b.color} strokeWidth={1.2} opacity={0.7}/>
                  </g>
                )}

                {/* Cycle nodes on this branch */}
                {branchCycles.map(cid => {
                  const c = CYCLES.find(x => x.id === cid);
                  const cx = cycleX(cid);
                  const isSel = cid === selectedCycle;
                  return (
                    <g key={'bn-' + cid}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectCycle && onSelectCycle(cid)}>
                      <circle cx={cx} cy={y} r={isSel ? 8 : 6}
                        fill={AGENTS[c.agent].color}
                        stroke="var(--bg-0)" strokeWidth={2}/>
                      <circle cx={cx - 1.5} cy={y - 1.5} r={2}
                        fill="rgba(255,255,255,0.7)" opacity={0.6}/>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Right-side branch detail panel */}
        <div style={{
          position: 'absolute', top: 80, right: 24,
          width: 200,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div className="uppercase faint" style={{ fontSize: 10, marginBottom: 4, color: 'var(--text-dim)' }}>Branch detail</div>
          {BRANCHES.map(b => (
            <div key={b.id} style={{
              padding: '8px 10px',
              border: '1px solid var(--border-soft)',
              background: 'rgba(255,255,255,0.015)',
              borderRadius: 6,
              borderLeft: `2px solid ${b.color}`,
              opacity: b.status === 'closed' || b.status === 'stale' ? 0.55 : 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className="mono" style={{ color: b.color, fontSize: 11 }}>{b.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9.5, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{b.status}</span>
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-mute)', marginTop: 4, lineHeight: 1.45 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.BranchExplorer = BranchExplorer;
