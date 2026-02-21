// ── API service layer ─────────────────────────────────────────────────────────
// All calls go to the FastAPI backend at /api

const BASE = "/api";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Auth
export const login = (email, password, role) =>
  request("POST", "/auth/login", { email, password, role });

export const register = (name, email, password, role) =>
  request("POST", "/auth/register", { name, email, password, role });

// Assessments
export const getLatestScore = (userId) =>
  request("GET", `/scores/${userId}`);

export const submitSpeechResult = (userId, data) =>
  request("POST", `/assessments/speech`, { userId, ...data });

export const submitMemoryResult = (userId, data) =>
  request("POST", `/assessments/memory`, { userId, ...data });

export const submitReactionResult = (userId, data) =>
  request("POST", `/assessments/reaction`, { userId, ...data });

// Progress
export const getProgress = (userId) =>
  request("GET", `/progress/${userId}`);

// Doctor
export const getPatients = (doctorId) =>
  request("GET", `/doctor/${doctorId}/patients`);

export const getPatientDetail = (patientId) =>
  request("GET", `/patients/${patientId}`);

export const saveNote = (patientId, note) =>
  request("POST", `/patients/${patientId}/notes`, { note });
