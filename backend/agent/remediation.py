from tools.incident_tools import rollback_deployment
from agent.risk_engine import assess_risk


def execute_remediation(diagnosis, approved=False):
    risk = assess_risk(diagnosis)

    if risk["requires_approval"] and not approved:
        return {
            "executed": False,
            "status": "approval_required",
            "risk": risk,
            "message": "High-risk remediation requires human approval."
        }

    action = diagnosis.get("recommended_action", "").lower()

    if "rollback" in action or "restore" in action:
        result = rollback_deployment()

        return {
            "executed": result.get("success", False),
            "status": "executed" if result.get("success") else "failed",
            "action": (
                "rollback"
                if "rollback" in action
                else "restore_provider_connection"
            ),
            "risk": risk,
            "result": result
        }

    return {
        "executed": False,
        "status": "unsupported",
        "risk": risk,
        "message": "No supported remediation action found."
    }