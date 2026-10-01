function OperationsPanel({ data }) {
  const telemetry = data.telemetry;
  const notifications = data.governance?.notifications || [];
  if (!telemetry) return null;

  return (
    <section className="operations-panel">
      <div className="operations-heading"><span className="eyebrow">OPERATIONS TELEMETRY</span><h2>Transparent AI operations, not a black box.</h2></div>
      <div className="telemetry-grid">
        <div><span>INVESTIGATION MODE</span><strong>{telemetry.mode.replaceAll("_", " ")}</strong></div>
        <div><span>AGENT LATENCY</span><strong>{telemetry.duration_ms} ms</strong></div>
        <div><span>EST. MODEL COST</span><strong>${telemetry.estimated_cost_usd.toFixed(5)}</strong></div>
        <div><span>TOOL CALLS</span><strong>{telemetry.tool_calls}</strong></div>
      </div>
      <div className="notification-list">
        <span className="eyebrow">NOTIFICATION ADAPTERS · SIMULATION</span>
        {notifications.map((item) => <div key={item.id || item.channel}><i>✓</i><span>{item.channel}</span><small>{item.status.replaceAll("_", " ")}</small></div>)}
      </div>
    </section>
  );
}

export default OperationsPanel;
