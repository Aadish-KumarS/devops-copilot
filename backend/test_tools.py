from tools.incident_tools import (
    get_service_health,
    get_logs,
    get_recent_deployments,
    get_config_changes,
    search_incident_history,
    get_system_state,
    rollback_deployment,
    verify_service
)

print("HEALTH")
print(get_service_health("transit-api"))

print("\nDEPLOYMENTS")
print(get_recent_deployments("transit-api"))

print("\nLOGS")
print(get_logs("transit-api"))

print("\nCONFIG CHANGES")
print(get_config_changes("transit-api", "v3.8"))

print("\nHISTORY")
print(search_incident_history("transit-api"))

print("\nBEFORE ROLLBACK")
print(get_system_state())

print("\nROLLBACK")
print(rollback_deployment())

print("\nAFTER ROLLBACK")
print(get_system_state())

print("\nVERIFICATION")
print(verify_service())