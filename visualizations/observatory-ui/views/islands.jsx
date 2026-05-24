/* global React, AGENTS, ISLANDS, DEAD_ENDS, CYCLES */
// Islands & Dead-Ends — archaeological view.
// Islands rendered as horizontal strata (deeper = older, more persistent).
// Dead-ends shown as fossilized concepts off to the side.

function IslandsView() {
  const W = 800, H = 540;

  return (
    <div className="islands-stage">
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
          </defs>

          {/* Sky */}
          <rect x="0" y="0" width={W} height="70" fill="rgba(94, 234, 212, 0.02)"/>
          <text x={W / 2} y={28} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.15em"
            fill="var(--text-dim)" textTransform="uppercase">
            SURFACE · ACTIVE DEBATE
          </text>
          <line x1="0" y1="70" x2={W} y2="70" stroke="rgba(255,255,255,0.12)" strokeWidth={1}/>

          {/* Strata for islands */}
          {ISLANDS.map((w, i) => {
            const top = 70 + i * 105;
            const baseHeight = 88;
            const pattern = `url(#strata-hatch-${(i % 4) + 1})`;
            const baseColor = i === 0 ? 'rgba(120, 130, 150, 0.06)' :
                              i === 1 ? 'rgba(100, 110, 130, 0.08)' :
                              i === 2 ? 'rgba(80, 90, 110, 0.10)' :
                                        'rgba(60, 70, 90, 0.12)';
            const severityBar = w.severity;

            return (
              <g key={w.id}>
                <rect x="0" y={top} width={W} height={baseHeight} fill={baseColor}/>
                <rect x="0" y={top} width={W} height={baseHeight} fill={pattern}/>
                {/* Top/bottom edge */}
                <line x1="0" y1={top} x2={W} y2={top} stroke="rgba(255,255,255,0.05)" strokeWidth={1}/>

                {/* Island ID + name */}
                <text x={24} y={top + 22}
                  fontFamily="var(--font-mono)" fontSize="10"
                  fill="var(--text-faint)" letterSpacing="0.08em">
                  {w.id}
                </text>
                <text x={24} y={top + 44}
                  fontFamily="var(--font-sans)" fontSize="15"
                  fill="var(--text)" fontWeight={500}>
                  {w.name}
                </text>
                <foreignObject x={24} y={top + 50} width={W - 240} height={36}>
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{
                    fontFamily: 'var(--font-sans)', fontSize: 11.5, color: 'var(--text-mute)', lineHeight: 1.5,
                  }}>{w.desc}</div>
                </foreignObject>

                {/* Severity meter on the right */}
                <g transform={`translate(${W - 200}, ${top + 20})`}>
                  <text fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-dim)" textTransform="uppercase" letterSpacing="0.1em">
                    Severity
                  </text>
                  <rect x="0" y="14" width="160" height="6" rx="3" fill="rgba(255,255,255,0.05)"/>
                  <rect x="0" y="14" width={160 * severityBar} height="6" rx="3" fill="#fb7185" opacity="0.85"/>
                  <rect x="0" y="14" width={160 * severityBar} height="6" rx="3" fill="#fb7185" filter="blur(2px)" opacity="0.5"/>
                  <text x="0" y="40" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--text)">
                    {Math.round(severityBar * 100)}<tspan fill="var(--text-dim)">/100</tspan>
                  </text>
                  <text x="60" y="40" fontFamily="var(--font-mono)" fontSize="10" fill="var(--text-dim)">
                    recurred {w.cycles.length}× · last C{Math.max(...w.cycles)}
                  </text>
                </g>

                {/* Cycle marks */}
                <g transform={`translate(${W - 200}, ${top + 64})`}>
                  {w.cycles.map((cid, ci) => (
                    <g key={ci} transform={`translate(${ci * 22}, 0)`}>
                      <rect width="18" height="14" rx="2" fill="rgba(251, 113, 133, 0.18)" stroke="rgba(251, 113, 133, 0.4)" strokeWidth={0.5}/>
                      <text x="9" y="10" textAnchor="middle"
                        fontFamily="var(--font-mono)" fontSize="9" fill="#fb7185">
                        C{cid}
                      </text>
                    </g>
                  ))}
                </g>
              </g>
            );
          })}

          {/* Bottom — bedrock */}
          <rect x="0" y={70 + ISLANDS.length * 105} width={W} height={H - (70 + ISLANDS.length * 105)}
            fill="rgba(255,255,255,0.025)"/>
          <text x={W / 2} y={H - 14} textAnchor="middle"
            fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="0.15em"
            fill="var(--text-faint)" textTransform="uppercase">
            BEDROCK · ASSUMED CONSTRAINTS
          </text>
        </svg>
      </div>

      {/* Right column — dead end gallery */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
        <div className="hstack" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Dead-end gallery</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Concepts that failed. Preserved as negative knowledge.</div>
          </div>
          <div className="state-badge" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-mute)' }}>
            {DEAD_ENDS.length} fossils
          </div>
        </div>
        <div className="deadend-list">
          {DEAD_ENDS.map(d => (
            <div key={d.id} className="deadend-card">
              <div className="hstack">
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>{d.id}</span>
                <span className="agent-tag">
                  <span className="dot" style={{ background: AGENTS[d.agent].color }}></span>
                  {AGENTS[d.agent].name}
                </span>
                <span className="spacer"></span>
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)' }}>C{String(d.cycle).padStart(2, '0')}</span>
              </div>
              <div className="de-title">{d.name}</div>
              <div className="de-reason">{d.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.IslandsView = IslandsView;
