def assess_risk(diagnosis):
    action = diagnosis.get("recommended_action", "").lower()

    if "rollback" in action or "restore" in action:
        return {
            "risk_level": "high",
            "requires_approval": True,
            "reason": "The action modifies production state and requires human approval."
        }

    return {
        "risk_level": "low",
        "requires_approval": False,
        "reason": "The recommended action does not modify production state."
    }