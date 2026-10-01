# DevOps Copilot — Autonomous Incident Response

An evidence-first incident-response copilot that turns fragmented production signals into an explainable, policy-gated recovery plan—while keeping the final production decision with an accountable human.

> **One-line pitch:** DevOps Copilot investigates; deterministic policy decides what is safe; people authorize production change.

## Why it stands out

The product is intentionally designed around the trust gap in autonomous operations:

- **Observable:** a six-source evidence-to-decision map makes the basis for every recommendation visible.
- **Governed:** high-impact changes pass an explicit confidence and risk gate before an operator can approve them.
- **Accountable:** ownership, approval history, overrides, notifications, remediation, verification, and audit events live in a durable incident ledger.
- **Demo-ready:** the guided scenario resets the environment and tells a complete, repeatable story from critical alert to verified recovery.

The prototype uses controlled incident scenarios so the complete safety loop can be demonstrated without changing real infrastructure. The adapter boundaries are structured for live observability, incident-management, and notification integrations.

## ⚡ 90-Second Judge Demo

Open the product and select **Launch the 90-sec demo**. The guided path uses a database connection-pool regression to demonstrate the complete safety loop:

1. **Detect:** Route Planner shows critical error rate, latency, and 5xx degradation.
2. **Investigate:** Copilot correlates six read-only sources—health, logs, deployments, config, history, and system state.
3. **Explain:** The UI exposes the root cause, confidence, evidence trail, and the decision ledger.
4. **Govern:** The proposed rollback is classified as high risk and explicitly held for human approval.
5. **Recover:** After approval, the demo verifies service recovery and generates an audit-ready incident report and handoff brief.

> **The pitch:** AI accelerates investigation; deterministic policy controls risk; humans authorize production change.

## Deploy safely

- **Frontend (Vercel):** deploy the `frontend` directory and set `VITE_API_URL` to the public backend URL. See [`frontend/.env.example`](frontend/.env.example).
- **Backend (Render):** the included [`render.yaml`](render.yaml) installs the API requirements, starts Uvicorn on Render's assigned port, and exposes a health check at `/`.
- **CORS:** the API accepts local development origins and Vercel preview origins matching this project's deployment naming pattern. Add your exact custom-domain origin to `backend/main.py` if you introduce one.
- **AI fallback:** a missing Gemini key does not break the judge demo; the API returns a deterministic, evidence-based fallback diagnosis. Add `GEMINI_API_KEY` to Render to enable the Gemini investigation path.

### Live GitHub change intelligence

The console includes a **Live Change Intelligence** panel. Enter any public `owner/repository` identifier and it will retrieve the latest commits from GitHub's read-only REST API—real change evidence, not simulated data.

- Public repositories work without credentials.
- For private repositories or higher API limits, set `GITHUB_TOKEN` **only in the backend environment**. Use a fine-grained, read-only token with access limited to the intended repository; never put it in `VITE_*` variables.
- The adapter validates repository input, limits requests, uses a verified TLS bundle, and only performs read operations. It cannot create commits, deployments, issues, or other changes.
- See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example) for configuration.

## 🚨 Problem

Production incidents require engineers to quickly investigate logs, service health, deployments, configuration changes, and previous incidents.

This process is often:

- Time-consuming
- Manual
- Difficult to correlate across multiple sources
- Prone to human error during high-pressure incidents
- Difficult to audit after resolution

DevOps Copilot aims to reduce this investigation and response effort using an AI-driven incident response workflow.

## 💡 Solution

DevOps Copilot provides a closed-loop incident response workflow:

```text
Detect
  ↓
Investigate
  ↓
Correlate Evidence
  ↓
Identify Root Cause
  ↓
Assess Risk
  ↓
Human Approval
  ↓
Remediate
  ↓
Verify Recovery
  ↓
Generate Audit Report
```

The AI investigates structured incident evidence and recommends actions, while deterministic backend policies control whether an action requires human approval.

## ✨ Key Features

### 🔍 AI Incident Investigation

The AI investigates incidents using multiple evidence sources:

- Service health metrics
- Application logs
- Recent deployments
- Configuration changes
- Incident history
- System state

### 🧠 Evidence-Based Root Cause Analysis

Instead of relying on a single signal, the system correlates evidence from multiple sources to determine the likely root cause.

Example:

```text
High error rate
      +
Database connection failures
      +
Recent deployment
      +
Database pool configuration change
      ↓
Likely configuration regression
```

### ⚠️ Risk Assessment

Recommended actions are evaluated by a deterministic risk engine.

Production-changing actions such as rollbacks are classified as high risk.

```text
AI Recommendation
       ↓
Risk Engine
       ↓
HIGH RISK
       ↓
Human Approval Required
```

### 👤 Human-in-the-Loop Remediation

High-risk production actions cannot be executed automatically.

An operator must explicitly approve the remediation before it is executed.

### 🔧 Automated Remediation

After approval, the system can execute supported remediation actions such as:

- Deployment rollback
- Provider restoration

The current environment uses simulated infrastructure for safe demonstration.

### ✅ Recovery Verification

The system doesn't assume that remediation worked.

It checks service health after the action and verifies whether recovery conditions are satisfied.

### 📊 Recovery Metrics

The dashboard compares system performance before and after remediation.

Example:

```text
Error Rate     61.8% → 1.4%
Latency        6800ms → 240ms
HTTP 5xx       54.2% → 1.1%
Data Freshness 9min → 9s
```

