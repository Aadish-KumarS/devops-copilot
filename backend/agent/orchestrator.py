import json
import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

from agent.tool_registry import execute_read_only_tool

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

MAX_ITERATIONS = 8


TOOL_DEFINITIONS = {
    "get_service_health": {
        "description": "Get the current health and performance metrics of a service.",
        "arguments": {
            "service": "string"
        }
    },
    "get_logs": {
        "description": "Retrieve application logs for a service.",
        "arguments": {
            "service": "string",
            "level": "INFO|WARN|ERROR"
        }
    },
    "get_recent_deployments": {
        "description": "Retrieve recent deployments for a service.",
        "arguments": {
            "service": "string"
        }
    },
    "get_config_changes": {
        "description": "Retrieve configuration changes associated with a service or deployment.",
        "arguments": {
            "service": "string",
            "deployment": "string"
        }
    },
    "search_incident_history": {
        "description": "Search previous incidents involving a service.",
        "arguments": {
            "service": "string"
        }
    },
    "get_system_state": {
        "description": "Get the current simulated infrastructure state.",
        "arguments": {}
    }
}


SYSTEM_PROMPT = """
You are an autonomous production incident investigation agent.

Your job is to investigate an incident using read-only investigation tools.

Available evidence sources include:

- service health
- logs
- deployments
- configuration changes
- incident history
- current system state

Your goal is not merely to identify the immediate failure mechanism.
You must investigate the likely underlying root cause.

Investigation rules:

1. Start by understanding the service health and symptoms.
2. Inspect logs when errors are present.
3. ALWAYS investigate recent deployments when the incident may be
   deployment-related or when a recent deployment could explain the failure.
4. If a relevant deployment exists, inspect its configuration changes.
5. Search incident history when a similar failure may have occurred before.
6. Use system state when it helps validate the current infrastructure condition.
7. Correlate evidence across multiple sources before concluding.
8. Do not stop after identifying only the immediate failure mechanism.
9. Distinguish between:
   - immediate failure mechanism
   - likely underlying root cause
10. Do not guess the root cause.

For example:

Bad conclusion:
"Cache connection timeout caused the incident."

Better investigation:
"Cache connection timeout caused the API failures, but the likely underlying
root cause is a cache configuration change introduced by deployment v3.8."

You should investigate iteratively.

Do not perform remediation.

Rollback, restart, configuration changes, or any other production
modification are outside your authority.

Only finish when there is sufficient cross-source evidence to support
the diagnosis.

Your final response must contain:

{
    "incident_summary": "...",
    "likely_root_cause": "...",
    "confidence": "low|medium|high",
    "evidence": [
        "...",
        "...",
        "..."
    ],
    "recommended_action": "...",
    "risk_level": "low|medium|high"
}
"""

def build_tool_prompt():
    tools = []

    for name, definition in TOOL_DEFINITIONS.items():
        tools.append(
            f"""
Tool: {name}
Description: {definition["description"]}
Arguments: {json.dumps(definition["arguments"])}
"""
        )

    return "\n".join(tools)


def select_next_tool(incident, evidence, trace):
    prompt = f"""
        {SYSTEM_PROMPT}

        AVAILABLE TOOLS:

        {build_tool_prompt()}

        INCIDENT:

        {json.dumps(incident, indent=2)}

        EVIDENCE COLLECTED SO FAR:

        {json.dumps(evidence, indent=2)}

        INVESTIGATION TRACE:

        {json.dumps(trace, indent=2)}

        Decide the next step.

        If another investigation tool is needed, return:

        {{
            "action": "tool",
            "tool": "tool_name",
            "arguments": {{}},
            "reason": "why this tool is needed"
        }}
        IMPORTANT STOPPING RULE:

        If the evidence already contains:
        1. service health or failure metrics,
        2. logs showing the failure mechanism,
        3. a recent deployment or configuration change,
        4. and enough information to connect the failure to that change,

        you MUST return "finish" and provide the diagnosis.

        Do not request the same tool again once its relevant evidence has already been collected.
        Do not continue investigating merely to obtain more evidence.

        If there is enough evidence to diagnose the incident, return:

        {{
            "action": "finish",
            "diagnosis": {{
                "incident_summary": "...",
                "likely_root_cause": "...",
                "confidence": "low|medium|high",
                "evidence": [],
                "recommended_action": "...",
                "risk_level": "low|medium|high"
            }}
        }}

        Only select tools from the available tool list.
        Do not perform remediation.
        """

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.1,
            response_mime_type="application/json"
        )
    )

    return json.loads(response.text)


def investigate_incident(incident):
    evidence = []
    investigation_trace = []

    for iteration in range(MAX_ITERATIONS):

        decision = select_next_tool(
            incident,
            evidence,
            investigation_trace
        )

        if decision.get("action") == "finish":
            return {
                "diagnosis": decision.get("diagnosis"),
                "investigation_trace": investigation_trace
            }

        if decision.get("action") != "tool":
            raise RuntimeError(
                "Agent returned an invalid investigation action"
            )

        tool_name = decision.get("tool")
        arguments = decision.get("arguments", {})
        reason = decision.get("reason", "")

        if tool_name not in TOOL_DEFINITIONS:
            investigation_trace.append({
                "iteration": iteration + 1,
                "tool": tool_name,
                "arguments": arguments,
                "reason": reason,
                "status": "blocked",
                "error": "Tool is not an allowed investigation tool"
            })
            continue

        result = execute_read_only_tool(
            tool_name,
            arguments
        )

        investigation_trace.append({
            "iteration": iteration + 1,
            "tool": tool_name,
            "arguments": arguments,
            "reason": reason,
            "status": "executed" if result["success"] else "failed"
        })

        evidence.append({
            "tool": tool_name,
            "result": result
        })

    return {
        "diagnosis": {
            "incident_summary": "Investigation reached the maximum number of iterations.",
            "likely_root_cause": "Insufficient evidence",
            "confidence": "low",
            "evidence": evidence,
            "recommended_action": "Continue investigation manually.",
            "risk_level": "high"
        },
        "investigation_trace": investigation_trace
    }