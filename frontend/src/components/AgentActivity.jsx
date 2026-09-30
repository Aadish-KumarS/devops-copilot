function getToolLabel(tool) {
  const labels = {
    get_service_health: "Inspecting service health",
    get_logs: "Analyzing application logs",
    get_recent_deployments: "Inspecting recent deployments",
    get_config_changes: "Inspecting configuration changes",
    search_incident_history: "Searching incident history",
    get_system_state: "Inspecting system state"
  };

  return labels[tool] || tool;
}

function AgentActivity({ trace, data }) {
  if (!trace || trace.length === 0) {
    return null;
  }

  const health = data?.evidence?.service_health;
  const logs = data?.evidence?.logs || [];
  const deployments = data?.evidence?.deployments || [];
  const configChanges = data?.evidence?.config_changes || [];

  const deployment = deployments[0];

  return (
    <section className="agent-activity">
      <div className="section-header">
        <div>
          <p className="eyebrow">AUTONOMOUS INVESTIGATION</p>
          <h2>Agent Activity</h2>
        </div>

        <span className="agent-status">
          INVESTIGATION COMPLETE · {trace.length + 1} STEPS
        </span>
      </div>

      <div className="activity-list">
        {trace.map((step, index) => (
          <div
            className="activity-item"
            key={`${step.tool}-${index}`}
          >
            <div className="activity-marker">
              <span>✓</span>
            </div>

            <div className="activity-content">
              <div className="activity-title">
                {getToolLabel(step.tool)}
              </div>

              <div className="activity-tool">
                {step.tool}
              </div>

              {step.reason && (
                <div className="activity-reason">
                  {step.reason}
                </div>
              )}
            </div>

            <div className="activity-iteration">
              {String(step.iteration).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>

      <div className="agent-correlation">
        <div className="activity-marker">
          <span>✓</span>
        </div>

        <div className="activity-content">
          <div className="activity-title">
            Evidence correlation
          </div>

          <div className="activity-tool">
            agent.reasoning
          </div>

          <div className="correlation-grid">
            {health && (
              <div className="correlation-card">
                <span>HEALTH</span>
                <strong>
                  {health.error_rate}% errors
                </strong>
                <p>
                  {health.latency_ms}ms latency
                </p>
              </div>
            )}

            {logs.length > 0 && (
              <div className="correlation-card">
                <span>LOGS</span>
                <strong>
                  {logs[0]}
                </strong>
                <p>
                  Failure mechanism identified
                </p>
              </div>
            )}

            {deployment && (
              <div className="correlation-card">
                <span>DEPLOYMENT</span>
                <strong>
                  {deployment.version}
                </strong>
                <p>
                  {deployment.change}
                </p>
              </div>
            )}

            {configChanges.length > 0 && (
              <div className="correlation-card">
                <span>CONFIGURATION</span>
                <strong>
                  {configChanges[0]}
                </strong>
                <p>
                  Configuration change detected
                </p>
              </div>
            )}
          </div>

          <div className="correlation-result">
            <span>CONCLUSION</span>
            <strong>
              Evidence from multiple sources points to a
              configuration-related failure.
            </strong>
          </div>
        </div>

        <div className="activity-iteration">
          {String(trace.length + 1).padStart(2, "0")}
        </div>
      </div>
    </section>
  );
}

export default AgentActivity;