import { useEffect, useState } from "react";

function CountUp({ value, suffix = "" }) {
  const target = Number(value);
  const decimals = (String(value).split(".")[1] || "").length;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (Number.isNaN(target)) {
      return undefined;
    }

    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const progress = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(target * eased);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [target]);

  if (Number.isNaN(target)) {
    return <>{value}{suffix}</>;
  }

  return (
    <>
      {current.toFixed(decimals)}
      {suffix}
    </>
  );
}

function ServiceStatus({ data }) {
  const health = data.evidence.service_health;

  const incident = data.incident;

  const serviceNames = {
    "transit-api": "Transit API",
    "route-planner": "Route Planner",
    "station-display": "Station Display"
  };

  const serviceDescriptions = {
    "transit-api": "Live transit information service is experiencing elevated failures.",
    "route-planner": "Route planning service is experiencing database failures.",
    "station-display": "Station display service is experiencing external provider failures."
  };

  const serviceName =
    serviceNames[incident.service] || incident.service;

  const description =
    serviceDescriptions[incident.service] || incident.impact;

  return (
    <>
      <section className="incident-header">
        <div>
          <span className="eyebrow">PRODUCTION INCIDENT</span>
          <h2>{serviceName}</h2>
          <p>{description}</p>
        </div>

        <div className={`severity ${incident.severity.toLowerCase()}`}>
          <span>SEVERITY</span>
          <strong>{incident.severity.toUpperCase()}</strong>
        </div>
      </section>

      <section className="metrics">
        <div className="metric-card">
          <span>Error Rate</span>
          <strong>
            <CountUp value={health.error_rate} suffix="%" />
          </strong>
        </div>

        <div className="metric-card">
          <span>Latency</span>
          <strong>
            <CountUp value={health.latency_ms / 1000} suffix="s" />
          </strong>
        </div>

        <div className="metric-card">
          <span>HTTP 5xx</span>
          <strong>
            <CountUp value={health.http_5xx_rate} suffix="%" />
          </strong>
        </div>

        <div className="metric-card">
          <span>Data Freshness</span>
          <strong>
            <CountUp
              value={Math.round(health.arrival_data_freshness_seconds / 60)}
              suffix=" min"
            />
          </strong>
        </div>
      </section>
    </>
  );
}

export default ServiceStatus;
