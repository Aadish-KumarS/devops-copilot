function Header({ onReset }) {
  return (
    <header className="topbar">
      <div>
        <h1>DevOps Copilot</h1>
        <p>Autonomous Incident Response</p>
      </div>

      <div className="header-actions">
        <button className="reset-button" onClick={onReset}>
          Reset Incident
        </button>

        <div className="system-status">
          <span className="status-dot"></span>
          INCIDENT ACTIVE
        </div>
      </div>
    </header>
  );
}

export default Header;