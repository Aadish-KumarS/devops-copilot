from collections import defaultdict, deque
from time import perf_counter, time
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from agent.orchestrator import investigate_incident
from agent.risk_engine import assess_risk
from agent.remediation import execute_remediation
from agent.llm_engine import generate_incident_analysis
from agent.verification import verify_remediation
from agent import incident_store
from agent.product_context import DEPENDENCY_GRAPHS, RUNBOOKS, notification_targets
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

RATE_WINDOWS = defaultdict(deque)
CONFIDENCE_RANK = {"low": 1, "medium": 2, "high": 3}
QUALIFIED_APPROVER_ROLES = {"Incident Commander", "SRE Lead", "Platform Owner"}


class ApprovalRecord(BaseModel):
    operator: str = Field(min_length=2, max_length=80)
    role: str = Field(min_length=2, max_length=80)
    reason: str = Field(min_length=8, max_length=500)


class RemediationRequest(BaseModel):
    diagnosis: dict[str, Any]
    approved: bool = False
    scenario: str | None = None
    incident: dict[str, Any] | None = None
    approval: ApprovalRecord | None = None
    idempotency_key: str | None = Field(default=None, max_length=120)


class OwnerRequest(BaseModel):
    owner: str = Field(min_length=2, max_length=80)


class DecisionRequest(BaseModel):
    decision: Literal["rejected", "manual"]
    reason: str = Field(min_length=5, max_length=500)


def enforce_rate_limit(request: Request, scope: str, limit=30):
    key = f"{scope}:{request.client.host if request.client else 'anonymous'}"
    now = time()
    window = RATE_WINDOWS[key]
    while window and window[0] <= now - 60:
        window.popleft()
    if len(window) >= limit:
        raise HTTPException(status_code=429, detail="Rate limit reached. Try again in a minute.")
    window.append(now)


def fallback_diagnosis(scenario_name, scenario_data):
    messages = {
        "cache_failure": ("Cache configuration regression", "Rollback transit-api from v3.8 to v3.7."),
        "database_failure": ("Database connection-pool regression", "Rollback route-planner from v4.2 to v4.1."),
        "external_api_failure": ("External provider degradation", "Restore provider connection and enable the fallback path.")
    }
    root_cause, action = messages[scenario_name]
    return {
        "incident_summary": scenario_data["impact"],
        "likely_root_cause": root_cause,
        "confidence": "high",
        "evidence": [
            "Service health exceeds the configured incident threshold.",
            "Application logs reproduce the immediate failure mechanism.",
            "Deployment and configuration history align with the start of impact."
        ],
        "recommended_action": action,
        "risk_level": "high"
    }


def confidence_gate(diagnosis, risk):
    required = "high" if risk["requires_approval"] else "medium"
    confidence = diagnosis.get("confidence", "low").lower()
    return {
        "minimum_confidence": required,
        "actual_confidence": confidence,
        "meets_threshold": CONFIDENCE_RANK.get(confidence, 0) >= CONFIDENCE_RANK[required],
        "policy": "Production-changing recommendations require high-confidence, multi-source evidence."
    }

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
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
def investigate(request: dict, http_request: Request):
    enforce_rate_limit(http_request, "investigate", limit=20)
    started_at = perf_counter()
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

    try:
        agent_result = investigate_incident(incident)
        investigation_mode = "gemini_tool_agent"
    except Exception as error:
        print(f"Agent investigation unavailable, using deterministic fallback: {error}")
        agent_result = {
            "diagnosis": fallback_diagnosis(scenario_name, incident_data),
            "investigation_trace": [
                {"iteration": 1, "tool": "deterministic_fallback", "arguments": {}, "reason": "AI provider unavailable", "status": "executed"}
            ]
        }
        investigation_mode = "deterministic_fallback"

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
    gate = confidence_gate(diagnosis, risk)
    runbook = RUNBOOKS[scenario_name]
    dependency_graph = DEPENDENCY_GRAPHS[scenario_name]

    incident_store.upsert_incident(incident, diagnosis)
    incident_store.append_audit(incident["id"], "investigation_completed", "Evidence correlation completed.", {"tools_used": [step.get("tool") for step in investigation_trace]})
    incident_store.append_audit(incident["id"], "risk_assessed", risk["reason"], {**risk, "confidence_gate": gate})
    notifications = notification_targets(incident)
    for item in notifications:
        incident_store.record_notification(incident["id"], item["channel"], item["message"])

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
        "investigation_trace": investigation_trace,
        "governance": {
            "confidence_gate": gate,
            "runbook": runbook,
            "dependency_graph": dependency_graph,
            "notifications": incident_store.get_notifications(incident["id"]),
            "incident_owner": incident_store.get_incident(incident["id"])["owner"]
        },
        "telemetry": {
            "mode": investigation_mode,
            "duration_ms": round((perf_counter() - started_at) * 1000),
            "tool_calls": len(investigation_trace),
            "estimated_tokens": len(investigation_trace) * 480 + 320,
            "estimated_cost_usd": round(len(investigation_trace) * 0.00018 + 0.00012, 5),
            "data_freshness": "live adapter simulation"
        }
    }

