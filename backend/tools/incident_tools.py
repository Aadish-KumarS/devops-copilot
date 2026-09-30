import json
from pathlib import Path
from copy import deepcopy

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_json(filename):
    with open(DATA_DIR / filename, "r") as file:
        return json.load(file)


def get_service_health(service=None):
    data = load_json("service_health.json")

    if service:
        for item in data["services"]:
            if item["name"] == service:
                return item
        return {"error": f"Service '{service}' not found"}

    return data["services"]


def get_logs(service=None, level=None):
    data = load_json("logs.json")
    logs = data["logs"]

    if service:
        logs = [log for log in logs if log["service"] == service]

    if level:
        logs = [log for log in logs if log["level"] == level]

    return logs


def get_recent_deployments(service=None):
    data = load_json("deployments.json")
    deployments = data["deployments"]

    if service:
        deployments = [
            deployment
            for deployment in deployments
            if deployment["service"] == service
        ]

    return deployments


def get_config_changes(service=None, deployment=None):
    data = load_json("config_changes.json")
    changes = data["changes"]

    if service:
        changes = [
            change for change in changes
            if change["service"] == service
        ]

    if deployment:
        changes = [
            change for change in changes
            if change["deployment"] == deployment
        ]

    return changes


def search_incident_history(service=None):
    data = load_json("incident_history.json")
    incidents = data["incidents"]

    if service:
        incidents = [
            incident for incident in incidents
            if incident["service"] == service
        ]

    return incidents


# _system_state = None
def get_system_state():
    data = load_json("system_state.json")
    return deepcopy(data["current_state"])


def rollback_deployment(service="transit-api"):
    data = load_json("system_state.json")

    current_state = deepcopy(data["current_state"])
    rollback_state = deepcopy(data["rollback_state"])

    if current_state["transit_api_version"] == rollback_state["transit_api_version"]:
        return {
            "success": False,
            "message": "Service is already running the rollback version",
            "state": current_state
        }

    data["current_state"] = rollback_state

    with open(DATA_DIR / "system_state.json", "w") as file:
        json.dump(data, file, indent=2)

    return {
        "success": True,
        "action": "rollback",
        "service": service,
        "from_version": current_state["transit_api_version"],
        "to_version": rollback_state["transit_api_version"],
        "state": deepcopy(rollback_state)
    }


def verify_service(service="transit-api"):
    state = get_system_state()

    healthy = (
        state["transit_api_status"] == "healthy"
        and state["error_rate"] < 5
        and state["http_5xx_rate"] < 5
        and state["latency_ms"] < 1000
        and state["cache_connection_errors"] is False
        and state["arrival_data_freshness_seconds"] < 60
    )

    return {
        "service": service,
        "recovered": healthy,
        "status": state["transit_api_status"],
        "version": state["transit_api_version"],
        "error_rate": state["error_rate"],
        "latency_ms": state["latency_ms"],
        "http_5xx_rate": state["http_5xx_rate"],
        "arrival_data_freshness_seconds": state["arrival_data_freshness_seconds"]
    }

def reset_incident():
    data = load_json("system_state.json")

    current_state = {
        "transit_api_version": "v3.8",
        "transit_api_status": "degraded",
        "error_rate": 42.3,
        "latency_ms": 4200,
        "http_5xx_rate": 38.7,
        "cache_status": "healthy",
        "cache_connection_errors": True,
        "arrival_data_freshness_seconds": 420,
        "route_planner_status": "degraded",
        "station_display_status": "degraded"
    }

    data["current_state"] = current_state

    with open(DATA_DIR / "system_state.json", "w") as file:
        json.dump(data, file, indent=2)

    return {
        "success": True,
        "message": "Incident environment reset",
        "state": current_state
    }