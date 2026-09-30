function ServiceStatus({ data }) {
  const health = data.evidence.service_health;
  const state = data.evidence.system_state;

  return (
    <>
      <section className="incident-header">
        <div>
          <span className="eyebrow">PRODUCTION INCIDENT</span>
          <h2>Transit API</h2>
          <p>
            Live transit information service is experiencing elevated failures.
          </p>
        </div>

        <div className="severity">
          <span>SEVERITY</span>
          <strong>{data.incident.severity.toUpperCase()}</strong>
        </div>
      </section>

      <section className="metrics">
        <div className="metric-card">
          <span>Error Rate</span>
          <strong>{health.error_rate}%</strong>
        </div>

        <div className="metric-card">
          <span>Latency</span>
          <strong>{health.latency_ms / 1000}s</strong>
        </div>

        <div className="metric-card">
          <span>HTTP 5xx</span>
          <strong>{health.http_5xx_rate}%</strong>
        </div>

        <div className="metric-card">
          <span>Data Freshness</span>
          <strong>{Math.round(state.arrival_data_freshness_seconds / 60)} min</strong>
        </div>
      </section>
    </>
  );
}

export default ServiceStatus;