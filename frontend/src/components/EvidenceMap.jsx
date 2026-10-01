const sourceMeta = [
  ["service_health", "Service health", "Measured impact"],
  ["logs", "Application logs", "Failure mechanism"],
  ["deployments", "Deployment history", "Change context"],
  ["config_changes", "Configuration", "Regression evidence"],
  ["incident_history", "Incident history", "Prior pattern"],
  ["system_state", "System state", "Environment context"]
];

function evidenceSummary(key, value) {
  if (!value) return "Not available";
  if (key === "service_health") return `${value.error_rate}% error rate observed`;
  if (key === "deployments") return value[0]?.version ? `${value[0].version} identified` : "Release evidence available";
  if (key === "logs") return Array.isArray(value) ? "Failure signal found" : "Log signal found";
  if (key === "config_changes") return Array.isArray(value) ? "Configuration delta found" : "Configuration signal found";
  if (key === "incident_history") return Array.isArray(value) && value.length ? "Related incidents reviewed" : "No matching prior record";
  return "Runtime state captured";
}

function EvidenceMap({ data }) {
  const evidence = data.evidence || {};
  const diagnosis = data.diagnosis || {};

  return (
    <section className="evidence-map" aria-labelledby="evidence-map-title">
      <div className="evidence-map-header">
        <div>
          <span className="eyebrow">EVIDENCE-TO-DECISION MAP</span>
          <h2 id="evidence-map-title">Why the copilot can recommend—not guess.</h2>
        </div>
        <span className="read-only-chip">READ-ONLY INVESTIGATION</span>
      </div>

      <div className="evidence-map-body">
        <div className="signal-cluster" aria-label="Investigated evidence sources">
          {sourceMeta.map(([key, name, role]) => (
            <article className={`signal-source ${evidence[key] ? "confirmed" : ""}`} key={key}>
              <i>{evidence[key] ? "✓" : "·"}</i>
              <div><strong>{name}</strong><span>{role}</span></div>
              <small>{evidenceSummary(key, evidence[key])}</small>
            </article>
          ))}
        </div>

        <div className="evidence-convergence" aria-label="Evidence conclusion">
          <span>6 sources converge</span>
          <i></i>
          <div className="diagnosis-node">
            <span>LIKELY ROOT CAUSE</span>
            <strong>{diagnosis.likely_root_cause || "Evidence review in progress"}</strong>
            <small>{diagnosis.confidence ? `${diagnosis.confidence.toUpperCase()} CONFIDENCE` : "PENDING CONFIDENCE"}</small>
          </div>
          <i></i>
          <div className="policy-node">
            <span>POLICY CHECK</span>
            <strong>{data.governance?.confidence_gate?.meets_threshold ? "Eligible for human review" : "More evidence required"}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EvidenceMap;
