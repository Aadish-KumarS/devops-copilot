function TrustLedger({ data }) {
  const traceCount = data.investigation_trace?.length || 0;
  const approvalRequired = data.risk?.requires_approval;

  return (
    <section className="trust-ledger" aria-labelledby="trust-ledger-title">
      <div className="ledger-heading">
        <span className="eyebrow">DECISION LEDGER</span>
        <h2 id="trust-ledger-title">Every recommendation is explainable and gated.</h2>
      </div>
      <div className="ledger-items">
        <article>
          <span className="ledger-icon cyan">01</span>
          <div><strong>{traceCount || 6} evidence checks</strong><p>Health, logs, deploys, config, history, and system state are correlated before a diagnosis.</p></div>
        </article>
        <article>
          <span className="ledger-icon amber">02</span>
          <div><strong>{data.diagnosis.confidence.toUpperCase()} confidence diagnosis</strong><p>The agent explains the likely root cause and shows the supporting evidence.</p></div>
        </article>
        <article>
          <span className="ledger-icon mint">03</span>
          <div><strong>{approvalRequired ? "Human approval required" : "Policy cleared"}</strong><p>A deterministic risk gate controls whether the proposed action can proceed.</p></div>
        </article>
      </div>
    </section>
  );
}

export default TrustLedger;
