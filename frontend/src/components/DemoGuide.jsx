function DemoGuide({ activeScenario, onStartDemo }) {
  const selected = activeScenario === "database_failure";

  return (
    <section className="demo-guide" aria-labelledby="demo-guide-title">
      <div className="demo-guide-copy">
        <span className="eyebrow">JUDGE-READY DEMO</span>
        <h2 id="demo-guide-title">See a safe recovery loop in under 90 seconds.</h2>
        <p>
          Start with a database regression: the clearest path from evidence to
          human-approved rollback and verified recovery.
        </p>
      </div>
      <ol className="demo-steps" aria-label="Demo steps">
        <li><span>01</span> Investigate signals</li>
        <li><span>02</span> Review evidence</li>
        <li><span>03</span> Approve safely</li>
        <li><span>04</span> Verify recovery</li>
      </ol>
      <div className="demo-guide-action">
        <span className="demo-state">{selected ? "DATABASE REGRESSION READY" : "RECOMMENDED: DATABASE REGRESSION"}</span>
        <button type="button" onClick={onStartDemo}>Start guided demo</button>
      </div>
    </section>
  );
}

export default DemoGuide;
