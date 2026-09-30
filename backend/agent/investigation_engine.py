from tools.incident_tools import (
    get_service_health,
    get_logs,
    get_recent_deployments,
    get_config_changes,
    search_incident_history,
    get_system_state
)


def investigate_incident(incident):
    service = incident["service"]

    health = get_service_health(service)
    logs = get_logs(service)
    deployments = get_recent_deployments(service)
    config_changes = get_config_changes(service)
    history = search_incident_history(service)
    system_state = get_system_state()

    return {
        "incident": incident,
        "evidence": {
            "service_health": health,
            "logs": logs,
            "recent_deployments": deployments,
            "config_changes": config_changes,
            "similar_incidents": history,
            "system_state": system_state
        }
    }