### 🧾 Audit Trail

Every major incident stage is recorded:

```text
Incident detected
Investigation completed
Root cause identified
Risk assessed
Remediation executed
Recovery verified
```

This provides traceability and accountability throughout the incident lifecycle.

## 🎭 Incident Scenarios

The prototype includes simulated production incidents.

### 1. Cache Configuration Failure

A cache configuration regression causes elevated Transit API failures.

```text
Cache configuration change
        ↓
Cache failures
        ↓
HTTP 500/503 errors
        ↓
Rollback
        ↓
Recovery
```

### 2. Database Connection Failure

A database connection-pool configuration change causes connection exhaustion.

```text
Deployment v4.2
        ↓
Pool size: 50 → 10
Timeout: 5000ms → 3000ms
        ↓
Connection pool exhaustion
        ↓
Route planning failures
        ↓
Rollback to v4.1
        ↓
Recovery
```

### 3. External Provider Failure

A station-display service experiences failures caused by an external provider.

This demonstrates that not every incident necessarily originates from an application deployment or configuration change.

## 🏗️ Architecture

```text
                    React Dashboard
                          │
                          ▼
                       FastAPI
                          │
                          ▼
                  AI Orchestrator
                          │
                          ▼
                       Gemini
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
           Investigation       Diagnosis
              Tools
                 │
        ┌────────┼────────┐
        ▼        ▼        ▼
      Logs   Deployments  Config
        │        │        │
        └────────┼────────┘
                 ▼
          Simulated Environment
                 │
                 ▼
           Risk Engine
                 │
          ┌──────┴──────┐
          ▼             ▼
       Low Risk      High Risk
          │             │
          │       Human Approval
          │             │
          └──────┬──────┘
                 ▼
             Remediation
                 │
                 ▼
          Recovery Verification
                 │
                 ▼
             Audit Report
```

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI

### AI

- Google Gemini API
- Tool-based AI investigation
- Structured JSON responses

### Infrastructure Simulation

- JSON-based simulated service state
- Simulated logs
- Simulated deployments
- Simulated configuration changes
- Simulated remediation and recovery

## 📁 Project Structure

```text
devops-copilot/
│
├── backend/
│   ├── agent/
│   │   ├── orchestrator.py
│   │   ├── tool_registry.py
│   │   ├── rca_engine.py
│   │   ├── risk_engine.py
│   │   ├── remediation.py
│   │   ├── verification.py
│   │   ├── audit_logger.py
│   │   └── llm_engine.py
│   │
│   ├── tools/
│   │   ├── incident_tools.py
│   │   └── scenario_manager.py
│   │
│   ├── data/
│   │   ├── scenarios.json
│   │   ├── scenario_data.json
│   │   ├── scenario_state.json
│   │   └── system_state.json
│   │
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── App.css
│   │
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Python 3.10+
- Node.js 20+
- npm
- Gemini API key

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd devops-copilot
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

Start the backend:

```bash
uvicorn main:app --reload
```

Backend:

```text
http://localhost:8000
```

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Open the URL shown by Vite.

## 🔄 Demo Workflow

For the recommended database failure demonstration:

```text
1. Select Database Failure
        ↓
2. Start Investigation
        ↓
3. AI analyzes service health
        ↓
4. AI analyzes logs
        ↓
5. AI checks recent deployment
        ↓
6. AI correlates configuration changes
        ↓
7. Root cause identified
        ↓
8. Risk classified as HIGH
        ↓
9. Human approves rollback
        ↓
10. Deployment rolled back
        ↓
11. Recovery metrics verified
        ↓
12. Incident report generated
```

## 🔐 Safety Design

A key design principle is:

> The AI recommends actions, but the AI does not control the authorization boundary.

The system uses a deterministic risk layer between AI recommendations and remediation.

```text
AI
 ↓
Recommendation
 ↓
Deterministic Risk Engine
 ↓
Approval Required?
 ↓
Human Decision
 ↓
Remediation
 ↓
Verification
```

This prevents the AI from independently executing high-risk production modifications.

## 🎯 MVP

The MVP demonstrates a complete AI incident-response loop:

- Detect a simulated production incident
- Investigate using multiple evidence sources
- Correlate evidence
- Identify the likely root cause
- Recommend remediation
- Assess remediation risk
- Require human approval for high-risk actions
- Execute simulated remediation
- Verify recovery
- Generate an incident report and audit trail

## 🔮 Future Improvements

Potential future extensions include:

- Real Kubernetes integration
- Prometheus/Grafana monitoring
- Real application log ingestion
- GitHub/GitLab deployment integration
- Slack/Teams incident notifications
- More remediation actions
- Role-based approval workflows
- Persistent incident history
- Multi-service dependency graphs
- Automated incident postmortems
- Production-grade authentication and authorization

## ⚠️ Disclaimer

This hackathon prototype uses a simulated infrastructure environment.

Remediation actions demonstrated by the application do not modify real production infrastructure.

The architecture is designed to demonstrate how the same workflow could be integrated with real DevOps infrastructure in a production environment.

## 🏆 Hackathon Concept

**DevOps Copilot — Autonomous Incident Response**

An AI-driven closed-loop incident response system designed to move incident handling from:

```text
Manual Investigation
        ↓
AI-Assisted Investigation
        ↓
Evidence-Based Decision
        ↓
Safe Remediation
        ↓
Verified Recovery
```

---

**Built for the 24° Shift Hackathon 2026**
