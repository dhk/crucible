/* global React, AGENTS, CYCLES, CONCEPTS */
// Agent Observatory — per-agent stats + mutation velocity + interaction matrix.

function AgentObservatory({ onSelectAgent }) {
  // Compute per-agent stats
  const agentStats = ['strawman', 'steelman', 'adversarial'].map(id => {
    const cycles = CYCLES.filter(c => c.agent === id);
    const added = cycles.reduce((s, c) => s + c.added.length, 0);
    const mutated = cycles.reduce((s, c) => s + c.mutated.length, 0);
    const concepts = CONCEPTS.filter(c => c.agent === id);
    const dominant = concepts.filter(c => c.state === 'dominant' || c.state === 'adopted').length;
    const survival = concepts.length ? Math.round((dominant / concepts.length) * 100) : 0;
    return {
      id, ...AGENTS[id],
      passes: cycles.length,
      concepts: concepts.length,
      mutations: mutated + added,
      survival,
    };
  });

  return (
    <div className="observatory">
      {agentStats.map(a => (
        <div key={a.id} className="agent-card" style={{ '--agent-color': a.color }}>
          <div className="agent-card-head">
            <div className="agent-glyph">{a.glyph}</div>
            <div>
              <div className="agent-card-name">{a.name}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {a.role}
              </div>
            </div>
            <div className="spacer"></div>
            <div className="state-badge" style={{ background: `color-mix(in oklab, ${a.color} 18%, transparent)`, color: a.color }}>
              <span className="dot" style={{ background: a.color }}></span>
              Active
            </div>
          </div>
          <div className="agent-card-desc">{a.desc}</div>

          <div className="agent-stats">
            <div className="stat">
              <div className="stat-val">{a.passes}</div>
              <div className="stat-label">Passes</div>
            </div>
            <div className="stat">
              <div className="stat-val">{a.concepts}</div>
              <div className="stat-label">Concepts authored</div>
            </div>
            <div className="stat">
              <div className="stat-val">{a.mutations}</div>
              <div className="stat-label">Mutations</div>
            </div>
            <div className="stat">
              <div className="stat-val">{a.survival}<span style={{ fontSize: 12, color: 'var(--text-dim)' }}>%</span></div>
              <div className="stat-label">Survival rate</div>
            </div>
          </div>

          {/* Mini timeline */}
          <div style={{ borderTop: '1px solid var(--border-faint)', paddingTop: 10 }}>
            <div className="uppercase faint" style={{ fontSize: 9.5, marginBottom: 6, color: 'var(--text-dim)' }}>
              Activity over cycles
            </div>
            <AgentActivitySparkline agent={a.id} color={a.color} />
          </div>
        </div>
      ))}

      <div className="observatory-charts">
        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-card-title">Mutation velocity</span>
            <span className="chart-card-sub">per cycle, stacked by agent</span>
            <div className="spacer"></div>
            <div className="hstack" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              <AgentSwatch a="strawman" /> <AgentSwatch a="steelman" /> <AgentSwatch a="adversarial" />
            </div>
          </div>
          <MutationVelocity />
        </div>

        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-card-title">Interaction matrix</span>
            <span className="chart-card-sub">who challenges whom</span>
          </div>
          <InteractionMatrix />
        </div>
      </div>
    </div>
  );
}

function AgentSwatch({ a }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: AGENTS[a].color, boxShadow: `0 0 6px ${AGENTS[a].color}` }}></span>
      <span>{AGENTS[a].name}</span>
    </span>
  );
}

