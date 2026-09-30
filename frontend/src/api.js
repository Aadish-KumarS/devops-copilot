const API_URL = import.meta.env.VITE_API_URL;

export async function investigateIncident() {
  const response = await fetch(`${API_URL}/api/incidents/investigate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: "INC-TRANSIT-001",
      service: "transit-api",
      severity: "high",
      alert: "Transit API returning elevated 500/503 errors",
      impact: "Live arrival information is becoming stale"
    })
  });

  if (!response.ok) {
    throw new Error("Failed to investigate incident");
  }

  return response.json();
}

export async function remediateIncident(diagnosis, approved) {
  const response = await fetch(`${API_URL}/api/incidents/remediate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      diagnosis,
      approved
    })
  });

  if (!response.ok) {
    throw new Error("Failed to execute remediation");
  }

  return response.json();
}

export async function verifyIncident(service = "transit-api") {
  const response = await fetch(`${API_URL}/api/incidents/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      service
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