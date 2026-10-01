function HomePage({ onOpenConsole, onStartDemo }) {
  return (
    <main className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">THE SAFETY-FIRST INCIDENT COPILOT</span>
          <h2>From production alert to verified recovery—with a human in control.</h2>
          <p>
            DevOps Copilot investigates live signals, correlates evidence, and
            guides a safe path from alert to verified recovery.
          </p>
          <div className="hero-actions">
            <button type="button" onClick={onStartDemo}>Launch the 90-sec demo</button>
            <button className="secondary-button" type="button" onClick={onOpenConsole}>Explore console</button>
            <span className="hero-note"><i></i> Human approval stays in the loop</span>
          </div>
          <div className="hero-proof" aria-label="Product highlights">
            <span><b>6</b> evidence sources</span>
            <span><b>1</b> deterministic safety gate</span>
            <span><b>∞</b> audit-ready decisions</span>
          </div>
        </div>

        <div className="hero-terminal" aria-label="Example incident workflow">
          <div className="terminal-bar"><span></span><span></span><span></span><b>copilot / workflow</b></div>
          <div className="terminal-content">
            <p><em>$</em> incident.detect <strong>Route Planner</strong></p>
            <p><em>✓</em> signals collected <small>6 sources</small></p>
            <p><em>✓</em> root cause identified <small>high confidence</small></p>
            <p><em>!</em> approval required <small>production rollback</small></p>
            <div className="terminal-progress"><span></span></div>
            <p className="terminal-ready"><em>›</em> ready for operator review<span className="cursor"></span></p>
          </div>
        </div>
      </section>

      <section className="capability-section" aria-labelledby="capabilities-title">
        <div className="section-intro">
          <span className="eyebrow">HOW IT WORKS</span>
          <h2 id="capabilities-title">One calm, traceable response loop.</h2>
        </div>
        <div className="capability-grid">
          <article className="capability-card">
            <span className="card-index">01</span>
            <h3>Investigate</h3>
            <p>Bring health, logs, deployments, configuration, and history into one evidence trail.</p>
          </article>
          <article className="capability-card">
            <span className="card-index">02</span>
            <h3>Decide safely</h3>
            <p>Assess remediation risk and keep production-changing actions behind explicit approval.</p>
          </article>
          <article className="capability-card">
            <span className="card-index">03</span>
            <h3>Verify recovery</h3>
            <p>Confirm the service is healthy again, with metrics and an audit-ready report.</p>
          </article>
        </div>
      </section>

      <section className="safety-story" aria-labelledby="safety-story-title">
        <div>
          <span className="eyebrow">THE DIFFERENCE</span>
          <h2 id="safety-story-title">AI can investigate. Policy decides. People authorize.</h2>
        </div>
        <div className="safety-flow">
          <span>Signals</span><i></i><span>AI investigation</span><i></i><span className="highlight">Risk policy</span><i></i><span className="highlight mint">Human approval</span><i></i><span>Verified recovery</span>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
