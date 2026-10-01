function toText(data) {
  const incident = data.incident || {};
  const diagnosis = data.diagnosis || {};
  const gate = data.governance?.confidence_gate || {};
  const lines = [
    "DEVOPS COPILOT — INCIDENT BRIEF",
    "",
    `Incident: ${incident.id || "Not available"}`,
    `Service: ${incident.service || "Not available"}`,
    `Severity: ${incident.severity || "Not available"}`,
    `Impact: ${incident.impact || "Not available"}`,
    "",
    "DIAGNOSIS",
    `Likely root cause: ${diagnosis.likely_root_cause || "Not available"}`,
    `Confidence: ${diagnosis.confidence || "Not available"}`,
    `Recommended action: ${diagnosis.recommended_action || "Not available"}`,
    "",
    "GOVERNANCE",
    `Minimum confidence: ${gate.minimum_confidence || "Not available"}`,
    `Policy outcome: ${gate.meets_threshold ? "Eligible for human review" : "Held for more evidence"}`,
    `Production action: ${data.remediation?.executed ? "Executed after approval" : "No unapproved production write"}`,
    "",
    `Audit events captured: ${data.audit_trail?.length || 0}`
  ];
  return lines.join("\n");
}

function ExportBrief({ data }) {
  const exportBrief = () => {
    const blob = new Blob([toText(data)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${data.incident?.id || "incident"}-brief.txt`.toLowerCase();
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="export-brief" aria-label="Incident handoff brief">
      <div>
        <span className="eyebrow">HANDOFF READY</span>
        <strong>Turn this incident into a concise, reviewable brief.</strong>
        <p>The export captures the incident, evidence-based diagnosis, policy outcome, and current audit state.</p>
      </div>
      <button type="button" className="secondary-button" onClick={exportBrief}>Export incident brief</button>
    </section>
  );
}

export default ExportBrief;
