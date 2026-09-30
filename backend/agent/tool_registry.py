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

READ_ONLY_TOOLS = {
    "get_service_health": get_service_health,
    "get_logs": get_logs,
    "get_recent_deployments": get_recent_deployments,
    "get_config_changes": get_config_changes,
    "search_incident_history": search_incident_history,
    "get_system_state": get_system_state
}

ACTION_TOOLS = {
    "rollback_deployment": rollback_deployment,
    "verify_service": verify_service
}


def execute_read_only_tool(tool_name, arguments=None):
    if tool_name not in READ_ONLY_TOOLS:
        return {
            "success": False,
            "error": f"Tool '{tool_name}' is not allowed during investigation"
        }

    arguments = arguments or {}

    try:
        result = READ_ONLY_TOOLS[tool_name](**arguments)

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


def execute_action_tool(tool_name, arguments=None):
    if tool_name not in ACTION_TOOLS:
        return {
            "success": False,
            "error": f"Action tool '{tool_name}' is not available"
        }

    arguments = arguments or {}

    try:
        result = ACTION_TOOLS[tool_name](**arguments)

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