import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_scenarios():
    with open(DATA_DIR / "scenarios.json", "r") as file:
        return json.load(file)


def get_scenario(scenario_name):
    scenarios = load_scenarios()
    return scenarios.get(scenario_name)


def list_scenarios():
    return list(load_scenarios().keys())

ACTIVE_SCENARIO = "database_failure"


def set_active_scenario(scenario_name):
    global ACTIVE_SCENARIO

    if scenario_name not in load_scenarios():
        raise ValueError(f"Unknown scenario: {scenario_name}")

    ACTIVE_SCENARIO = scenario_name
    return get_scenario(scenario_name)

def get_active_scenario():
    return ACTIVE_SCENARIO