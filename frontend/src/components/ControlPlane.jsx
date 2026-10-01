import { useState } from "react";

function ControlPlane({ data, onAssign }) {
  const [owner, setOwner] = useState(data.governance?.incident_owner || "A. Patel");
  const gate = data.governance?.confidence_gate;

  return (
    <section className="control-plane">
      <div className="panel-header"><h3>Incident Control Plane</h3><span>POLICY ENFORCED</span></div>
      <div className="control-grid">
        <div>
          <span className="eyebrow">INCIDENT OWNER</span>
          <div className="owner-row">
            <input aria-label="Incident owner" value={owner} onChange={(event) => setOwner(event.target.value)} />
            <button type="button" className="compact-button" onClick={() => onAssign(owner)}>Assign</button>
          </div>
          <p>Qualified roles: Incident Commander, SRE Lead, Platform Owner.</p>
        </div>
        <div>
          <span className="eyebrow">CONFIDENCE GATE</span>
          <strong className={gate?.meets_threshold ? "policy-pass" : "policy-stop"}>
            {gate?.meets_threshold ? "PASS — ACTION ELIGIBLE" : "HOLD — MORE EVIDENCE REQUIRED"}
          </strong>
          <p>{gate?.policy}</p>
        </div>
        <div>
          <span className="eyebrow">AUDIT MODEL</span>
          <strong>APPEND-ONLY LEDGER</strong>
          <p>Approvals, decisions, execution, and recovery events are retained as an immutable sequence.</p>
        </div>
      </div>
    </section>
  );
}

export default ControlPlane;
