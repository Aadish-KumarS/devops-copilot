function RecoveryStatus({ data }) {
  const verification = data.verification;

  if (!verification) {
    return (
      <section className="recovery-panel pending">
        <div>
          <span className="eyebrow">RECOVERY STATUS</span>
          <h3>Waiting for remediation</h3>
          <p>
            The system will verify service health after the approved action.
          </p>
        </div>

        <div className="recovery-state">
          <span className="recovery-dot pending"></span>
          NOT VERIFIED
        </div>
      </section>
    );
  }

  if (verification.verified) {
    return (
      <section className="recovery-panel recovered">
        <div>
          <span className="eyebrow">RECOVERY STATUS</span>
          <h3>Service recovered</h3>
          <p>
            Remediation completed and service recovery has been verified.
          </p>
        </div>

        <div className="recovery-state">
          <svg className="recovery-check" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="7" />
            <path d="M4.5 8.5l2.5 2.5 4.5-5" />
          </svg>
          RECOVERED
        </div>
      </section>
    );
  }

  return (
    <section className="recovery-panel failed">
      <div>
        <span className="eyebrow">RECOVERY STATUS</span>
        <h3>Recovery failed</h3>
        <p>
          Remediation completed, but service health could not be verified.
        </p>
      </div>

      <div className="recovery-state">
        <span className="recovery-dot failed"></span>
        RECOVERY FAILED
      </div>
    </section>
  );
}

export default RecoveryStatus;