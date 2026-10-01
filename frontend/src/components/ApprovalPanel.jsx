import { useState } from "react";

function ApprovalPanel({ data, onApprove, onDecision }) {
  const remediated = data.remediation?.executed;
  const recovered = data.verification?.verified;
  const diagnosis = data.diagnosis;
  const [acknowledged, setAcknowledged] = useState(false);
  const actionLabel = data.remediation?.action === "restore_provider_connection"
    ? "Provider connection restored"
    : "Rollback executed successfully";
  const approvalLabel = diagnosis?.recommended_action?.toLowerCase().includes("rollback")
    ? "Approve rollback"
    : "Approve action";

  if (recovered) {
    return (
      <section className="approval-panel">
        <div>
          <span className="eyebrow">REMEDIATION COMPLETE</span>
          <h3>{actionLabel}</h3>
          <p>
            The approved remediation completed and service recovery has been
            independently verified.
          </p>
        </div>

        <div className="approval-action">
          <span className="risk-label">ACTION COMPLETE</span>
          <button disabled>
            ✓ Action Executed
          </button>
        </div>
      </section>
    );
  }

  if (remediated) {
    return (
      <section className="approval-panel">
        <div>
          <span className="eyebrow">REMEDIATION</span>
          <h3>Rollback executed</h3>
          <p>
            The system is verifying service recovery.
          </p>
        </div>

        <div className="approval-action">
          <span className="risk-label">VERIFYING</span>
          <button disabled>
            Verifying...
          </button>
        </div>
      </section>
    );
  }

  if (data.decision) {
    const manual = data.decision === "manual";
    return (
      <section className={`approval-panel decision-state ${manual ? "manual" : "rejected"}`}>
        <div>
          <span className="eyebrow">OPERATOR DECISION RECORDED</span>
          <h3>{manual ? "Manual remediation selected" : "Recommendation rejected"}</h3>
          <p>{manual ? "Follow the recommended runbook and record the outcome in the incident ledger." : "No production change was executed. The incident remains fully auditable."}</p>
        </div>
        <div className="approval-action"><span className="risk-label">APPEND-ONLY AUDIT UPDATED</span><button disabled>{manual ? "Runbook path active" : "Action held"}</button></div>
      </section>
    );
  }

  return (
    <section className="approval-panel">
      <div>
        <span className="eyebrow">RECOMMENDED ACTION</span>
        <h3>{diagnosis.recommended_action}</h3>
        <p>
          {data.risk?.reason || "This action modifies production state and requires human approval."}
        </p>
        <label className="approval-check">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => setAcknowledged(event.target.checked)}
          />
          <span>I reviewed the evidence and accept the production impact.</span>
        </label>
      </div>

      <div className="approval-action">
        <span className="risk-label">
          {diagnosis.risk_level.toUpperCase()} RISK
        </span>

        <button disabled={!acknowledged} onClick={() => onApprove({
          operator: "Demo Operator",
          role: "Incident Commander",
          reason: "Evidence reviewed and production impact acknowledged."
        })}>
          {approvalLabel}
        </button>
        <div className="decision-actions">
          <button type="button" className="text-button" onClick={() => onDecision("manual")}>Remediate manually</button>
          <button type="button" className="text-button" onClick={() => onDecision("rejected")}>Reject recommendation</button>
        </div>
      </div>
    </section>
  );
}

export default ApprovalPanel;
