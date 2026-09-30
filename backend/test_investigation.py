from agent.investigation_engine import investigate_incident
from agent.rca_engine import analyze_root_cause
from agent.remediation import execute_remediation
from agent.risk_engine import assess_risk
from agent.verification import verify_remediation
from agent.report_generator import generate_incident_report

incident = {
    "id": "INC-TRANSIT-001",
    "service": "transit-api",
    "severity": "critical",
    "alert": "Transit API is returning a high volume of HTTP 500/503 errors.",
    "impact": [
        "Live arrival information is becoming stale",
        "Route planning requests are failing",
        "Station displays may show outdated information"
    ]
}

result = investigate_incident(incident)

diagnosis = analyze_root_cause(result["evidence"])

print("\n=== ROOT CAUSE ANALYSIS ===")
print("Root Cause:", diagnosis["likely_root_cause"])
print("Confidence:", diagnosis["confidence"])
print("Recommended Action:", diagnosis["recommended_action"])
print("Risk Level:", diagnosis["risk_level"])

print("\n=== EVIDENCE ===")
for item in diagnosis["evidence"]:
    print("-", item)


risk = assess_risk(diagnosis)

print("\n=== RISK ASSESSMENT ===")
print("Risk Level:", risk["risk_level"])
print("Requires Approval:", risk["requires_approval"])
print("Reason:", risk["reason"])

print("\n=== REMEDIATION WITHOUT APPROVAL ===")

remediation = execute_remediation(
    diagnosis,
    approved=False
)

print(remediation)

print("\n=== REMEDIATION WITH APPROVAL ===")

remediation = execute_remediation(
    diagnosis,
    approved=True
)

print(remediation)

print("\n=== RECOVERY VERIFICATION ===")

verification = verify_remediation("transit-api")

print("Verified:", verification["verified"])
print("Status:", verification["status"])
print("Details:", verification["verification"])

report = generate_incident_report(
    incident,
    diagnosis,
    risk,
    remediation,
    verification
)

print("\n=== INCIDENT REPORT ===")
print(report)