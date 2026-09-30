function RecoveryMetrics({ data }) {
  const verification = data.verification;

  if (!verification?.verified) {
    return null;
  }

  const before = data.evidence.service_health;
  const after = verification.verification;

  return (
    <section className="panel recovery-metrics">
      <div className="panel-header">
        <h3>Recovery Impact</h3>
        <span>SYSTEM VERIFIED</span>
      </div>

      <div className="comparison-grid">
        <div className="comparison-card">
          <span>Error Rate</span>

          <div className="comparison-values">
            <strong>{before.error_rate}%</strong>
            <span>→</span>
            <strong>{after.error_rate}%</strong>
          </div>

          <small>Before → After</small>
        </div>

        <div className="comparison-card">
          <span>Latency</span>

          <div className="comparison-values">
            <strong>{before.latency_ms} ms</strong>
            <span>→</span>
            <strong>{after.latency_ms} ms</strong>
          </div>

          <small>Before → After</small>
        </div>

        <div className="comparison-card">
          <span>HTTP 5xx</span>

          <div className="comparison-values">
            <strong>{before.http_5xx_rate}%</strong>
            <span>→</span>
            <strong>{after.http_5xx_rate}%</strong>
          </div>

          <small>Before → After</small>
        </div>

        <div className="comparison-card">
          <span>Data Freshness</span>

          <div className="comparison-values">
            <strong>
              {Math.round(data.evidence.system_state.arrival_data_freshness_seconds / 60)} min
            </strong>
            <span>→</span>
            <strong>{after.arrival_data_freshness_seconds}s</strong>
          </div>

          <small>Before → After</small>
        </div>
      </div>
    </section>
  );
}

export default RecoveryMetrics;