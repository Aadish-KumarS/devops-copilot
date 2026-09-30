function IncidentReport({ data }) {
  const incident = data.incident;
  const diagnosis = data.diagnosis;
  const remediation = data.remediation;
  const verification = data.verification;
  const auditTrail = data.audit_trail || [];

  if (!incident) return null;

  const incidentId = incident.id || "INC-UNKNOWN";

  return (
    <section className="panel incident-report">
      <div className="panel-header">
        <h3>Incident Report</h3>
        <span>{incidentId}</span>
      </div>

      <div className="report-section">
        <span className="eyebrow">INCIDENT</span>
        <h4>{incident.alert}</h4>
        <p>{incident.impact}</p>
      </div>

      <div className="report-section">
        <span className="eyebrow">ROOT CAUSE</span>
        <h4>{diagnosis.likely_root_cause}</h4>
        <p>Confidence: {diagnosis.confidence?.toUpperCase()}</p>
      </div>

      <div className="report-section">
        <span className="eyebrow">RISK ASSESSMENT</span>
        <h4>{data.risk?.risk_level?.toUpperCase()} RISK</h4>
        <p>{data.risk?.reason}</p>
        {data.risk?.requires_approval && (
          <p>Human approval was required before remediation.</p>
        )}
      </div>

      {remediation?.executed && (
        <div className="report-section">
          <span className="eyebrow">REMEDIATION</span>
          <h4>
            {remediation.result?.from_version &&
            remediation.result?.to_version
              ? `${remediation.result.from_version} → ${remediation.result.to_version}`
              : remediation.action}
          </h4>
          <p>Remediation executed after human approval.</p>
        </div>
      )}

      {verification?.verified && (
        <div className="report-section">
          <span className="eyebrow">OUTCOME</span>
          <h4>Service recovered</h4>
          <p>Recovery verification passed successfully.</p>
        </div>
      )}

      {auditTrail.length > 0 && (
        <div className="report-section audit-section">
          <span className="eyebrow">AUDIT TRAIL</span>

          <div className="audit-list">
            {auditTrail.map((event, index) => (
              <div className="audit-item" key={index}>
                <div className="audit-marker">✓</div>

                <div className="audit-content">
                  <strong>
                    {event.event
                      .replaceAll("_", " ")
                      .toUpperCase()}
                  </strong>

                  <p>{event.message}</p>

                  <small>
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {verification?.verified && (
        <div className="report-success">
          ✓ INCIDENT RESOLVED
          <span>Evidence-based remediation verified</span>
        </div>
      )}
    </section>
  );
}

export default IncidentReport;