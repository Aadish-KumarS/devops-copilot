import { useEffect, useState } from "react";
import {
  getCurrentIncident,
  investigateIncident,
  remediateIncident,
  verifyIncident,
  resetIncident
} from "./api";
import "./App.css";
import Header from "./components/Header";
import ServiceStatus from "./components/ServiceStatus";
import IncidentTimeline from "./components/IncidentTimeline";
import RootCause from "./components/RootCause";
import ApprovalPanel from "./components/ApprovalPanel";
import RecoveryStatus from "./components/RecoveryStatus";
import RecoveryMetrics from "./components/RecoveryMetrics";
import AIAnalysis from "./components/AIAnalysis";
import IncidentReport from "./components/IncidentReport";

function App() {
  const [monitoring, setMonitoring] = useState(null);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCurrentIncident()
      .then((data) => {
        setMonitoring(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleInvestigate = async () => {
    try {
      setInvestigating(true);
      setError(null);

      const data = await investigateIncident();

      setIncident(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setInvestigating(false);
    }
  };

  const handleApproveRollback = async () => {
    try {
      const remediation = await remediateIncident(
        incident.diagnosis,
        true
      );

      const verification = await verifyIncident(
        incident.incident.service
      );

      setIncident((current) => ({
        ...current,
        remediation,
        verification
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      setError(null);

      await resetIncident();

      const data = await getCurrentIncident();

      setMonitoring(data);
      setIncident(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading system status...</div>;
  }

  if (error) {
    return <div className="loading">Error: {error}</div>;
  }

  if (investigating) {
    return (
      <div className="loading">
        <h2>Investigating Incident...</h2>
        <p>
          Collecting service health, logs, deployments,
          configuration and incident history.
        </p>
      </div>
    );
  }

  if (!incident) {
    const state = monitoring.state;

    return (
      <div className="app">
        <Header onReset={handleReset} />

        <main className="dashboard">
          <section className="incident-header">
            <div>
              <span className="eyebrow">SYSTEM MONITORING</span>
              <h2>Transit API</h2>
              <p>
                Live transit information service is currently degraded.
              </p>
            </div>

            <div className="severity">
              <span>STATUS</span>
              <strong>DEGRADED</strong>
            </div>
          </section>

          <section className="metrics">
            <div className="metric-card">
              <span>Error Rate</span>
              <strong>{state.error_rate}%</strong>
            </div>

            <div className="metric-card">
              <span>Latency</span>
              <strong>{state.latency_ms / 1000}s</strong>
            </div>

            <div className="metric-card">
              <span>HTTP 5xx</span>
              <strong>{state.http_5xx_rate}%</strong>
            </div>

            <div className="metric-card">
              <span>Data Freshness</span>
              <strong>
                {Math.round(
                  state.arrival_data_freshness_seconds / 60
                )}{" "}
                min
              </strong>
            </div>
          </section>

          <section className="approval-panel">
            <div>
              <span className="eyebrow">INCIDENT DETECTED</span>
              <h3>{monitoring.incident.alert}</h3>
              <p>{monitoring.incident.impact}</p>
            </div>

            <div className="approval-action">
              <span className="risk-label">
                READY TO INVESTIGATE
              </span>

              <button onClick={handleInvestigate}>
                Investigate Incident
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header onReset={handleReset} />

      <main className="dashboard">
        <ServiceStatus data={incident} />

        <section className="content-grid">
          <IncidentTimeline data={incident} />
          <RootCause data={incident} />
        </section>

        <AIAnalysis data={incident} />

        <ApprovalPanel
          data={incident}
          onApprove={handleApproveRollback}
        />

        <RecoveryStatus data={incident} />

        <RecoveryMetrics data={incident} />

        <IncidentReport data={incident} />
      </main>
    </div>
  );
}

export default App;