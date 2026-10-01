function AboutPage({ onOpenConsole }) {
  return (
    <main className="about-page">
      <section className="about-hero">
        <span className="eyebrow">ABOUT DEVOPS COPILOT</span>
        <h2>Autonomy with a clear human hand on the controls.</h2>
        <p>
          Built for incident response, DevOps Copilot turns disconnected production signals into an explainable recovery plan—without letting automation outrun accountability.
        </p>
      </section>

      <section className="principles-grid" aria-label="Product principles">
        <article className="principle-card"><span>01</span><h3>Evidence first</h3><p>Every diagnosis is grounded in service health, logs, deployments, configuration, and prior incidents.</p></article>
        <article className="principle-card"><span>02</span><h3>Risk aware</h3><p>Deterministic policies evaluate recommended actions before anything affects production.</p></article>
        <article className="principle-card"><span>03</span><h3>Always auditable</h3><p>From detection through verification, the full response path is captured for review.</p></article>
      </section>

      <section className="about-cta">
        <div>
          <span className="eyebrow">READY TO EXPLORE</span>
          <h3>See the incident response console in action.</h3>
        </div>
        <button type="button" onClick={onOpenConsole}>Launch console</button>
      </section>
    </main>
  );
}

export default AboutPage;
