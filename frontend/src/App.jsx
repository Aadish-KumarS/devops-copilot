import { useEffect, useState } from "react";
import {
  investigateIncident,
  remediateIncident,
  verifyIncident,
  resetIncident,
  getCurrentIncident,
  getScenarios,
  selectScenario
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
import AgentActivity from "./components/AgentActivity"

function App() {
  const [monitoring, setMonitoring] = useState(null);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [error, setError] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState("");

  useEffect(() => {
    getScenarios()
      .then((data) => {
        setScenarios(data.scenarios);
        setActiveScenario(data.active);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleScenarioChange = async (event) => {
    try {
      const data = await selectScenario(event.target.value);
      setActiveScenario(data.active);
    } catch (error) {
      console.error(error);
    }
  };

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

      const data = await investigateIncident(activeScenario);

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
        true,
        activeScenario,
        incident
      );

      const verification = await verifyIncident(
        incident.incident.service,
        activeScenario,
        {
          ...incident,
          remediation
        }
      );

      setIncident((current) => ({
        ...current,
        remediation: remediation.remediation || remediation,
        verification: verification,
        audit_trail: verification.audit_trail || []
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

  const scenarioInfo = {
    cache_failure: {
      service: "Transit API",
      description: "Live transit information service is currently degraded.",
      status: "DEGRADED",
      latencyUnit: "s",
      freshnessUnit: "min"
    },
    database_failure: {
      service: "Route Planner",
      description: "Route planning service is currently experiencing database failures.",
      status: "CRITICAL",
      latencyUnit: "s",
      freshnessUnit: "min"
    },
    external_api_failure: {
      service: "Station Display",
      description: "Station display service is experiencing external provider failures.",
      status: "DEGRADED",
      latencyUnit: "s",
      freshnessUnit: "min"
    }
  };

  const currentScenario = scenarioInfo[activeScenario];

  if (!incident) {
    const scenarioMetrics = {
      cache_failure: {
        error_rate: 42.3,
        latency_ms: 4200,
        http_5xx_rate: 38.7,
        arrival_data_freshness_seconds: 420
      },
      database_failure: {
        error_rate: 61.8,
        latency_ms: 6800,
        http_5xx_rate: 54.2,
        arrival_data_freshness_seconds: 510
      },
      external_api_failure: {
        error_rate: 29.4,
        latency_ms: 3900,
        http_5xx_rate: 24.1,
        arrival_data_freshness_seconds: 360
      }
  };

  const state = scenarioMetrics[activeScenario] || scenarioMetrics.cache_failure;

    return (
      <div className="app">
        <Header onReset={handleReset} />

        <main className="dashboard">
          <section className="incident-header">
            <div>
              <span className="eyebrow">SYSTEM MONITORING</span>
              <h2>{currentScenario?.service}</h2>
              <p>{currentScenario?.description}</p>
            </div>

            <div className="severity">
              <span>STATUS</span>
              <strong>{currentScenario?.status}</strong>
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

      <div className="scenario-selector">
        <label>INCIDENT SCENARIO</label>

        <select value={activeScenario} onChange={handleScenarioChange}>
          {scenarios.map((scenario) => (
            <option key={scenario} value={scenario}>
              {scenario.replaceAll("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <main className="dashboard">
        <ServiceStatus data={incident} />

        <AgentActivity
          trace={incident.investigation_trace}
          data={incident}
        />

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