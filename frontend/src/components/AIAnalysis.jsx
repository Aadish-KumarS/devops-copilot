function AIAnalysis({ data }) {
  const analysis = data.llm_analysis;

  if (!analysis) {
    return (
      <section className="panel">
        <div className="panel-header">
          <h3>AI Analysis</h3>
          <span>UNAVAILABLE</span>
        </div>

        <p className="ai-unavailable">
          AI analysis is temporarily unavailable. Deterministic incident
          analysis is still available below.
        </p>
      </section>
    );
  }

  return (
    <section className="panel ai-analysis">
      <div className="panel-header">
        <h3>AI Analysis</h3>
        <span>GEMINI</span>
      </div>

      <div className="ai-summary">
        <span className="eyebrow">SUMMARY</span>
        <p>{analysis.summary}</p>
      </div>

      <div className="ai-section">
        <span className="eyebrow">ROOT CAUSE EXPLANATION</span>
        <p>{analysis.root_cause_explanation}</p>
      </div>

      <div className="ai-section">
        <span className="eyebrow">EVIDENCE</span>

        <div className="ai-evidence">
          {analysis.evidence_summary?.map((item, index) => (
            <div key={index}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-section">
        <span className="eyebrow">RECOMMENDED ACTION</span>
        <p>{analysis.recommended_action}</p>
      </div>

      <div className="ai-section">
        <span className="eyebrow">RISK ASSESSMENT</span>
        <p>{analysis.risk_explanation}</p>
      </div>
    </section>
  );
}

export default AIAnalysis;