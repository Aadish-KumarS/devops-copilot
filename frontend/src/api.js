const API_URL = import.meta.env.VITE_API_URL;

export async function investigateIncident(scenario) {
  const response = await fetch(`${API_URL}/api/incidents/investigate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      scenario
    })
  });

  if (!response.ok) {
    throw new Error("Failed to investigate incident");
  }

  return response.json();
}

export async function remediateIncident(
  diagnosis,
  approved,
  scenario,
  incident,
  approval,
  idempotencyKey
) {
  const response = await fetch(`${API_URL}/api/incidents/remediate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      diagnosis,
      approved,
      scenario,
      incident,
      approval,
      idempotency_key: idempotencyKey
    })
  });

  if (!response.ok) {
    throw new Error("Failed to execute remediation");
  }

  return response.json();
}

export async function verifyIncident(
  service = "transit-api",
  scenario,
  incident
) {
  const response = await fetch(`${API_URL}/api/incidents/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      service,
      scenario,
      incident
    })
  });

  if (!response.ok) {
    throw new Error("Failed to verify incident recovery");
  }

  return response.json();
}

export async function resetIncident() {
  const response = await fetch(`${API_URL}/api/incidents/reset`, {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to reset incident");
  }

  return response.json();
}

export async function getCurrentIncident() {
  const response = await fetch(`${API_URL}/api/incidents/current`);

  if (!response.ok) {
    throw new Error("Failed to load current incident state");
  }

  return response.json();
}
export async function getScenarios() {
  const response = await fetch(`${API_URL}/api/scenarios`);

  if (!response.ok) {
    throw new Error("Failed to load scenarios");
  }

  return response.json();
}

export async function selectScenario(scenarioName) {
  const response = await fetch(
    `${API_URL}/api/scenarios/${scenarioName}`,
    {
      method: "POST"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to select scenario");
  }

  return response.json();
}

export async function assignIncident(incidentId, owner) {
  const response = await fetch(`${API_URL}/api/incidents/${incidentId}/assign`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ owner }) });
  if (!response.ok) throw new Error("Failed to assign incident owner");
  return response.json();
}

export async function recordIncidentDecision(incidentId, decision, reason) {
  const response = await fetch(`${API_URL}/api/incidents/${incidentId}/decision`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, reason }) });
  if (!response.ok) throw new Error("Failed to record incident decision");
  return response.json();
}

export async function getIncidents(search = "") {
  const response = await fetch(`${API_URL}/api/incidents?search=${encodeURIComponent(search)}`);
  if (!response.ok) throw new Error("Failed to load incident records");
  return response.json();
}
