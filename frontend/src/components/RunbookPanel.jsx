function RunbookPanel({ data }) {
  const runbook = data.governance?.runbook;
  if (!runbook) return null;

  return (
    <section className="panel runbook-panel">
      <div className="panel-header"><h3>Recommended Runbook</h3><span>HUMAN-READABLE</span></div>
      <span className="eyebrow">WHY THIS ACTION</span>
      <h4>{runbook.title}</h4>
      <p>{runbook.why}</p>
      <div className="runbook-steps">
        {runbook.manual_steps.map((step, index) => <div key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</div>)}
      </div>
      <a className="runbook-link" href={runbook.url} target="_blank" rel="noreferrer">Open full runbook ↗</a>
    </section>
  );
}

export default RunbookPanel;
