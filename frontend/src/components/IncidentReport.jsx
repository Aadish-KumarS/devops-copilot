function IncidentReport({ data }) {
  const verification = data.verification;

  if (!verification?.verified) {
    return null;
  }

  const diagnosis = data.diagnosis;
  const remediation = data.remediation;

  return (
    <section className="panel incident-report">
      <div className="panel-header">
        <h3>Incident Report</h3>
        <span>{data.incident.id}</span>
      </div>

      <div className="report-grid">
        <div className="report-section">
          <span className="eyebrow">INCIDENT</span>
          <strong>{data.incident.alert}</strong>
          <p>{data.incident.impact}</p>
        </div>

        <div className="report-section">
          <span className="eyebrow">ROOT CAUSE</span>
          <strong>{diagnosis.likely_root_cause}</strong>
          <p>
            Confidence: {diagnosis.confidence.toUpperCase()}
          </p>
        </div>

        <div className="report-section">
          <span className="eyebrow">REMEDIATION</span>
          <strong>
            {remediation.result?.from_version} →{" "}
            {remediation.result?.to_version}
          </strong>
          <p>
            Rollback executed after human approval.
          </p>
        </div>

        <div className="report-section">
          <span className="eyebrow">OUTCOME</span>
          <strong>Service recovered</strong>
          <p>
            Recovery verification passed successfully.
          </p>
        </div>
      </div>

      <div className="report-footer">
        <span>✓ INCIDENT RESOLVED</span>
        <span>Evidence-based remediation verified</span>
      </div>
    </section>
  );
}

export default IncidentReport;