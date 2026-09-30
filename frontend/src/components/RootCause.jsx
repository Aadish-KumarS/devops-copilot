function RootCause({ data }) {
  const diagnosis = data.diagnosis;

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>AI Diagnosis</h3>
        <span className="confidence">
          {diagnosis.confidence.toUpperCase()} CONFIDENCE
        </span>
      </div>

      <div className="diagnosis">
        <span className="eyebrow">LIKELY ROOT CAUSE</span>

        <h4>{diagnosis.recommended_action.includes("v3.8") ? "Deployment v3.8" : "Unknown"}</h4>

        <p>{diagnosis.likely_root_cause}</p>

        <div className="evidence">
          {diagnosis.evidence.map((item, index) => (
            <div key={index}>
              <span>Evidence {index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RootCause;