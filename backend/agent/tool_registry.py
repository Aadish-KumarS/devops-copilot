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

TOOLS = {
    "get_service_health": get_service_health,
    "get_logs": get_logs,
    "get_recent_deployments": get_recent_deployments,
    "get_config_changes": get_config_changes,
    "search_incident_history": search_incident_history,
    "get_system_state": get_system_state,
    "rollback_deployment": rollback_deployment,
    "verify_service": verify_service
}


def execute_tool(tool_name, arguments=None):
    if tool_name not in TOOLS:
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}"
        }

    arguments = arguments or {}

    try:
        result = TOOLS[tool_name](**arguments)

        return {
            "success": True,
            "tool": tool_name,
            "result": result
        }

    except Exception as error:
        return {
            "success": False,
            "tool": tool_name,
            "error": str(error)
        }