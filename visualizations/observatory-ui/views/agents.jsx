/* global React, AGENTS, CYCLES, CONCEPTS, EDGES */
// Agent Observatory — per-agent stats + mutation velocity + interaction matrix.

function AgentObservatory({ onSelectAgent }) {
  // Compute per-agent stats from globals
  const agentStats = ['strawman', 'steelman', 'adversarial'].map(id => {
    const cycles = CYCLES.filter(c => c.agent === id);
    const mutations = cycles.reduce((s, c) => s + c.mutated.length, 0);
    const concepts = CONCEPTS.filter(c => c.agent === id);
    // Survival = concepts NOT deprecated or archived, as %
    const alive = concepts.filter(c => c.state !== 'deprecated' && c.state !== 'archived').length;
    const survival = concepts.length ? Math.round((alive / concepts.length) * 100) : 0;
    return {
      id, ...AGENTS[id],
      passes: cycles.length,
      concepts: concepts.length,
      mutations,
      survival,
    };
  });

  return (
    <div className="observatory">
      {agentStats.map(a => (
        <div
          key={a.id}
          className="agent-card agent-card--interactive"
          style={{ '--agent-color': a.color }}
          onClick={() => onSelectAgent && onSelectAgent(a.id)}
        >
          <div className="agent-card-head">
            <div className="agent-glyph">{a.glyph}</div>
            <div>
              <div className="agent-card-name">{a.name}</div>
              <div className="agent-card-role mono">{a.role}</div>
            </div>
            <div className="spacer"></div>
            <div
              className="state-badge"
              style={{
                background: `color-mix(in oklab, ${a.color} 16%, transparent)`,
                color: a.color,
              }}
            >
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
              <div className="stat-val">
                {a.survival}
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>%</span>
              </div>
              <div className="stat-label">Survival rate</div>
            </div>
          </div>

          <div className="agent-sparkline-wrap">
            <div className="agent-sparkline-label uppercase faint">
              Activity over cycles
            </div>
            <AgentActivitySparkline agent={a.id} color={a.color} />
          </div>
        </div>
      ))}

      <div className="observatory-charts">
        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-card-title">Mutation Velocity</span>
            <span className="chart-card-sub">per cycle, stacked by agent</span>
            <div className="spacer"></div>
            <div className="hstack" style={{ fontSize: 11, color: 'var(--text-dim)', gap: 12 }}>
              <AgentSwatch a="strawman" />
              <AgentSwatch a="steelman" />
              <AgentSwatch a="adversarial" />
            </div>
          </div>
          <MutationVelocity />
        </div>

        <div className="chart-card">
          <div className="chart-card-head">
            <span className="chart-card-title">Agent Interaction</span>
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: AGENTS[a].color,
        boxShadow: `0 0 5px ${AGENTS[a].color}`,
        flexShrink: 0,
      }}></span>
      <span>{AGENTS[a].name}</span>
    </span>
  );
}

