// ── API service layer ─────────────────────────────────────────────────────────
const BASE = "/api";

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
 * Submit all three assessment results in one call.
 * @param {object} payload - { speech, memory, reaction, profile }
 */
export const submitAnalysis = (payload) =>
  request("POST", "/analyze", payload);

// Legacy helpers kept for compatibility
export const login = (email, password, role) =>
  request("POST", "/auth/login", { email, password, role });

export const register = (name, email, password, role) =>
  request("POST", "/auth/register", { name, email, password, role });
