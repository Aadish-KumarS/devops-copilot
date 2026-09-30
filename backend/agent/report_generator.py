from datetime import datetime


def generate_incident_report(
    incident,
    diagnosis,
    risk,
    remediation,
    verification
):
    return {
        "report_id": f"REPORT-{incident['id']}",
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "incident": {
            "id": incident["id"],
            "service": incident["service"],
            "severity": incident["severity"],
            "alert": incident["alert"],
            "impact": incident["impact"]
        },
        "diagnosis": {
            "root_cause": diagnosis["likely_root_cause"],
            "confidence": diagnosis["confidence"],
            "evidence": diagnosis["evidence"],
            "recommended_action": diagnosis["recommended_action"]
        },
        "risk": {
            "level": risk["risk_level"],
            "approval_required": risk["requires_approval"],
            "reason": risk["reason"]
        },
        "remediation": {
            "status": remediation["status"],
            "executed": remediation["executed"],
            "action": remediation.get("action")
        },
        "verification": {
            "status": verification["status"],
            "verified": verification["verified"],
            "details": verification["verification"]
        },
        "outcome": (
            "Incident successfully remediated and service recovery verified."
            if verification["verified"]
            else "Incident remediation completed but service recovery was not verified."
        )
    }