import json
from pathlib import Path
from copy import deepcopy
from tools.scenario_manager import get_active_scenario

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_json(filename):
    with open(DATA_DIR / filename, "r") as file:
        return json.load(file)


def get_service_health(service=None):
    scenario_data = get_scenario_data()
    health = scenario_data["service_health"]

    return health


def get_logs(service=None, level=None):
    scenario_data = get_scenario_data()

    return scenario_data["logs"]


def get_recent_deployments(service=None):
    scenario_data = get_scenario_data()

    return [scenario_data["deployment"]]

def get_config_changes(service=None, deployment=None):
    scenario_data = get_scenario_data()

    return scenario_data["config_changes"]


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


def rollback_deployment(service=None):
    print("ROLLBACK SCENARIO:", get_active_scenario())
    scenario = get_active_scenario()

    if scenario == "cache_failure":
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
            "service": "transit-api",
            "from_version": current_state["transit_api_version"],
            "to_version": rollback_state["transit_api_version"],
            "state": deepcopy(rollback_state)
        }

    if scenario == "database_failure":
        state = get_scenario_state()

        state.update({
            "status": "healthy",
            "error_rate": 1.4,
            "latency_ms": 240,
            "http_5xx_rate": 1.1,
            "arrival_data_freshness_seconds": 9,
            "recovered": True
        })

        update_scenario_state(state)

        return {
            "success": True,
            "action": "rollback",
            "service": "route-planner",
            "from_version": "v4.2",
            "to_version": "v4.1",
            "state": state
        }

    if scenario == "external_api_failure":
        state = get_scenario_state()

        state.update({
            "status": "healthy",
            "error_rate": 1.8,
            "latency_ms": 280,
            "http_5xx_rate": 1.3,
            "arrival_data_freshness_seconds": 10,
            "recovered": True
        })

        update_scenario_state(state)

        return {
            "success": True,
            "action": "restore_provider_connection",
            "service": "station-display",
            "state": state
        }

    raise ValueError(f"Unknown scenario: {scenario}")

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

    scenario_states = {
        "cache_failure": {
            "status": "degraded",
            "error_rate": 42.3,
            "latency_ms": 4200,
            "http_5xx_rate": 38.7,
            "arrival_data_freshness_seconds": 420,
            "recovered": False
        },
        "database_failure": {
            "status": "unhealthy",
            "error_rate": 61.8,
            "latency_ms": 6800,
            "http_5xx_rate": 54.2,
            "arrival_data_freshness_seconds": 510,
            "recovered": False
        },
        "external_api_failure": {
            "status": "degraded",
            "error_rate": 29.4,
            "latency_ms": 3900,
            "http_5xx_rate": 24.1,
            "arrival_data_freshness_seconds": 360,
            "recovered": False
        }
    }

    with open(DATA_DIR / "scenario_state.json", "w") as file:
        json.dump(scenario_states, file, indent=2)

    return {
        "success": True,
        "message": "Incident environment reset",
        "state": current_state
    }

def get_scenario(scenario_name):
    scenarios = load_json("scenarios.json")
    return scenarios.get(scenario_name)

def get_scenario_data():
    data = load_json("scenario_data.json")
    scenario = get_active_scenario()

    if scenario not in data:
        raise ValueError(f"No data found for scenario: {scenario}")

    return data[scenario]

def verify_service(service=None):
    scenario = get_active_scenario()

    if scenario == "cache_failure":
        state = get_system_state()

        recovered = (
            state["transit_api_status"] == "healthy"
            and state["error_rate"] < 5
            and state["http_5xx_rate"] < 5
            and state["latency_ms"] < 1000
            and state["cache_connection_errors"] is False
            and state["arrival_data_freshness_seconds"] < 60
        )

        return {
            "service": "transit-api",
            "recovered": recovered,
            "status": "healthy" if recovered else "degraded",
            "metrics": state
        }

    if scenario == "database_failure":
        state = get_scenario_state()

        recovered = (
            state["status"] == "healthy"
            and state["error_rate"] < 5
            and state["http_5xx_rate"] < 5
            and state["latency_ms"] < 1000
        )

        return {
            "service": "route-planner",
            "recovered": recovered,
            "status": "healthy" if recovered else "unhealthy",
            "metrics": state
        }

    if scenario == "external_api_failure":
        state = get_scenario_state()

        recovered = (
            state["status"] == "healthy"
            and state["error_rate"] < 5
            and state["http_5xx_rate"] < 5
            and state["latency_ms"] < 1000
        )

        return {
            "service": "station-display",
            "recovered": recovered,
            "status": "healthy" if recovered else "degraded",
            "metrics": state
        }

    raise ValueError(f"Unknown scenario: {scenario}")

def get_scenario_state():
    data = load_json("scenario_state.json")
    scenario = get_active_scenario()

    if scenario not in data:
        raise ValueError(f"No state found for scenario: {scenario}")

    return data[scenario]


def update_scenario_state(state):
    data = load_json("scenario_state.json")
    scenario = get_active_scenario()

    data[scenario] = state

    with open(DATA_DIR / "scenario_state.json", "w") as file:
        json.dump(data, file, indent=2)

    return state