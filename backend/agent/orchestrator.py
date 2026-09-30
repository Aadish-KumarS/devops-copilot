import json
import os

from dotenv import load_dotenv
from openai import OpenAI

from agent.tool_registry import execute_tool

load_dotenv()

client = OpenAI(
    api_key=os.getenv("LLM_API_KEY"),
    base_url=os.getenv("LLM_BASE_URL")
)

MODEL = os.getenv("LLM_MODEL")

READ_ONLY_TOOLS = {
    "get_service_health",
    "get_logs",
    "get_recent_deployments",
    "get_config_changes",
    "search_incident_history",
    "get_system_state"
}

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_service_health",
            "description": "Get the current health and performance metrics of a service.",
            "parameters": {
                "type": "object",
                "properties": {
                    "service": {
                        "type": "string",
                        "description": "Name of the service"
                    }
                },
                "required": ["service"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_logs",
            "description": "Retrieve application logs for a service.",
            "parameters": {
                "type": "object",
                "properties": {
                    "service": {
                        "type": "string"
                    },
                    "level": {
                        "type": "string",
                        "enum": ["INFO", "WARN", "ERROR"]
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_recent_deployments",
            "description": "Retrieve recent deployments for a service.",
            "parameters": {
                "type": "object",
                "properties": {
                    "service": {
                        "type": "string"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_config_changes",
            "description": "Retrieve configuration changes associated with a service or deployment.",
            "parameters": {
                "type": "object",
                "properties": {
                    "service": {
                        "type": "string"
                    },
                    "deployment": {
                        "type": "string"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_incident_history",
            "description": "Search previous incidents involving a service.",
            "parameters": {
                "type": "object",
                "properties": {
                    "service": {
                        "type": "string"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_system_state",
            "description": "Get the current simulated infrastructure state.",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    }
]


SYSTEM_PROMPT = """
You are an AI incident investigation agent.

Your job is to investigate a production incident using available tools.

Do not guess the root cause.

Use tools to collect evidence and correlate:
- service health
- logs
- deployments
- configuration changes
- previous incidents
- current system state

You should investigate iteratively. After receiving evidence, decide whether
another tool is needed.

When you have enough evidence, provide a structured diagnosis.

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

Do not perform remediation actions.
"""


def investigate_incident(incident):
    messages = [
        {
            "role": "system",
            "content": SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": json.dumps(incident)
        }
    ]

    investigation_trace = []

    while True:
        response = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            tools=TOOL_SCHEMAS,
            tool_choice="auto"
        )

        if response.error:
            raise RuntimeError(
                f"LLM provider error: {response.error.get('message')}"
            )

        if not response.choices:
            raise RuntimeError("LLM returned no choices")
        message = response.choices[0].message

        if not message.tool_calls:
            return {
                "diagnosis": message.content,
                "investigation_trace": investigation_trace
            }

        messages.append(message)

        for tool_call in message.tool_calls:
            tool_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments or "{}")

            if tool_name not in READ_ONLY_TOOLS:
                result = {
                    "success": False,
                    "error": "Tool is not available during investigation"
                }
            else:
                result = execute_tool(tool_name, arguments)

            investigation_trace.append({
                "tool": tool_name,
                "arguments": arguments,
                "result": result
            })

            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result)
            })