import { useState } from "react";
import { getGitHubCommits } from "../api";

function formatTime(value) {
  if (!value) return "time unavailable";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function GitHubLivePanel() {
  const [repository, setRepository] = useState(import.meta.env.VITE_GITHUB_REPOSITORY || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCommits = async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await getGitHubCommits(repository.trim()));
    } catch (requestError) {
      setResult(null);
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="github-live-panel" aria-labelledby="github-live-title">
      <div className="github-live-heading">
        <div>
          <span className="eyebrow">LIVE CHANGE INTELLIGENCE</span>
          <h2 id="github-live-title">Bring a real GitHub repository into the investigation.</h2>
          <p>Read recent commits directly from GitHub. This adapter is read-only and never receives repository write access.</p>
        </div>
        <span className="live-source-chip"><i></i> GITHUB REST API</span>
      </div>

      <div className="github-connect-row">
        <label htmlFor="github-repository">PUBLIC REPOSITORY</label>
        <input id="github-repository" value={repository} onChange={(event) => setRepository(event.target.value)} placeholder="owner/repository" autoComplete="off" />
        <button type="button" onClick={loadCommits} disabled={loading || !repository.trim()}>{loading ? "Fetching live commits" : "Fetch live commits"}</button>
      </div>

      {error && <p className="github-error">{error}</p>}

      {result && (
        <div className="github-result">
          <div className="github-result-meta"><span>CONNECTED: {result.repository}</span><span>{result.authenticated ? "AUTHENTICATED" : "PUBLIC API"}{result.rate_limit_remaining !== null ? ` · ${result.rate_limit_remaining} REQUESTS LEFT` : ""}</span></div>
          {result.commits.length ? <div className="commit-list">{result.commits.map((commit) => <a key={commit.sha} href={commit.url} target="_blank" rel="noreferrer"><code>{commit.sha}</code><strong>{commit.message}</strong><span>{commit.author} · {formatTime(commit.committed_at)}</span></a>)}</div> : <p className="github-empty">No recent commits returned for this repository.</p>}
          <small>Fetched {formatTime(result.fetched_at)} · GitHub is supplemental, live change evidence; it does not trigger any action.</small>
        </div>
      )}
    </section>
  );
}

export default GitHubLivePanel;
