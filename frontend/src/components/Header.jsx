function Header({ onReset, activePage, onNavigate }) {
  return (
    <header className="topbar">
      <button
        className="brand"
        type="button"
        onClick={() => onNavigate("home")}
        aria-label="DevOps Copilot home"
      >
        <span className="brand-mark" aria-hidden="true">&gt;_</span>
        <span>
          <h1>DevOps Copilot</h1>
          <p>Autonomous Incident Response</p>
        </span>
      </button>

      <nav className="site-nav" aria-label="Primary navigation">
        {[
          ["home", "Home"],
          ["dashboard", "Console"],
          ["records", "Records"],
          ["about", "About"]
        ].map(([page, label]) => (
          <button
            className={`nav-link ${activePage === page ? "active" : ""}`}
            type="button"
            key={page}
            onClick={() => onNavigate(page)}
            aria-current={activePage === page ? "page" : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        {activePage === "dashboard" && (
          <button className="reset-button" type="button" onClick={onReset}>
            Reset Incident
          </button>
        )}

        <div className={`system-status ${activePage === "dashboard" ? "incident" : "online"}`}>
          <span className="status-dot"></span>
          {activePage === "dashboard" ? "INCIDENT ACTIVE" : "SYSTEM ONLINE"}
        </div>
      </div>
    </header>
  );
}

export default Header;
