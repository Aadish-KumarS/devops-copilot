import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")


def generate_incident_analysis(evidence, diagnosis,risk):
    prompt = f"""
You are a senior SRE analyzing a production incident.

Analyze the structured incident evidence below.

Evidence:
{json.dumps(evidence, indent=2)}

Deterministic diagnosis:
{json.dumps(diagnosis, indent=2)}

Risk assessment:
{json.dumps(risk, indent=2)}

Return JSON with exactly these fields:

{{
  "summary": "short explanation of what happened",
  "root_cause_explanation": "explain the likely causal chain",
  "evidence_summary": [
    "important evidence 1",
    "important evidence 2",
    "important evidence 3"
  ],
  "recommended_action": "recommended remediation",
  "risk_explanation": "why the action is risky or safe"
}}

Rules:
- Use only the supplied evidence.
- Do not invent infrastructure facts.
- Treat the deterministic diagnosis as supporting evidence, not absolute truth.
- Use cautious language such as "likely" when appropriate.
- Keep the response concise.
- Do not contradict the deterministic diagnosis or risk assessment.
- The deterministic risk classification is authoritative.
- If the deterministic diagnosis says the action is high risk, describe it as high risk and requiring human approval.
- The deterministic risk assessment is authoritative.
- Do not contradict its risk_level or requires_approval values.
- If risk_level is "high", describe the action as high risk.
- If requires_approval is true, explicitly state that human approval is required.
"""

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json"
        )
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response")

    return json.loads(response.text)