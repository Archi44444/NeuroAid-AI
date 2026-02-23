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
 *
 * Payload shape:
 * {
 *   speech, memory, reaction, stroop, tap, fluency, digit_span,
 *   profile: {
 *     age, education_level, sleep_hours,
 *     family_history, existing_diagnosis, sleep_quality,
 *     medical_conditions: { diabetes, hypertension, stroke_history,
 *                           family_alzheimers, parkinsons_dx,
 *                           depression, thyroid_disorder },
 *     fatigue_flags:      { tired, sleep_deprived, sick, anxious },
 *   }
 * }
 *
 * @param {object} payload
 * @param {string} [token] - optional Firebase auth token
 */
export const submitAnalysis = (payload, token) =>
  request("POST", "/analyze", payload, token);

/**
 * Send an educational question to the RAG chatbot.
 *
 * The chatbot:
 *   - Explains cognitive risk indicators in plain language
 *   - Retrieves answers from NIH / Alzheimer's Assoc / Parkinson's Foundation
 *   - Refuses diagnosis and medication questions (guardrails)
 *   - Always returns a disclaimer
 *
 * @param {string} question        - The user's natural language question
 * @param {object} [userContext]   - Optional context e.g. { age, riskScores }
 * @param {string} [token]         - Optional Firebase auth token
 * @returns {Promise<{
 *   answer: string,
 *   sources: string[],
 *   guardrail_triggered: boolean,
 *   disclaimer: string
 * }>}
 */
export const submitChat = (question, userContext = null, token = null) =>
  request("POST", "/chat", { question, user_context: userContext }, token);

// Health check
export const healthCheck = () =>
  fetch((import.meta.env.VITE_API_URL || "") + "/health").then(r => r.json());

// Legacy helpers (kept for compatibility)
export const login = (email, password, role) =>
  request("POST", "/auth/login", { email, password, role });

export const register = (name, email, password, role) =>
  request("POST", "/auth/register", { name, email, password, role });