function AgentActivitySparkline({ agent, color }) {
  // 12 columns, each cycle, marked if that cycle = this agent.
  return (
    <svg viewBox="0 0 240 22" style={{ width: '100%', height: 22 }} preserveAspectRatio="none">
      {CYCLES.map((c, i) => {
        const x = (i + 0.5) * (240 / 12);
        const active = c.agent === agent;
        const totalDelta = c.added.length + c.mutated.length;
        const h = active ? 4 + totalDelta * 2 : 2;
        return (
          <g key={c.id}>
            <rect x={x - 4} y={11 - h / 2} width={8} height={h}
              fill={active ? color : 'rgba(255,255,255,0.08)'}
              rx={1}
              opacity={active ? 0.95 : 1}
            />
            {active && (
              <rect x={x - 4} y={11 - h / 2} width={8} height={h}
                fill={color} filter="blur(4px)" opacity={0.5} rx={1}/>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function MutationVelocity() {
  // Stacked bar chart per cycle.
  const W = 600, H = 200;
  const PAD = 24;
  const barW = (W - PAD * 2) / CYCLES.length - 4;
  const maxTotal = Math.max(...CYCLES.map(c => c.added.length + c.mutated.length + c.removed.length));
  const scale = (H - PAD * 2) / Math.max(maxTotal, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
      {/* horizontal gridlines */}
      {[0, 0.5, 1].map(t => (
        <g key={t}>
          <line x1={PAD} y1={H - PAD - (maxTotal * t) * scale}
                x2={W - PAD} y2={H - PAD - (maxTotal * t) * scale}
                stroke="rgba(255,255,255,0.04)" strokeWidth={1}/>
          <text x={PAD - 6} y={H - PAD - (maxTotal * t) * scale + 3}
            fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-faint)" textAnchor="end">
            {Math.round(maxTotal * t)}
          </text>
        </g>
      ))}

      {CYCLES.map((c, i) => {
        const x = PAD + i * ((W - PAD * 2) / CYCLES.length) + 2;
        const total = c.added.length + c.mutated.length;
        const baseY = H - PAD;
        const color = AGENTS[c.agent].color;
        return (
          <g key={c.id}>
            <rect x={x} y={baseY - total * scale} width={barW} height={total * scale}
              fill={color} opacity={0.85} rx={1}/>
            <rect x={x} y={baseY - total * scale} width={barW} height={total * scale}
              fill={color} filter="blur(3px)" opacity={0.4} rx={1}/>
            <text x={x + barW / 2} y={H - PAD + 12}
              fontFamily="var(--font-mono)" fontSize="9" fill="var(--text-faint)" textAnchor="middle">
              {c.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function InteractionMatrix() {
  // 3x3 matrix. Rows = challenger, Cols = challenged.
  // Compute from concept relationships: when concept of agent X has contradict edge into concept of agent Y.
  const agents = ['strawman', 'steelman', 'adversarial'];
  const matrix = agents.map(r => agents.map(c => 0));
  // Edges
  const EDGES_LOCAL = window.EDGES || [];
  EDGES_LOCAL.forEach(e => {
    if (e.type !== 'contradict' && e.type !== 'mutation') return;
    const from = CONCEPTS.find(c => c.id === e.from);
    const to   = CONCEPTS.find(c => c.id === e.to);
    if (!from || !to) return;
    matrix[agents.indexOf(from.agent)][agents.indexOf(to.agent)] += 1;
  });

  // Also count cycle-to-cycle: when an adversarial cycle mutates a concept introduced by another agent.
  CYCLES.forEach(c => {
    c.mutated.forEach(cid => {
      const concept = CONCEPTS.find(x => x.id === cid);
      if (!concept) return;
      if (concept.agent !== c.agent) {
        matrix[agents.indexOf(c.agent)][agents.indexOf(concept.agent)] += 1;
      }
    });
  });

  const maxV = Math.max(1, ...matrix.flat());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '8px 4px 12px' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px repeat(3, 1fr)',
        gap: 4,
        alignItems: 'center',
      }}>
        <div></div>
        {agents.map(a => (
          <div key={a} style={{ fontSize: 10, textAlign: 'center', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            → {AGENTS[a].name}
          </div>
        ))}
        {agents.map((row, ri) => (
          <React.Fragment key={row}>
            <div style={{ fontSize: 11, color: AGENTS[row].color, fontWeight: 500, textAlign: 'right', paddingRight: 8 }}>
              {AGENTS[row].name}
            </div>
            {agents.map((col, ci) => {
              const v = matrix[ri][ci];
              const intensity = v / maxV;
              const color = AGENTS[row].color;
              return (
                <div key={col} style={{
                  height: 56,
                  borderRadius: 5,
                  background: ri === ci ? 'rgba(255,255,255,0.015)' : `color-mix(in oklab, ${color} ${Math.round(intensity * 50)}%, transparent)`,
                  border: '1px solid var(--border-faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 16,
                  color: v > 0 ? 'var(--text)' : 'var(--text-faint)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {ri === ci ? <span style={{ color: 'var(--text-faint)' }}>—</span> : v}
                  {v > 0 && ri !== ci && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      boxShadow: `inset 0 0 18px ${color}40`,
                      borderRadius: 5,
                      pointerEvents: 'none',
                    }}/>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--text-dim)', marginTop: 4, lineHeight: 1.45 }}>
        Row = challenger, column = challenged. Cells count contradict + mutation edges between agents' concepts plus cross-agent cycle revisions.
      </div>
    </div>
  );
}

window.AgentObservatory = AgentObservatory;
