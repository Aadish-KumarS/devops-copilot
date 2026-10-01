"""Small SQLite-backed ledger for the demo's durable incident workflow."""

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path


DB_PATH = Path(__file__).resolve().parent.parent / "data" / "incidents.db"


def _now():
    return datetime.now(timezone.utc).isoformat()


def _connect():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_store():
    with _connect() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                service TEXT NOT NULL,
                severity TEXT NOT NULL,
                status TEXT NOT NULL,
                alert TEXT NOT NULL,
                impact TEXT NOT NULL,
                owner TEXT NOT NULL DEFAULT 'Unassigned',
                diagnosis_json TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_incidents_status_updated
            ON incidents(status, updated_at DESC);
            CREATE INDEX IF NOT EXISTS idx_incidents_service_updated
            ON incidents(service, updated_at DESC);
            CREATE TABLE IF NOT EXISTS approvals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_id TEXT NOT NULL,
                operator TEXT NOT NULL,
                role TEXT NOT NULL,
                reason TEXT NOT NULL,
                action TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_approvals_incident_created
            ON approvals(incident_id, created_at DESC);
            CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                message TEXT NOT NULL,
                details_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_audit_events_incident_created
            ON audit_events(incident_id, created_at ASC);
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                incident_id TEXT NOT NULL,
                channel TEXT NOT NULL,
                status TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS idempotency_keys (
                key TEXT PRIMARY KEY,
                response_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )


def _decode_incident(row):
    item = dict(row)
    item["diagnosis"] = json.loads(item.pop("diagnosis_json") or "null")
    return item


def upsert_incident(incident, diagnosis=None):
    initialize_store()
    timestamp = _now()
    with _connect() as connection:
        connection.execute(
            """
            INSERT INTO incidents (id, service, severity, status, alert, impact, diagnosis_json, created_at, updated_at)
            VALUES (?, ?, ?, 'investigating', ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              severity=excluded.severity, status='investigating', alert=excluded.alert,
              impact=excluded.impact, diagnosis_json=excluded.diagnosis_json, updated_at=excluded.updated_at
            """,
            (
                incident["id"], incident["service"], incident["severity"], incident["alert"],
                incident["impact"], json.dumps(diagnosis), timestamp, timestamp
            )
        )
    append_audit(incident["id"], "incident_detected", incident["alert"], {"service": incident["service"]})


def list_incidents(search=None, status=None, limit=20):
    initialize_store()
    clauses, values = [], []
    if search:
        clauses.append("(id LIKE ? OR service LIKE ? OR alert LIKE ? OR owner LIKE ?)")
        values.extend([f"%{search}%"] * 4)
    if status:
        clauses.append("status = ?")
        values.append(status)
    query = "SELECT * FROM incidents"
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += " ORDER BY updated_at DESC LIMIT ?"
    values.append(min(max(limit, 1), 100))
    with _connect() as connection:
        return [_decode_incident(row) for row in connection.execute(query, values).fetchall()]


def get_incident(incident_id):
    initialize_store()
    with _connect() as connection:
        row = connection.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,)).fetchone()
    return _decode_incident(row) if row else None


def assign_owner(incident_id, owner):
    initialize_store()
    with _connect() as connection:
        connection.execute("UPDATE incidents SET owner = ?, updated_at = ? WHERE id = ?", (owner, _now(), incident_id))
    append_audit(incident_id, "incident_assigned", f"Incident assigned to {owner}.", {"owner": owner})
    return get_incident(incident_id)


def set_incident_status(incident_id, status):
    initialize_store()
    with _connect() as connection:
        connection.execute("UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?", (status, _now(), incident_id))
    return get_incident(incident_id)


def record_approval(incident_id, approval, action):
    initialize_store()
    event = {
        "operator": approval["operator"], "role": approval["role"],
        "reason": approval["reason"], "action": action
    }
    with _connect() as connection:
        connection.execute(
            "INSERT INTO approvals (incident_id, operator, role, reason, action, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (incident_id, event["operator"], event["role"], event["reason"], action, _now())
        )
    append_audit(incident_id, "human_approval_recorded", "A qualified operator approved the production action.", event)


def get_approvals(incident_id):
    initialize_store()
    with _connect() as connection:
        return [dict(row) for row in connection.execute(
            "SELECT * FROM approvals WHERE incident_id = ? ORDER BY created_at DESC", (incident_id,)
        ).fetchall()]


def append_audit(incident_id, event_type, message, details=None):
    """Audit rows are append-only; no update or delete API is exposed."""
    initialize_store()
    with _connect() as connection:
        connection.execute(
            "INSERT INTO audit_events (incident_id, event_type, message, details_json, created_at) VALUES (?, ?, ?, ?, ?)",
            (incident_id, event_type, message, json.dumps(details or {}), _now())
        )


def get_audit(incident_id):
    initialize_store()
    with _connect() as connection:
        rows = connection.execute(
            "SELECT * FROM audit_events WHERE incident_id = ? ORDER BY id ASC", (incident_id,)
        ).fetchall()
    return [
        {
            "timestamp": row["created_at"],
            "event": row["event_type"],
            "message": row["message"],
            "details": json.loads(row["details_json"])
        }
        for row in rows
    ]


def record_notification(incident_id, channel, message, status="simulated_delivered"):
    initialize_store()
    with _connect() as connection:
        connection.execute(
            "INSERT INTO notifications (incident_id, channel, status, message, created_at) VALUES (?, ?, ?, ?, ?)",
            (incident_id, channel, status, message, _now())
        )


def get_notifications(incident_id):
    initialize_store()
    with _connect() as connection:
        return [dict(row) for row in connection.execute(
            "SELECT * FROM notifications WHERE incident_id = ? ORDER BY id ASC", (incident_id,)
        ).fetchall()]


def get_idempotent_response(key):
    if not key:
        return None
    initialize_store()
    with _connect() as connection:
        row = connection.execute("SELECT response_json FROM idempotency_keys WHERE key = ?", (key,)).fetchone()
    return json.loads(row["response_json"]) if row else None


def save_idempotent_response(key, response):
    if not key:
        return
    initialize_store()
    with _connect() as connection:
        connection.execute(
            "INSERT OR REPLACE INTO idempotency_keys (key, response_json, created_at) VALUES (?, ?, ?)",
            (key, json.dumps(response), _now())
        )
