from tools.incident_tools import rollback_deployment


def execute_remediation(diagnosis, approved=False):
    if diagnosis["risk_level"] == "high" and not approved:
        return {
            "executed": False,
            "status": "approval_required",
            "message": "High-risk remediation requires human approval."
        }

    action = diagnosis["recommended_action"].lower()

    if "rollback" in action:
        result = rollback_deployment()

        return {
            "executed": result.get("success", False),
            "status": "executed" if result.get("success") else "failed",
            "action": "rollback",
            "result": result
        }

    return {
        "executed": False,
        "status": "unsupported",
        "message": "No supported remediation action found."
    }