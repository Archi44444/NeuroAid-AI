// ── API service layer ─────────────────────────────────────────────────────────
// Base URL is read from VITE_API_URL in your .env file.
// Falls back to http://localhost:8000 for local development.
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000") + "/api";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

/**
 * Submit all assessment results for AI scoring.
 * @param {object} payload - { speech, memory, reaction, stroop, tap, profile }
 */
export const submitAnalysis = (payload) =>
  request("POST", "/analyze", payload);