@app.post("/api/incidents/remediate")
def remediate(request: RemediationRequest, http_request: Request):
    enforce_rate_limit(http_request, "remediate", limit=12)
    replay = incident_store.get_idempotent_response(request.idempotency_key)
    if replay:
        return {**replay, "idempotent_replay": True}

    diagnosis = request.diagnosis
    approved = request.approved
    scenario = request.scenario
    incident = request.incident
    approval = request.approval.model_dump() if request.approval else None

    if approved and not approval:
        raise HTTPException(
            status_code=400,
            detail="Production remediation requires an approval record."
        )

    incident_record = incident or {}
    incident_payload = incident_record.get("incident", incident_record)
    incident_id = incident_payload.get("id")
    if not incident_id:
        raise HTTPException(status_code=400, detail="A durable incident record is required for remediation.")

    gate = incident_record.get("governance", {}).get("confidence_gate", {})
    if approved and not gate.get("meets_threshold", False):
        raise HTTPException(status_code=409, detail="Confidence gate blocks this production-changing recommendation.")
    if approval and approval["role"] not in QUALIFIED_APPROVER_ROLES:
        raise HTTPException(status_code=403, detail="Approval role is not authorized for production remediation.")

    if scenario:
        set_active_scenario(scenario)

    if approval:
        incident_store.record_approval(incident_id, approval, diagnosis.get("recommended_action", "Unknown action"))
        incident_store.set_incident_status(incident_id, "remediating")

    remediation = execute_remediation(
        diagnosis,
        approved=approved
    )

    response = {
        "remediation": remediation,
        "incident": incident,
        "approval": approval,
        "approval_history": incident_store.get_approvals(incident_id)
    }
    if remediation.get("executed"):
        incident_store.set_incident_status(incident_id, "recovery_verification")
        incident_store.append_audit(incident_id, "remediation_executed", "Approved remediation executed.", remediation)
    incident_store.save_idempotent_response(request.idempotency_key, response)
    return response

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


@app.get("/api/incidents")
def incident_history(search: str | None = None, status: str | None = None, limit: int = 20):
    return {"incidents": incident_store.list_incidents(search=search, status=status, limit=limit)}


@app.get("/api/incidents/{incident_id}")
def incident_record(incident_id: str):
    incident = incident_store.get_incident(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident record not found.")
    return {
        "incident": incident,
        "approvals": incident_store.get_approvals(incident_id),
        "audit_trail": incident_store.get_audit(incident_id),
        "notifications": incident_store.get_notifications(incident_id)
    }


@app.post("/api/incidents/{incident_id}/assign")
def assign_incident(incident_id: str, request: OwnerRequest):
    if not incident_store.get_incident(incident_id):
        raise HTTPException(status_code=404, detail="Incident record not found.")
    return {"incident": incident_store.assign_owner(incident_id, request.owner)}


@app.post("/api/incidents/{incident_id}/decision")
def record_decision(incident_id: str, request: DecisionRequest):
    if not incident_store.get_incident(incident_id):
        raise HTTPException(status_code=404, detail="Incident record not found.")
    status = "manual_remediation" if request.decision == "manual" else "action_rejected"
    incident_store.set_incident_status(incident_id, status)
    incident_store.append_audit(incident_id, f"recommendation_{request.decision}", request.reason, {"decision": request.decision})
    return {"incident": incident_store.get_incident(incident_id), "audit_trail": incident_store.get_audit(incident_id)}


@app.get("/api/observability/snapshot")
def observability_snapshot():
    return {
        "adapter": "live adapter simulation",
        "captured_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "service_health": get_service_health(),
        "recent_logs": get_logs()[-4:]
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

    incident_id = incident_data["incident"]["id"]
    incident_store.set_incident_status(incident_id, "resolved" if verification["verified"] else "recovery_failed")
    incident_store.append_audit(incident_id, "recovery_verified", "Recovery verification completed.", verification)

    return {
        **verification,
        "audit_trail": incident_store.get_audit(incident_id),
        "approval_history": incident_store.get_approvals(incident_id)
    }
