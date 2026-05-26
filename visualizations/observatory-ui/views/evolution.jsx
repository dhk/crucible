/* global React, CYCLES, DOC */
// Document Evolution — diff viewer for all cycles.

const { useState: useEvoState, useMemo: useEvoMemo } = React;

// Agent colours
const AGENT_COLORS = {
  strawman:    '#f59e0b',
  steelman:    '#3b82f6',
  adversarial: '#ef4444',
};

// Parse a unified diff string into typed line objects.
function parseDiff(diff) {
  if (!diff) return [];
  return diff.split('\n').map(raw => {
    if (raw.startsWith('@@'))  return { type: 'hunk', text: raw };
    if (raw.startsWith('+'))   return { type: 'add',  text: raw.slice(1) };
    if (raw.startsWith('-'))   return { type: 'del',  text: raw.slice(1) };
    return { type: 'ctx', text: raw };
  });
}

// Count added/deleted lines in a diff string.
function diffStats(diff) {
  if (!diff) return { added: 0, deleted: 0 };
  let added = 0, deleted = 0;
  diff.split('\n').forEach(line => {
    if (line.startsWith('+') && !line.startsWith('+++')) added++;
    else if (line.startsWith('-') && !line.startsWith('---')) deleted++;
  });
  return { added, deleted };
}

function DocumentEvolution() {
  const cycles = (typeof CYCLES !== 'undefined' ? CYCLES : []);
  const doc    = (typeof DOC    !== 'undefined' ? DOC    : {});

  // Default selection: first cycle with non-empty diff, else first cycle
  const defaultCycle = useEvoMemo(() => {
    const withDiff = cycles.find(c => c.diff && c.diff.trim().length > 0);
    return (withDiff || cycles[0] || null);
  }, []);

  const [selectedId, setSelectedId] = useEvoState(defaultCycle ? defaultCycle.id : null);
  const selected = useEvoMemo(() => cycles.find(c => c.id === selectedId) || null, [selectedId, cycles]);

  // Total lines changed across all cycles
  const totals = useEvoMemo(() => {
    let added = 0, deleted = 0;
    cycles.forEach(c => {
      const s = diffStats(c.diff);
      added   += s.added;
      deleted += s.deleted;
    });
    return { added, deleted };
  }, [cycles]);

  const parsedDiff = useEvoMemo(() => selected ? parseDiff(selected.diff) : [], [selected]);
  const selectedStats = useEvoMemo(() => selected ? diffStats(selected.diff) : { added: 0, deleted: 0 }, [selected]);

  const docTitle = doc.title || doc.path || 'Document';

  return (
    <div className="evolution-root">
      {/* Left: cycle list */}
      <div className="evo-list">
        <div className="evo-list-header">
          <div className="evo-list-title">Document Evolution</div>
          <div className="evo-list-meta">
            {docTitle} · {cycles.length} cycles ·{' '}
            <span className="evo-diff-add">+{totals.added}</span>{' '}
            <span className="evo-diff-del">−{totals.deleted}</span>
          </div>
        </div>
        <div className="evo-list-scroll">
          {cycles.map(c => {
            const stats = diffStats(c.diff);
            const hasDiff = c.diff && c.diff.trim().length > 0;
            return (
              <div
                key={c.id}
                className={`evo-cycle-row${selectedId === c.id ? ' active' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                <span className="evo-cycle-num">C{String(c.id).padStart(2, '0')}</span>
                <div className="evo-cycle-body">
                  <span className={`evo-agent-badge ${c.agent}`}>{c.agent}</span>
                  <div className="evo-cycle-date">{c.at}</div>
                  <div className="evo-diff-stats">
                    {hasDiff ? (
                      <>
                        <span className="evo-diff-add">+{stats.added}</span>
                        <span className="evo-diff-del">−{stats.deleted}</span>
                      </>
                    ) : (
                      <span className="evo-diff-none">no diff</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: diff viewer */}
      <div className="evo-diff">
        {selected && (
          <div className="evo-diff-header">
            <span className="evo-diff-cycle-label">C{String(selected.id).padStart(2, '0')}</span>
            <span className={`evo-agent-badge ${selected.agent}`}>{selected.agent}</span>
            <span className="evo-diff-date">{selected.at}</span>
            {(selected.diff && selected.diff.trim().length > 0) && (
              <>
                <span className="evo-diff-add" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11 }}>+{selectedStats.added}</span>
                <span className="evo-diff-del" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11 }}>−{selectedStats.deleted}</span>
              </>
            )}
          </div>
        )}
        <div className="evo-diff-scroll">
          {!selected ? (
            <div className="evo-diff-empty">No cycles available.</div>
          ) : !(selected.diff && selected.diff.trim().length > 0) ? (
            <div className="evo-diff-empty">No document changes recorded for this cycle.</div>
          ) : (
            <div className="evo-diff-body">
              {parsedDiff.map((line, i) => (
                <div key={i} className={`evo-diff-line ${line.type}`}>
                  <span className="evo-diff-line-sig">
                    {line.type === 'add' ? '+' : line.type === 'del' ? '−' : line.type === 'hunk' ? '@@' : ' '}
                  </span>
                  <span>{line.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.DocumentEvolution = DocumentEvolution;
