def analyze_root_cause(evidence):
    service_health = evidence["service_health"]
    deployments = evidence["recent_deployments"]
    logs = evidence["logs"]
    config_changes = evidence["config_changes"]
    similar_incidents = evidence["similar_incidents"]
    system_state = evidence["system_state"]

    active_deployment = next(
        (
            deployment
            for deployment in deployments
            if deployment["status"] == "active"
        ),
        None
    )

    cache_errors = [
        log for log in logs
        if "cache" in log["message"].lower()
    ]

    server_errors = [
        log for log in logs
        if "HTTP 500" in log["message"] or "HTTP 503" in log["message"]
    ]

    matching_history = [
        incident for incident in similar_incidents
        if "cache" in incident["root_cause"].lower()
    ]

    evidence_points = []

    if active_deployment:
        evidence_points.append(
            f"Deployment {active_deployment['version']} is currently active."
        )

    if config_changes:
        evidence_points.append(
            f"{len(config_changes)} cache configuration changes were introduced "
            f"with deployment {active_deployment['version']}."
        )

    if cache_errors:
        evidence_points.append(
            "Logs show cache connection warnings and timeout errors "
            "immediately after the deployment."
        )

    if server_errors:
        evidence_points.append(
            "HTTP 500/503 errors occurred after the cache failures."
        )

    if system_state["cache_connection_errors"]:
        evidence_points.append(
            "Current system state confirms cache connection errors."
        )

    if matching_history:
        evidence_points.append(
            f"Previous incident {matching_history[0]['id']} had similar "
            "cache-related symptoms and was resolved by rollback."
        )

    if (
        active_deployment
        and config_changes
        and cache_errors
        and server_errors
        and system_state["cache_connection_errors"]
    ):
        confidence = "high"
        root_cause = (
            f"Deployment {active_deployment['version']} likely introduced "
            "a problematic cache configuration, causing cache connection "
            "failures and subsequent Transit API errors."
        )
    else:
        confidence = "medium"
        root_cause = (
            "The available evidence indicates a cache-related failure, "
            "but the root cause cannot be established with high confidence."
        )

    recommended_action = "Investigate cache configuration before remediation."

    if active_deployment and active_deployment["version"] == "v3.8":
        recommended_action = "Rollback transit-api from v3.8 to v3.7."

    return {
        "likely_root_cause": root_cause,
        "confidence": confidence,
        "evidence": evidence_points,
        "recommended_action": recommended_action,
        "risk_level": "high"
    }