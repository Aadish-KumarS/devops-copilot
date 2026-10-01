import { useEffect, useState } from "react";

const stages = [
  ["Service health", "Measuring customer-facing impact"],
  ["Application logs", "Finding the failure mechanism"],
  ["Change intelligence", "Comparing deploys and configuration"],
  ["Decision policy", "Preparing a safe recommendation"]
];

function InvestigationLoading() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveStage((current) => Math.min(current + 1, stages.length - 1));
    }, 1250);
    return () => window.clearInterval(timer);
  }, []);

  const [label, detail] = stages[activeStage];

  return (
    <div className="investigation-loading">
      <div className="loading-shell">
        <div className="investigation-status-row">
          <span className="eyebrow">AUTONOMOUS INVESTIGATION IN PROGRESS</span>
          <span className="read-only-chip">READ ONLY</span>
        </div>
        <h2>Building an evidence-backed recovery plan.</h2>
        <p>Copilot is gathering context. It cannot change production during this stage.</p>

        <div className="investigation-now">
          <span>NOW ANALYZING</span>
          <strong>{label}</strong>
          <small>{detail}</small>
        </div>

        <div className="loading-checks" aria-label="Investigation progress">
          {stages.map(([stage], index) => (
            <span className={index < activeStage ? "complete" : index === activeStage ? "active" : ""} key={stage}>
              <i>{index < activeStage ? "✓" : index === activeStage ? "•" : ""}</i>{stage}
            </span>
          ))}
        </div>
        <div className="loading-line"><span style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }}></span></div>
      </div>
    </div>
  );
}

export default InvestigationLoading;
