function IncidentTimeline({ data }) {
  const recovered = data.verification?.verified;
  const remediated = data.remediation?.executed;

  const incident = data.incident;
  const diagnosis = data.diagnosis;
  const remediation = data.remediation;

  const service = incident?.service || "service";

  const remediationText = remediation?.result?.from_version &&
    remediation?.result?.to_version
    ? `${remediation.result.from_version} → ${remediation.result.to_version}`
    : remediation?.action === "restore_provider_connection"
      ? "External provider connection restored."
      : "Remediation executed.";

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Incident Timeline</h3>
        <span>{incident.id}</span>
      </div>

      <div className="timeline">
        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div>
            <strong>Incident detected</strong>
            <p>{incident.alert}</p>
          </div>
        </div>

        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div>
            <strong>Evidence collected</strong>
            <p>
              Health, logs, deployments, configuration and incident history
              analyzed for {service}.
            </p>
          </div>
        </div>

        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div>
            <strong>Root cause identified</strong>
            <p>{diagnosis.likely_root_cause}</p>
          </div>
        </div>

        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div>
            <strong>Human approval granted</strong>
            <p>
              High-risk remediation approved by operator.
            </p>
          </div>
        </div>

        <div className={`timeline-item ${remediated ? "completed" : "active"}`}>
          <div className="timeline-marker">
            {remediated ? "✓" : "!"}
          </div>

          <div>
            <strong>
              {remediated
                ? "Remediation executed"
                : "Waiting for remediation"}
            </strong>

            <p>
              {remediated
                ? remediationText
                : "Remediation is awaiting approval."}
            </p>
          </div>
        </div>

        <div className={`timeline-item ${recovered ? "completed" : "active"}`}>
          <div className="timeline-marker">
            {recovered ? "✓" : "!"}
          </div>

          <div>
            <strong>
              {recovered
                ? "Recovery verified"
                : "Recovery verification"}
            </strong>

            <p>
              {recovered
                ? `${service} health returned to normal and recovery was verified.`
                : "Service recovery will be verified after remediation."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentTimeline;