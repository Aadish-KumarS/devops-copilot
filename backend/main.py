from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from agent.rca_engine import analyze_root_cause
from agent.orchestrator import investigate_incident
from agent.risk_engine import assess_risk
from agent.remediation import execute_remediation
from agent.llm_engine import generate_incident_analysis
from agent.verification import verify_remediation
from agent.audit_logger import build_audit_trail
from tools.scenario_manager import (
    list_scenarios,
    set_active_scenario,
    get_active_scenario,
    get_scenario
)
from tools.incident_tools import (
    get_system_state,
    get_service_health,
    get_logs,
    get_recent_deployments,
    get_config_changes,
    reset_incident,
    search_incident_history
)

app = FastAPI(title="DevOps Copilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://devops-copilot-ivory.vercel.app",
        "https://devops-copilot-5vva7fj33-a-code1.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "name": "DevOps Copilot",
        "status": "online"
    }


@app.post("/api/incidents/investigate")
def investigate(request: dict):
    scenario_name = request.get("scenario", get_active_scenario())

    incident_data = get_scenario(scenario_name)

    if not incident_data:
        raise HTTPException(
            status_code=400,
            detail="Invalid incident scenario"
        )

    set_active_scenario(scenario_name)

    incident = {
        "id": f"INC-{scenario_name.upper()}",
        "service": incident_data["service"],
        "severity": incident_data["severity"],
        "alert": incident_data["message"],
        "impact": incident_data["impact"]
    }

    agent_result = investigate_incident(incident)

    diagnosis = agent_result["diagnosis"]
    investigation_trace = agent_result["investigation_trace"]

    evidence = {
        "service_health": get_service_health(incident["service"]),
        "logs": get_logs(incident["service"]),
        "deployments": get_recent_deployments(incident["service"]),
        "config_changes": get_config_changes(incident["service"]),
        "incident_history": search_incident_history(incident["service"]),
        "system_state": get_system_state()
    }

    risk = assess_risk(diagnosis)

    llm_analysis = None

    try:
        llm_analysis = generate_incident_analysis(
            evidence,
            diagnosis,
            risk
        )
    except Exception as error:
        print(f"LLM analysis unavailable: {error}")

    return {
        "incident": incident,
        "evidence": evidence,
        "diagnosis": diagnosis,
        "risk": risk,
        "llm_analysis": llm_analysis,
        "investigation_trace": investigation_trace
    }

@app.post("/api/incidents/remediate")
def remediate(request: dict):
    diagnosis = request["diagnosis"]
    approved = request.get("approved", False)
    scenario = request.get("scenario")
    incident = request.get("incident")

    if scenario:
        set_active_scenario(scenario)

    remediation = execute_remediation(
        diagnosis,
        approved=approved
    )

    return {
        "remediation": remediation,
        "incident": incident
    }

@app.post("/api/incidents/reset")
def reset():
    return reset_incident()

@app.get("/api/incidents/current")
def current_incident():
    return {
        "incident": {
            "id": "INC-TRANSIT-001",
            "service": "transit-api",
            "severity": "high",
            "alert": "Transit API returning elevated 500/503 errors",
            "impact": "Live arrival information is becoming stale"
        },
        "state": get_system_state()
    }

@app.get("/api/scenarios")
def scenarios():
    return {
        "scenarios": list_scenarios(),
        "active": get_active_scenario()
    }


@app.post("/api/scenarios/{scenario_name}")
def select_scenario(scenario_name: str):
    scenario = set_active_scenario(scenario_name)

    return {
        "active": scenario_name,
        "scenario": scenario
    }

@app.post("/api/incidents/verify")
def verify(request: dict):
    service = request.get("service", "transit-api")
    scenario = request.get("scenario")
    incident_data = request.get("incident")

    if scenario:
        set_active_scenario(scenario)

    verification = verify_remediation(service)

    if not incident_data:
        return verification

    remediation = incident_data.get("remediation", {})

    if "remediation" in remediation:
        remediation = remediation["remediation"]

    audit_trail = build_audit_trail(
        incident=incident_data["incident"],
        diagnosis=incident_data["diagnosis"],
        risk=incident_data["risk"],
        investigation_trace=incident_data["investigation_trace"],
        remediation=remediation,
        verification=verification
    )

    return {
        **verification,
        "audit_trail": audit_trail
    }