function AgentActivitySparkline({ agent, color }) {
  const W = 240, H = 40;
  const PAD_V = 4;
  const barW = Math.floor((W / CYCLES.length) * 0.7);

  // Normalize bar heights to the max delta across ALL cycles
  const maxDelta = Math.max(1, ...CYCLES.map(c => c.added.length + c.mutated.length));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }} preserveAspectRatio="none">
      {CYCLES.map((c, i) => {
        const cx = (i + 0.5) * (W / CYCLES.length);
        const active = c.agent === agent;
        const delta = c.added.length + c.mutated.length;
        const availH = H - PAD_V * 2;
        // Active bars: normalized height; inactive: 2px stub
        const barH = active ? Math.max(3, (delta / maxDelta) * availH) : 2;
        const y = H - PAD_V - barH;
        const fill = active ? color : 'rgba(255,255,255,0.07)';
        return (
          <g key={c.id}>
            <rect
              x={cx - barW / 2} y={y}
              width={barW} height={barH}
              fill={fill} rx={1.5}
              opacity={active ? 0.95 : 1}
            />
            {active && (
              <rect
                x={cx - barW / 2} y={y}
                width={barW} height={barH}
                fill={color} rx={1.5}
                opacity={0.45}
                style={{ filter: 'blur(3px)' }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function MutationVelocity() {
  const W = 600, H = 180;
  const PAD_L = 28, PAD_R = 12, PAD_T = 12, PAD_B = 28;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const colW = chartW / CYCLES.length;
  const barW = colW * 0.72;

  const agents = ['strawman', 'steelman', 'adversarial'];

  // Per-cycle, per-agent mutation counts (only mutated[], not added[])
  const cycleData = CYCLES.map(c => {
    const byAgent = {};
    agents.forEach(a => { byAgent[a] = 0; });
    // The cycle owner gets credit for mutations
    byAgent[c.agent] += c.mutated.length;
    const total = c.mutated.length;
    return { cycle: c, byAgent, total };
  });

  const maxTotal = Math.max(1, ...cycleData.map(d => d.total));
  const scale = chartH / maxTotal;

  // Y gridlines
  const gridVals = [0, Math.ceil(maxTotal / 2), maxTotal];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
      <defs>
        <filter id="mv-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Gridlines */}
      {gridVals.map((v, gi) => {
        const gy = PAD_T + chartH - v * scale;
        return (
          <g key={gi}>
            <line
              x1={PAD_L} y1={gy} x2={W - PAD_R} y2={gy}
              stroke="rgba(255,255,255,0.04)" strokeWidth={1}
            />
            <text
              x={PAD_L - 5} y={gy + 3.5}
              fontFamily="var(--font-mono)" fontSize="9"
              fill="var(--text-faint)" textAnchor="end"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Stacked bars */}
      {cycleData.map((d, i) => {
        const x = PAD_L + i * colW + (colW - barW) / 2;
        const baseY = PAD_T + chartH;
        let yOffset = 0;

        // Stack: owner agent only (single agent per cycle owns mutations)
        const segments = agents
          .map(a => ({ agent: a, count: d.byAgent[a], color: AGENTS[a].color }))
          .filter(s => s.count > 0);

        return (
          <g key={d.cycle.id}>
            {segments.map(seg => {
              const segH = Math.max(1, seg.count * scale);
              const rectY = baseY - yOffset - segH;
              yOffset += segH;
              return (
                <g key={seg.agent} filter="url(#mv-glow)">
                  <rect
                    x={x} y={rectY}
                    width={barW} height={segH}
                    fill={seg.color} opacity={0.85} rx={1.5}
                  />
                </g>
              );
            })}
            {/* X-axis label */}
            <text
              x={x + barW / 2} y={H - PAD_B + 13}
              fontFamily="var(--font-mono)" fontSize="8.5"
              fill="var(--text-faint)" textAnchor="middle"
            >
              C{String(d.cycle.id).padStart(2, '0')}
            </text>
          </g>
        );
      })}

      {/* Axis baseline */}
      <line
        x1={PAD_L} y1={PAD_T + chartH}
        x2={W - PAD_R} y2={PAD_T + chartH}
        stroke="rgba(255,255,255,0.06)" strokeWidth={1}
      />
    </svg>
  );
}

function InteractionMatrix() {
  const agents = ['strawman', 'steelman', 'adversarial'];
  // Row = challenger (from), col = challenged (to)
  const matrix = agents.map(() => agents.map(() => 0));

  // Count contradict edges between agents' concepts
  const edgesList = (typeof EDGES !== 'undefined' ? EDGES : (window.EDGES || []));
  edgesList.forEach(e => {
    if (e.type !== 'contradict') return;
    const from = CONCEPTS.find(c => c.id === e.from);
    const to   = CONCEPTS.find(c => c.id === e.to);
    if (!from || !to) return;
    const ri = agents.indexOf(from.agent);
    const ci = agents.indexOf(to.agent);
    if (ri >= 0 && ci >= 0) matrix[ri][ci] += 1;
  });

  // Also count cross-agent cycle mutations (challenger = cycle agent, challenged = concept's original agent)
  CYCLES.forEach(c => {
    c.mutated.forEach(cid => {
      const concept = CONCEPTS.find(x => x.id === cid);
      if (!concept || concept.agent === c.agent) return;
      const ri = agents.indexOf(c.agent);
      const ci = agents.indexOf(concept.agent);
      if (ri >= 0 && ci >= 0) matrix[ri][ci] += 1;
    });
  });

  const maxV = Math.max(1, ...matrix.flat());

  // Initials for headers
  const initials = { strawman: 'S', steelman: 'St', adversarial: 'A' };

  return (
    <div className="interaction-matrix-wrap">
      <div className="interaction-matrix-grid">
        {/* Top-left empty corner */}
        <div className="im-corner">
          <span className="im-axis-label">from ↓ / to →</span>
        </div>
        {/* Column headers */}
        {agents.map(a => (
          <div key={a} className="im-col-head" style={{ color: AGENTS[a].color }}>
            {initials[a]}
          </div>
        ))}

        {/* Rows */}
        {agents.map((row, ri) => (
          <React.Fragment key={row}>
            {/* Row header */}
            <div className="im-row-head" style={{ color: AGENTS[row].color }}>
              {initials[row]}
            </div>
            {/* Cells */}
            {agents.map((col, ci) => {
              const v = matrix[ri][ci];
              const intensity = v / maxV;
              const isDiag = ri === ci;
              const color = AGENTS[row].color;
              return (
                <div
                  key={col}
                  className="im-cell"
                  style={{
                    background: isDiag
                      ? 'rgba(255,255,255,0.012)'
                      : `color-mix(in oklab, ${color} ${Math.round(intensity * 45)}%, transparent)`,
                    borderColor: isDiag ? 'var(--border-faint)' : (v > 0 ? `color-mix(in oklab, ${color} 30%, transparent)` : 'var(--border-faint)'),
                    color: v > 0 && !isDiag ? 'var(--text)' : 'var(--text-faint)',
                  }}
                >
                  {isDiag
                    ? <span style={{ color: 'var(--text-faint)', fontSize: 14 }}>—</span>
                    : v
                  }
                  {v > 0 && !isDiag && (
                    <div
                      className="im-cell-glow"
                      style={{ boxShadow: `inset 0 0 16px ${color}35` }}
                    />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="im-footnote">
        Row = challenger agent · Column = challenged agent's concepts · Counts contradict edges + cross-agent cycle revisions
      </div>
    </div>
  );
}

window.AgentObservatory = AgentObservatory;
