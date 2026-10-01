function ResponseCockpit({ data }) {
  const evidenceCount = Object.values(data.evidence || {}).filter(Boolean).length;
  const recovered = data.verification?.verified;
  const executed = data.remediation?.executed;
  const held = !executed && !data.decision;
  const phase = recovered
    ? { label: "Recovery verified", tone: "mint", copy: "The service has passed independent recovery checks." }
    : executed
      ? { label: "Verifying recovery", tone: "cyan", copy: "The approved action is complete; health checks are the final gate." }
      : data.decision
        ? { label: "Operator path selected", tone: "amber", copy: "The recommendation is held while the recorded decision guides next steps." }
        : { label: "Human decision required", tone: "amber", copy: "The plan is ready, but production remains unchanged until an accountable operator decides." };

  const steps = [
    { label: "Signals", state: "done" },
    { label: "Evidence", state: "done" },
    { label: "Policy", state: "done" },
    { label: "Approval", state: executed || recovered ? "done" : held ? "active" : "done" },
    { label: "Verify", state: recovered ? "done" : executed ? "active" : "next" }
  ];

  return (
    <section className="response-cockpit" aria-labelledby="response-cockpit-title">
      <div className="cockpit-copy">
        <span className="eyebrow">RESPONSE COMMANDER VIEW</span>
        <h2 id="response-cockpit-title">One incident. One accountable decision.</h2>
        <p>{phase.copy}</p>
      </div>

      <div className="cockpit-status">
        <span className={`cockpit-live ${phase.tone}`}><i></i>{phase.label}</span>
        <span className="cockpit-id">{data.incident?.id}</span>
      </div>

      <div className="response-rail" aria-label="Incident response progress">
        {steps.map((step, index) => (
          <div className={`response-step ${step.state}`} key={step.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step.label}</strong>
          </div>
        ))}
      </div>

      <div className="cockpit-facts">
        <div><span>EVIDENCE COVERAGE</span><strong>{evidenceCount}/6 signals</strong></div>
        <div><span>CONFIDENCE GATE</span><strong>{data.governance?.confidence_gate?.actual_confidence || "pending"}</strong></div>
        <div><span>PRODUCTION WRITE</span><strong>{executed ? "approved" : "held by policy"}</strong></div>
        <div><span>AUDIT RECORD</span><strong>{data.audit_trail?.length || 2} events</strong></div>
      </div>
    </section>
  );
}

export default ResponseCockpit;
