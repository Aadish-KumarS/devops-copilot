from agent.orchestrator import investigate_incident


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

print("\nDIAGNOSIS")
print(result["diagnosis"])

print("\nINVESTIGATION TRACE")

for step in result["investigation_trace"]:
    print(f"\nTool: {step['tool']}")
    print(f"Arguments: {step['arguments']}")