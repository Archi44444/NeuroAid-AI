// ── API service layer ─────────────────────────────────────────────────────────
// Uses VITE_API_URL env variable, falls back to /api for same-origin proxy
const BASE = (import.meta.env.VITE_API_URL || "") + "/api";

async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

/**
 * Submit all assessment results for AI analysis.
 * @param {object} payload - { speech, memory, reaction, stroop, tap, profile, fluency, digit_span }
 * @param {string} [token] - optional Firebase auth token
 */
export const submitAnalysis = (payload, token) =>
  request("POST", "/analyze", payload, token);

// Health check
export const healthCheck = () =>
  fetch((import.meta.env.VITE_API_URL || "") + "/health").then(r => r.json());

// Legacy helpers (kept for compatibility)
export const login = (email, password, role) =>
  request("POST", "/auth/login", { email, password, role });

export const register = (name, email, password, role) =>
  request("POST", "/auth/register", { name, email, password, role });
