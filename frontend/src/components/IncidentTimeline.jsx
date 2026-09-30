function IncidentTimeline({ data }) {
  const recovered = data.verification?.verified;
  const remediated = data.remediation?.executed;

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Incident Timeline</h3>
        <span>{data.incident.id}</span>
      </div>

      <div className="timeline">
        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div>
            <strong>Incident detected</strong>
            <p>
              Transit API returned elevated 500/503 errors.
            </p>
          </div>
        </div>

        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div>
            <strong>Evidence collected</strong>
            <p>
              Logs, health, deployments, configuration and history analyzed.
            </p>
          </div>
        </div>

        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div>
            <strong>Root cause identified</strong>
            <p>
              Deployment v3.8 introduced problematic cache configuration.
            </p>
          </div>
        </div>

        <div className="timeline-item completed">
          <div className="timeline-marker">✓</div>
          <div>
            <strong>Human approval granted</strong>
            <p>
              High-risk rollback approved by operator.
            </p>
          </div>
        </div>

        <div className={`timeline-item ${remediated ? "completed" : "active"}`}>
          <div className="timeline-marker">
            {remediated ? "✓" : "!"}
          </div>
          <div>
            <strong>
              {remediated ? "Remediation executed" : "Waiting for remediation"}
            </strong>
            <p>
              {remediated
                ? "Transit API rolled back from v3.8 to v3.7."
                : "Rollback is awaiting approval."}
            </p>
          </div>
        </div>

        <div className={`timeline-item ${recovered ? "completed" : "active"}`}>
          <div className="timeline-marker">
            {recovered ? "✓" : "!"}
          </div>
          <div>
            <strong>
              {recovered ? "Recovery verified" : "Recovery verification"}
            </strong>
            <p>
              {recovered
                ? "Service health returned to normal."
                : "Service recovery will be verified after remediation."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncidentTimeline;