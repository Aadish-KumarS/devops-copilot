def assess_risk(diagnosis):
    action = diagnosis["recommended_action"].lower()

    if "rollback" in action:
        return {
            "risk_level": "high",
            "requires_approval": True,
            "reason": "Rollback changes the active production deployment."
        }

    return {
        "risk_level": "low",
        "requires_approval": False,
        "reason": "The recommended action does not modify production state."
    }