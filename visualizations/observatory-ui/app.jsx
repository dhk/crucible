/* global React, ReactDOM, AGENTS, STATES, CONCEPTS, EDGES, CYCLES, BRANCHES, DOC,
   ConceptGraph, DebateTimeline, BranchExplorer, AgentObservatory, IslandsView,
   DocumentEvolution,
   TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakSelect */

const { useState, useEffect, useMemo, useRef } = React;

const VIEWS = [
  { id: 'graph',    label: 'Concept Graph', short: 'G' },
  { id: 'timeline', label: 'Timeline',      short: 'T' },
  { id: 'branches', label: 'Branches',      short: 'B' },
  { id: 'agents',   label: 'Agents',        short: 'A' },
  { id: 'islands',   label: 'Islands & Fossils', short: 'I' },
  { id: 'evolution', label: 'Evolution',         short: 'E' },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "showDeadEnds": true,
  "showIslands": true,
  "agentFilter": "all",
  "glow": true
}/*EDITMODE-END*/;

function App() {
  const [view, setView] = useState('graph');
  const [selectedId, setSelectedId] = useState('C02');     // selected concept
  const [selectedCycle, setSelectedCycle] = useState(7);   // selected cycle
  const [hoveredCycle, setHoveredCycle] = useState(null);
  const [legendDimmed, setLegendDimmed] = useState({});    // agent → dimmed
  const [t, setT] = useTweaks(TWEAK_DEFAULTS);

  const selectedConcept = useMemo(() => CONCEPTS.find(c => c.id === selectedId), [selectedId]);
  const cycle = useMemo(() => CYCLES.find(c => c.id === selectedCycle), [selectedCycle]);

  // Lineage = chain of cycles that touched the selected concept
  const lineage = useMemo(() => {
    if (!selectedConcept) return [];
    const touched = CYCLES.filter(c =>
      c.added.includes(selectedConcept.id) ||
      c.mutated.includes(selectedConcept.id) ||
      c.removed.includes(selectedConcept.id)
    );
    return touched.map(c => {
      const evt = c.added.includes(selectedConcept.id) ? 'introduced' :
                  c.mutated.includes(selectedConcept.id) ? 'mutated' :
                  'removed';
      return { ...c, evt };
    });
  }, [selectedConcept]);

  const agentFilter = t.agentFilter === 'all' ? null : t.agentFilter;

  // Count helpers
  const counts = useMemo(() => {
    const byAgent = { strawman: 0, steelman: 0, adversarial: 0 };
    CONCEPTS.forEach(c => byAgent[c.agent] = (byAgent[c.agent] || 0) + 1);
    return { byAgent };
  }, []);

  return (
    <div className={`app ${t.density === 'dense' ? 'dense' : ''}`}>
      <TopBar view={view} setView={setView} />

      <aside className="rail">
        <div className="rail-section">
          <div className="rail-h">Document</div>
          <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, lineHeight: 1.35, letterSpacing: '-0.005em' }}>
            {DOC.title}
          </div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>{DOC.path}</div>
          <dl className="rail-meta" style={{ marginTop: 8 }}>
            <dt>Status</dt><dd style={{ color: '#5eead4' }}>● {DOC.status}</dd>
            <dt>Convergence</dt><dd>{Math.round(DOC.convergence * 100)}%</dd>
            <dt>Cycles</dt><dd>{DOC.cycles}</dd>
            <dt>Concepts</dt><dd>{DOC.concepts}</dd>
            <dt>Branches</dt><dd>{DOC.branches}</dd>
            <dt>Mutations</dt><dd>{DOC.mutations}</dd>
            <dt>Islands</dt><dd>{DOC.islands}</dd>
            <dt>Dead ends</dt><dd>{DOC.deadEnds}</dd>
          </dl>
        </div>

        <div className="rail-section">
          <div className="rail-h">Agents</div>
          {Object.values(AGENTS).map(a => (
            <div key={a.id} className={`legend-item ${legendDimmed[a.id] ? 'dim' : ''}`}
              onClick={() => setLegendDimmed(d => ({ ...d, [a.id]: !d[a.id] }))}
              style={{ color: a.color }}>
              <span className="legend-swatch" style={{ background: a.color }}></span>
              <span className="legend-name" style={{ color: 'var(--text)' }}>{a.name}</span>
              <span className="legend-count">{counts.byAgent[a.id]}</span>
            </div>
          ))}
        </div>

        <div className="rail-section">
          <div className="rail-h">Lifecycle</div>
          {[
            ['seed', 'Seed'],
            ['emergent', 'Emergent'],
            ['contested', 'Contested'],
            ['adopted', 'Adopted'],
            ['dominant', 'Dominant'],
            ['fragmented', 'Fragmented'],
            ['deprecated', 'Deprecated'],
            ['resurrected', 'Resurrected'],
          ].map(([id, label]) => {
            const c = CONCEPTS.filter(x => x.state === id).length;
            return (
              <div key={id} className="rail-link">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATES[id].color, opacity: 0.85 }}></span>
                <span>{label}</span>
                <span className="num">{c}</span>
              </div>
            );
          })}
        </div>

        <div className="rail-section">
          <div className="rail-h">Recent cycles</div>
          {CYCLES.slice(-5).reverse().map(c => (
            <div key={c.id} className={`cycle-row ${c.id === selectedCycle ? 'active' : ''}`}
              onClick={() => setSelectedCycle(c.id)}>
              <span className="c-num">C{String(c.id).padStart(2, '0')}</span>
              <div className="c-body">
                <span className="c-title">{c.title}</span>
                <span className="c-meta">
                  <span className="agent-tag"><span className="dot" style={{ background: AGENTS[c.agent].color }}></span>{AGENTS[c.agent].name}</span>
                  <span>· +{c.added.length} ~{c.mutated.length}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <div className="main-header">
          <span className="view-title">{VIEWS.find(v => v.id === view).label}</span>
          <span className="view-sub">
            {view === 'graph'    && '24 concepts · 30 relations · 4 islands'}
            {view === 'timeline' && 'Chronological replay of the debate'}
            {view === 'branches' && 'Competing directions of conceptual exploration'}
            {view === 'agents'   && 'Per-agent behavior, conflict patterns, mutation velocity'}
            {view === 'islands'    && 'Structural resistance and abandoned terrain'}
            {view === 'evolution' && 'Cycle-by-cycle document diff history'}
          </span>
          <div className="view-actions">
            {view === 'graph' && (
              <>
                <button className="chip-btn">Fit</button>
                <button className="chip-btn active">Force</button>
                <button className="chip-btn">Tree</button>
                <button className="chip-btn">Strata</button>
              </>
            )}
          </div>
        </div>

        {view === 'graph' && (
          <ConceptGraph
            selectedId={selectedId}
            onSelect={setSelectedId}
            hoveredCycle={hoveredCycle}
            showDeadEnds={t.showDeadEnds}
            showIslands={t.showIslands}
            density={t.density}
            agentFilter={agentFilter}
          />
        )}
        {view === 'timeline' && (
          <DebateTimeline selectedCycle={selectedCycle} onSelectCycle={setSelectedCycle} />
        )}
        {view === 'branches' && (
          <BranchExplorer selectedCycle={selectedCycle} onSelectCycle={setSelectedCycle} />
        )}
        {view === 'agents' && <AgentObservatory />}
        {view === 'islands'   && <IslandsView />}
        {view === 'evolution' && <DocumentEvolution />}
      </main>

      <Inspector
        concept={selectedConcept}
        lineage={lineage}
        cycle={cycle}
      />

      <BottomTimeline
        selectedCycle={selectedCycle}
        onSelectCycle={setSelectedCycle}
        onHoverCycle={setHoveredCycle}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Display">
          <TweakRadio label="Density" value={t.density} onChange={v => setT('density', v)}
            options={[{value:'comfortable',label:'Comfortable'},{value:'dense',label:'Dense'}]}/>
          <TweakToggle label="Show dead-ends in graph" value={t.showDeadEnds} onChange={v => setT('showDeadEnds', v)} />
          <TweakToggle label="Show islands in graph" value={t.showIslands} onChange={v => setT('showIslands', v)} />
        </TweakSection>
        <TweakSection label="Filters">
          <TweakSelect label="Agent focus" value={t.agentFilter} onChange={v => setT('agentFilter', v)}
            options={[
              {value:'all',label:'All agents'},
              {value:'strawman',label:'Strawman only'},
              {value:'steelman',label:'Steelman only'},
              {value:'adversarial',label:'Adversarial only'},
            ]}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function TopBar({ view, setView }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark"></span>
        <span>Crucible</span>
        <span className="dim" style={{ fontWeight: 400, fontSize: 11, marginLeft: 6, letterSpacing: 0.5 }}>OBSERVATORY</span>
      </div>
      <span className="dim" style={{ color: 'var(--text-faint)' }}>/</span>
      <div className="doc-crumb">
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>docs/active</span>
        <span className="sep">/</span>
        <span className="doc-title">crucible-observability-ui.md</span>
      </div>
      <div className="top-pills">
        <span className="pill"><span className="pill-dot" style={{ background: '#5eead4' }}></span>converging <span className="pill-val">74%</span></span>
        <span className="pill">cycle <span className="pill-val mono">12 / ∞</span></span>
        <span className="pill">last pass <span className="pill-val">2d ago</span></span>
      </div>

      <nav className="tabs">
        {VIEWS.map(v => (
          <button key={v.id} className={`tab ${view === v.id ? 'active' : ''}`}
            onClick={() => setView(v.id)}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: 0.5 }}>{v.short}</span>
            <span>{v.label}</span>
          </button>
        ))}
      </nav>
    </header>
  );
}

