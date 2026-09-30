function ApprovalPanel({ data, onApprove }) {
  const remediated = data.remediation?.executed;
  const recovered = data.verification?.verified;

  if (recovered) {
    return (
      <section className="approval-panel">
        <div>
          <span className="eyebrow">REMEDIATION COMPLETE</span>
          <h3>Rollback executed successfully</h3>
          <p>
            Transit API was rolled back from v3.8 to v3.7 and service recovery
            has been verified.
          </p>
        </div>

        <div className="approval-action">
          <span className="risk-label">ACTION COMPLETE</span>
          <button disabled>
            ✓ Rollback Executed
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

  const diagnosis = data.diagnosis;

  return (
    <section className="approval-panel">
      <div>
        <span className="eyebrow">RECOMMENDED ACTION</span>
        <h3>{diagnosis.recommended_action}</h3>
        <p>
          This action modifies the active production deployment and requires
          human approval.
        </p>
      </div>

      <div className="approval-action">
        <span className="risk-label">
          {diagnosis.risk_level.toUpperCase()} RISK
        </span>

        <button onClick={onApprove}>
          Approve Rollback
        </button>
      </div>
    </section>
  );
}

export default ApprovalPanel;