import { useEffect, useState } from "react";
import { getIncidents } from "../api";

function RecordsPage() {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      getIncidents(search).then((data) => setRecords(data.incidents)).catch(() => setRecords([])).finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <main className="records-page">
      <section className="records-hero"><span className="eyebrow">DURABLE INCIDENT LEDGER</span><h2>Every incident. Every owner. Every decision.</h2><p>Search the persistent response record across services, incident IDs, alerts, and owners.</p></section>
      <section className="records-panel">
        <div className="records-toolbar"><label htmlFor="incident-search">SEARCH INCIDENTS</label><input id="incident-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ID, service, owner, or alert" /></div>
        {loading ? <p className="records-empty">Loading incident ledger…</p> : records.length ? <div className="records-table">{records.map((record) => <article key={record.id}><div><strong>{record.id}</strong><span>{record.service.replaceAll("-", " ")}</span></div><p>{record.alert}</p><span className={`record-status ${record.status}`}>{record.status.replaceAll("_", " ")}</span><small>{record.owner}</small></article>)}</div> : <p className="records-empty">No matching records yet. Launch a guided incident to populate the durable ledger.</p>}
      </section>
    </main>
  );
}

export default RecordsPage;