function Inspector({ concept, lineage, cycle }) {
  if (!concept) {
    return (
      <aside className="inspector">
        <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>Select a concept to inspect.</div>
      </aside>
    );
  }
  const agent = AGENTS[concept.agent];
  const state = STATES[concept.state];
  const supports     = EDGES.filter(e => (e.from === concept.id && e.type === 'support') || (e.to === concept.id && e.type === 'support'));
  const contradicts  = EDGES.filter(e => (e.from === concept.id && e.type === 'contradict') || (e.to === concept.id && e.type === 'contradict'));
  const mutations    = EDGES.filter(e => (e.from === concept.id && e.type === 'mutation') || (e.to === concept.id && e.type === 'mutation'));

  return (
    <aside className="inspector">
      <div className="inspector-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>{concept.id}</span>
          <span className="state-badge" style={{ background: `color-mix(in oklab, ${state.color} 18%, transparent)`, color: state.color }}>
            <span className="dot" style={{ background: state.color }}></span>
            {state.label}
          </span>
        </div>
        <h2>{concept.name}</h2>
        <div className="dim" style={{ fontSize: 12, lineHeight: 1.55, marginTop: 2 }}>{concept.desc}</div>
      </div>

      <div className="divider"></div>

      <div className="inspector-section">
        <h3>Properties</h3>
        <dl className="kv">
          <dt>Origin</dt>
          <dd>
            <span className="agent-tag" style={{ fontSize: 12 }}>
              <span className="dot" style={{ background: agent.color }}></span>
              {agent.name}
            </span>
            <span style={{ color: 'var(--text-dim)', marginLeft: 6 }}>cycle {concept.originCycle}</span>
          </dd>
          <dt>Adoption</dt>
          <dd>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 90, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${concept.adoption * 100}%`, height: '100%', background: state.color, boxShadow: `0 0 8px ${state.color}` }}></div>
              </div>
              <span className="mono" style={{ fontSize: 11 }}>{Math.round(concept.adoption * 100)}%</span>
            </div>
          </dd>
          <dt>Supports</dt>
          <dd>{supports.length}</dd>
          <dt>Contradicts</dt>
          <dd>{contradicts.length}</dd>
          <dt>Mutations</dt>
          <dd>{mutations.length}</dd>
        </dl>
      </div>

      <div className="divider"></div>

      <div className="inspector-section">
        <h3>Lineage</h3>
        {lineage.length === 0 && (
          <div className="dim" style={{ fontSize: 11 }}>No recorded events.</div>
        )}
        {lineage.map(step => {
          const a = AGENTS[step.agent];
          return (
            <div key={step.id} className="lineage-step">
              <span className="lineage-dot" style={{ background: a.color, boxShadow: `0 0 8px ${a.color}` }}></span>
              <div className="lineage-body">
                <div className="hstack" style={{ justifyContent: 'space-between' }}>
                  <span className="lineage-title">
                    <span className="mono" style={{ color: 'var(--text-dim)', marginRight: 6, fontSize: 10.5 }}>
                      C{String(step.id).padStart(2, '0')}
                    </span>
                    {step.evt}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)' }}>{a.name}</span>
                </div>
                <div className="lineage-meta">{step.title}</div>
                <div className="lineage-rationale">"{step.rationale}"</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="divider"></div>

      <div className="inspector-section">
        <h3>Selected cycle</h3>
        {cycle && (
          <div style={{ fontSize: 12 }}>
            <div className="hstack" style={{ marginBottom: 6 }}>
              <span className="mono" style={{ color: 'var(--text-dim)', fontSize: 11 }}>C{String(cycle.id).padStart(2, '0')}</span>
              <span className="agent-tag"><span className="dot" style={{ background: AGENTS[cycle.agent].color }}></span>{AGENTS[cycle.agent].name}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: 11, marginLeft: 'auto' }}>{cycle.at}</span>
            </div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{cycle.title}</div>
            <div className="dim" style={{ fontSize: 11, fontStyle: 'italic', lineHeight: 1.5 }}>"{cycle.rationale}"</div>
          </div>
        )}
      </div>
    </aside>
  );
}

function BottomTimeline({ selectedCycle, onSelectCycle, onHoverCycle }) {
  const W_CYCLES = CYCLES.length;
  const progress = selectedCycle / W_CYCLES;

  return (
    <div className="timeline">
      <div className="timeline-head">
        <button className="ctrl-btn play" title="Play"><PlayIcon /></button>
        <button className="ctrl-btn" title="Step back" onClick={() => onSelectCycle(Math.max(1, selectedCycle - 1))}><PrevIcon /></button>
        <button className="ctrl-btn" title="Step forward" onClick={() => onSelectCycle(Math.min(W_CYCLES, selectedCycle + 1))}><NextIcon /></button>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text)' }}>
          C{String(selectedCycle).padStart(2, '0')} / {String(W_CYCLES).padStart(2, '0')}
        </span>
        <span className="sep"></span>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{CYCLES.find(c => c.id === selectedCycle)?.at}</span>
        <div className="tl-progress" style={{ marginLeft: 12 }}>
          <div className="tl-progress-bar" style={{ width: `${progress * 100}%` }}></div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 8 }}>
          {CYCLES.find(c => c.id === selectedCycle)?.title}
        </span>
      </div>
      <div className="timeline-track">
        <MiniTimeline selectedCycle={selectedCycle} onSelectCycle={onSelectCycle} onHoverCycle={onHoverCycle} />
      </div>
    </div>
  );
}

function MiniTimeline({ selectedCycle, onSelectCycle, onHoverCycle }) {
  const W = 1200, H = 56;
  const LEFT = 16, RIGHT = 16;
  const cycleX = (i) => LEFT + i * ((W - LEFT - RIGHT) / (CYCLES.length - 1));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
      style={{ width: '100%', height: '100%' }}
      onMouseLeave={() => onHoverCycle(null)}>
      {/* baseline */}
      <line x1={LEFT} y1={H / 2} x2={W - RIGHT} y2={H / 2}
        stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>

      {CYCLES.map((c, i) => {
        const x = cycleX(i);
        const isSel = c.id === selectedCycle;
        const color = AGENTS[c.agent].color;
        const total = c.added.length + c.mutated.length;
        const r = 4 + Math.min(total, 6) * 0.8;
        return (
          <g key={c.id}
            onMouseEnter={() => onHoverCycle(c.id)}
            onClick={() => onSelectCycle(c.id)}
            style={{ cursor: 'pointer' }}>
            <rect x={x - 14} y={2} width={28} height={H - 4}
              fill={isSel ? 'rgba(255,255,255,0.03)' : 'transparent'} rx={3}/>
            <circle cx={x} cy={H / 2} r={r * 2.4} fill={color} opacity={isSel ? 0.2 : 0.08}/>
            <circle cx={x} cy={H / 2} r={r} fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5}/>
            <text x={x} y={14} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize="9"
              fill={isSel ? 'var(--text)' : 'var(--text-faint)'}>
              C{String(c.id).padStart(2, '0')}
            </text>
          </g>
        );
      })}

      {/* Playhead */}
      {(() => {
        const x = cycleX(selectedCycle - 1);
        return (
          <g>
            <line x1={x} y1={2} x2={x} y2={H - 2} stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="2 2"/>
          </g>
        );
      })()}
    </svg>
  );
}

function PlayIcon() {
  return <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 1.5 L9 5.5 L2 9.5 Z" fill="currentColor"/></svg>;
}
function PrevIcon() {
  return <svg width="11" height="11" viewBox="0 0 11 11"><path d="M8 1.5 L2 5.5 L8 9.5 Z" fill="currentColor"/><rect x="0.5" y="1.5" width="1.2" height="8" fill="currentColor"/></svg>;
}
function NextIcon() {
  return <svg width="11" height="11" viewBox="0 0 11 11"><path d="M3 1.5 L9 5.5 L3 9.5 Z" fill="currentColor"/><rect x="9.3" y="1.5" width="1.2" height="8" fill="currentColor"/></svg>;
}

window.App = App;
