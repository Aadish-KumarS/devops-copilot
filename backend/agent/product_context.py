RUNBOOKS = {
    "cache_failure": {
        "title": "Cache configuration rollback",
        "url": "https://runbooks.example.dev/cache-regression",
        "why": "A deployment changed cache pool capacity and timeout thresholds immediately before the error spike.",
        "manual_steps": ["Validate cache saturation", "Compare v3.8 and v3.7 configuration", "Roll back via the approved deployment workflow"]
    },
    "database_failure": {
        "title": "Database connection-pool rollback",
        "url": "https://runbooks.example.dev/database-pool-exhaustion",
        "why": "The active release reduced DB_POOL_SIZE from 50 to 10 and logs show connection acquisition timeouts.",
        "manual_steps": ["Confirm active connection exhaustion", "Compare pool configuration with v4.1", "Roll back or restore pool settings through change management"]
    },
    "external_api_failure": {
        "title": "External provider degradation response",
        "url": "https://runbooks.example.dev/provider-degradation",
        "why": "The service is healthy internally, while provider timeouts and 503 responses continue upstream.",
        "manual_steps": ["Confirm provider status", "Enable provider fallback", "Escalate through the supplier incident channel"]
    }
}


DEPENDENCY_GRAPHS = {
    "cache_failure": {"primary": "Transit API", "nodes": ["Client apps", "Transit API", "Cache service", "Arrival feed"], "affected": ["Client apps", "Transit API"], "blast_radius": "2 downstream services"},
    "database_failure": {"primary": "Route Planner", "nodes": ["Client apps", "Route Planner", "PostgreSQL", "Routing engine"], "affected": ["Client apps", "Route Planner"], "blast_radius": "2 downstream services"},
    "external_api_failure": {"primary": "Station Display", "nodes": ["Passenger displays", "Station Display", "Provider gateway", "Arrival provider"], "affected": ["Passenger displays", "Station Display"], "blast_radius": "2 downstream services"}
}


def notification_targets(incident):
    message = f"{incident['id']}: {incident['severity'].upper()} — {incident['alert']}"
    return [
        {"channel": "Slack · #incident-command", "message": message, "mode": "simulation"},
        {"channel": "PagerDuty · Transit Platform", "message": message, "mode": "simulation"},
        {"channel": "Email · on-call@devopscopilot.dev", "message": message, "mode": "simulation"}
    ]
