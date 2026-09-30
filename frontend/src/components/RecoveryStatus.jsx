function RecoveryStatus({ data }) {
  const verification = data.verification;

  if (!verification) {
    return (
      <section className="recovery-panel">
        <div>
          <span className="eyebrow">RECOVERY STATUS</span>
          <h3>Waiting for remediation</h3>
          <p>
            The system will verify service health after the approved action.
          </p>
        </div>

        <div className="recovery-state">
          <span className="recovery-dot"></span>
          NOT VERIFIED
        </div>
      </section>
    );
  }

  if (verification.verified) {
    return (
      <section className="recovery-panel">
        <div>
          <span className="eyebrow">RECOVERY STATUS</span>
          <h3>Service recovered</h3>
          <p>
            Remediation completed and service recovery has been verified.
          </p>
        </div>

        <div className="recovery-state">
          <span className="recovery-dot recovered"></span>
          RECOVERED
        </div>
      </section>
    );
  }

  return (
    <section className="recovery-panel">
      <div>
        <span className="eyebrow">RECOVERY STATUS</span>
        <h3>Recovery failed</h3>
        <p>
          Remediation completed, but service health could not be verified.
        </p>
      </div>

      <div className="recovery-state">
        <span className="recovery-dot"></span>
        RECOVERY FAILED
      </div>
    </section>
  );
}

export default RecoveryStatus;