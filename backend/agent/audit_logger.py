from datetime import datetime


def create_audit_event(event_type, message, details=None):
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "event": event_type,
        "message": message,
        "details": details or {}
    }


def build_audit_trail(
    incident,
    diagnosis,
    risk,
    investigation_trace,
    remediation=None,
    verification=None,
    approval=None
):
    events = []

    events.append(
        create_audit_event(
            "incident_detected",
            incident["alert"],
            {
                "incident_id": incident["id"],
                "service": incident["service"],
                "severity": incident["severity"]
            }
        )
    )

    events.append(
        create_audit_event(
            "investigation_completed",
            "AI investigation completed using multiple evidence sources.",
            {
                "tools_used": [
                    step.get("tool")
                    for step in investigation_trace
                    if step.get("tool")
                ]
            }
        )
    )

    events.append(
        create_audit_event(
            "root_cause_identified",
            diagnosis["likely_root_cause"],
            {
                "confidence": diagnosis["confidence"],
                "recommended_action": diagnosis["recommended_action"]
            }
        )
    )

    events.append(
        create_audit_event(
            "risk_assessed",
            risk["reason"],
            {
                "risk_level": risk["risk_level"],
                "requires_approval": risk["requires_approval"]
            }
        )
    )

    if approval:
        events.append(
            create_audit_event(
                "human_approval_recorded",
                "A human operator approved the production-changing action.",
                {
                    "operator": approval.get("operator", "Unknown operator"),
                    "reason": approval.get("reason", "No reason recorded")
                }
            )
        )

    if remediation:
        events.append(
            create_audit_event(
                "remediation_executed",
                "Remediation was executed after approval.",
                {
                    "status": remediation["status"],
                    "action": remediation.get("action")
                }
            )
        )

    if verification:
        events.append(
            create_audit_event(
                "recovery_verified",
                "Service recovery verification completed.",
                {
                    "verified": verification["verified"],
                    "status": verification["status"]
                }
            )
        )

    return events
