import { useEffect, useState } from "react";
import {
  investigateIncident,
  remediateIncident,
  verifyIncident,
  resetIncident,
  getCurrentIncident,
  getScenarios,
  selectScenario,
  assignIncident,
  recordIncidentDecision
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
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import DemoGuide from "./components/DemoGuide";
import TrustLedger from "./components/TrustLedger";
import ControlPlane from "./components/ControlPlane";
import RunbookPanel from "./components/RunbookPanel";
import ServiceImpact from "./components/ServiceImpact";
import OperationsPanel from "./components/OperationsPanel";
import RecordsPage from "./components/RecordsPage";
import ResponseCockpit from "./components/ResponseCockpit";
import EvidenceMap from "./components/EvidenceMap";
import ExportBrief from "./components/ExportBrief";
import InvestigationLoading from "./components/InvestigationLoading";

function App() {
  const [monitoring, setMonitoring] = useState(null);
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [investigating, setInvestigating] = useState(false);
  const [error, setError] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState("");
  const [activePage, setActivePage] = useState("home");

  useEffect(() => {
    if (activePage !== "dashboard") return;

    getScenarios()
      .then((data) => {
        setScenarios(data.scenarios);
        setActiveScenario(data.active);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [activePage]);

  const handleScenarioChange = async (event) => {
    try {
      const data = await selectScenario(event.target.value);
      setActiveScenario(data.active);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (activePage !== "dashboard") return;

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
  }, [activePage]);

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

  const handleApproveRollback = async (approval) => {
    try {
      const remediation = await remediateIncident(
        incident.diagnosis,
        true,
        activeScenario,
        incident,
        approval,
        crypto.randomUUID()
      );

      const verification = await verifyIncident(
        incident.incident.service,
        activeScenario,
        {
          ...incident,
          remediation,
          approval: remediation.approval || approval
        }
      );

      setIncident((current) => ({
        ...current,
        remediation: remediation.remediation || remediation,
        verification: verification,
        approval: remediation.approval || approval,
        audit_trail: verification.audit_trail || []
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAssignOwner = async (owner) => {
    try {
      const result = await assignIncident(incident.incident.id, owner);
      setIncident((current) => ({ ...current, governance: { ...current.governance, incident_owner: result.incident.owner } }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecision = async (decision) => {
    try {
      const reason = decision === "manual" ? "Operator selected the documented runbook path." : "Operator rejected the recommendation after review.";
      const result = await recordIncidentDecision(incident.incident.id, decision, reason);
      setIncident((current) => ({ ...current, decision, audit_trail: result.audit_trail || current.audit_trail }));
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

  const openConsole = () => setActivePage("dashboard");

  const handleGuidedDemo = async () => {
    try {
      setActivePage("dashboard");
      setInvestigating(true);
      setError(null);
      const scenario = "database_failure";
      await resetIncident();
      await selectScenario(scenario);
      setActiveScenario(scenario);
      const data = await investigateIncident(scenario);
      setIncident(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setInvestigating(false);
    }
  };

  if (activePage === "home") {
    return (
      <div className="app">
        <Header onReset={handleReset} activePage={activePage} onNavigate={setActivePage} />
        <HomePage onOpenConsole={openConsole} onStartDemo={handleGuidedDemo} />
      </div>
    );
  }

  if (activePage === "about") {
    return (
      <div className="app">
        <Header onReset={handleReset} activePage={activePage} onNavigate={setActivePage} />
        <AboutPage onOpenConsole={openConsole} />
      </div>
    );
  }

  if (activePage === "records") {
    return (
      <div className="app">
        <Header onReset={handleReset} activePage={activePage} onNavigate={setActivePage} />
        <RecordsPage />
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading system status...</div>;
  }

  if (error) {
    return <div className="loading">Error: {error}</div>;
  }

  if (investigating) {
    return <InvestigationLoading />;
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
        <Header onReset={handleReset} activePage={activePage} onNavigate={setActivePage} />

        <main className="dashboard">
          <DemoGuide activeScenario={activeScenario} onStartDemo={handleGuidedDemo} />
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
      <Header onReset={handleReset} activePage={activePage} onNavigate={setActivePage} />

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

        <ResponseCockpit data={incident} />

        <EvidenceMap data={incident} />

        <AgentActivity
          trace={incident.investigation_trace}
          data={incident}
        />

        <section className="content-grid">
          <IncidentTimeline data={incident} />
          <RootCause data={incident} />
        </section>

        <AIAnalysis data={incident} />

        <TrustLedger data={incident} />

        <ControlPlane data={incident} onAssign={handleAssignOwner} />

        <section className="content-grid governance-grid">
          <RunbookPanel data={incident} />
          <ServiceImpact data={incident} />
        </section>

        <ApprovalPanel
          data={incident}
          onApprove={handleApproveRollback}
          onDecision={handleDecision}
        />

        <RecoveryStatus data={incident} />

        <RecoveryMetrics data={incident} />

        <OperationsPanel data={incident} />

        <ExportBrief data={incident} />

        <IncidentReport data={incident} />
      </main>
    </div>
  );
}

export default App;
