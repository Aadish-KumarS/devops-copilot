from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from agent.investigation_engine import investigate_incident
from agent.rca_engine import analyze_root_cause
from agent.risk_engine import assess_risk
from agent.remediation import execute_remediation
from tools.incident_tools import reset_incident
from agent.llm_engine import generate_incident_analysis
from agent.verification import verify_remediation
from tools.incident_tools import get_system_state

app = FastAPI(title="DevOps Copilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://devops-copilot-ivory.vercel.app",],
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
def investigate(incident: dict):
    evidence_result = investigate_incident(incident)

    diagnosis = analyze_root_cause(
        evidence_result["evidence"]
    )

    risk = assess_risk(diagnosis)

    llm_analysis = None

    try:
        llm_analysis = generate_incident_analysis(
            evidence_result["evidence"],
            diagnosis,
            risk
        )
    except Exception as error:
        print(f"LLM analysis unavailable: {error}")

    return {
        "incident": incident,
        "evidence": evidence_result["evidence"],
        "diagnosis": diagnosis,
        "risk": risk,
        "llm_analysis": llm_analysis
    }

@app.post("/api/incidents/remediate")
def remediate(request: dict):
    diagnosis = request["diagnosis"]
    approved = request.get("approved", False)

    return execute_remediation(
        diagnosis,
        approved=approved
    )

@app.post("/api/incidents/verify")
def verify(request: dict):
    service = request.get("service", "transit-api")

    return verify_remediation(service) 

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