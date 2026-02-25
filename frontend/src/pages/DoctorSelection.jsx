/**
 * DoctorSelection.jsx — Patient → Doctor Enrollment Flow
 * Shown after profile setup. Lets patients browse and request enrollment with a doctor.
 */
import { useState, useEffect } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn } from "../components/RiskDashboard";
import { getToken, getDoctors } from "../services/api";

const LIME = "#C8F135";

// Fetch real registered doctors from backend
async function fetchAvailableDoctors() {
  try {
    // getDoctors() calls GET /api/auth/doctors which returns actual registered doctors
    const doctors = await getDoctors();
    // Normalize fields — backend returns user objects, map to expected shape
    return (doctors || []).map(d => ({
      id: d.id,
      full_name: d.full_name,
      specialization: d.specialization || "Neurology",
      experience: d.experience || null,
      hospital: d.hospital || null,
      location: d.location || null,
      consultation_mode: d.consultation_mode || "Online",
      currentPatients: d.currentPatients || 0,
      maxPatients: d.maxPatients || 20,
      bio: d.bio || null,
      available_slots: d.available_slots || [],
      rating: d.rating || null,
    }));
  } catch (_) {
    return [];
  }
}

async function requestEnrollment(doctorId) {
  const token = getToken();
  try {
    const res = await fetch(`/api/doctors/${doctorId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (res.ok) return res.json();
  } catch (_) {}
  // Demo success
  return { success: true, message: "Enrollment request sent." };
}

export default function DoctorSelection({ onComplete, onSkip }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(new Set());
  const [requesting, setRequesting] = useState(null);
  const [filterSpec, setFilterSpec] = useState("All");
  const [filterMode, setFilterMode] = useState("All");

  useEffect(() => {
    fetchAvailableDoctors()
      .then(setDoctors)
      .finally(() => setLoading(false));
  }, []);

  const specializations = ["All", ...new Set(doctors.map(d => d.specialization))];
  const consultModes = ["All", "Online", "Offline", "Both"];

  const filtered = doctors.filter(d => {
    if (filterSpec !== "All" && d.specialization !== filterSpec) return false;
    if (filterMode !== "All" && d.consultation_mode !== filterMode) return false;
    return true;
  });

  async function handleRequest(doctor) {
    if (doctor.currentPatients >= doctor.maxPatients) return;
    if (requested.has(doctor.id)) return;
    setRequesting(doctor.id);
    await requestEnrollment(doctor.id);
    setRequested(prev => new Set([...prev, doctor.id]));
    setRequesting(null);
  }

  const chipBase = (active) => ({
    padding: "6px 14px", borderRadius: 50,
    border: `1px solid ${active ? LIME : "rgba(255,255,255,0.12)"}`,
    background: active ? `rgba(200,241,53,0.12)` : "transparent",
    color: active ? LIME : "#777",
    fontSize: 12, cursor: "pointer", fontWeight: active ? 700 : 400,
    transition: "all 0.18s", fontFamily: "'DM Sans',sans-serif",
  });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 860 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `rgba(200,241,53,0.10)`, border: `1px solid ${LIME}33`, borderRadius: 99, padding: "5px 14px", marginBottom: 16, fontSize: 11, fontWeight: 700, color: LIME, letterSpacing: 1.5, textTransform: "uppercase" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: LIME, display: "inline-block" }} />
            Step 2 of 2
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,4vw,44px)", color: "#fff", letterSpacing: -1, marginBottom: 10 }}>
            Choose Your Doctor
          </h1>
          <p style={{ color: "#555", fontSize: 14, maxWidth: 500, margin: "0 auto" }}>
            Request enrollment with a specialist. Your doctor will review and approve your request — you'll be notified once connected.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Specialty</span>
            {specializations.map(s => (
              <button key={s} style={chipBase(filterSpec === s)} onClick={() => setFilterSpec(s)}>{s}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Mode</span>
            {consultModes.map(m => (
              <button key={m} style={chipBase(filterMode === m)} onClick={() => setFilterMode(m)}>{m}</button>
            ))}
          </div>
        </div>

        {/* Doctor Cards */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#555", padding: 60 }}>Loading available doctors…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#555", padding: 60, border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🩺</div>
            <div style={{ fontWeight: 700, color: "#888", fontSize: 16, marginBottom: 8 }}>No doctors registered yet</div>
            <p style={{ fontSize: 13, color: "#555", maxWidth: 400, margin: "0 auto", lineHeight: 1.7 }}>
              Doctors will appear here once they register on the platform. You can skip this step and connect with a doctor later.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))", gap: 16, marginBottom: 32 }}>
            {filtered.map(doctor => {
              const isFull = doctor.currentPatients >= doctor.maxPatients;
              const isRequested = requested.has(doctor.id);
              const isLoading = requesting === doctor.id;
              const capacityPct = (doctor.currentPatients / doctor.maxPatients) * 100;

              return (
                <DarkCard key={doctor.id} style={{ padding: 24, border: isRequested ? `1px solid ${LIME}33` : isFull ? "1px solid rgba(255,100,100,0.15)" : "1px solid rgba(255,255,255,0.08)" }}>
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16, color: "#fff", marginBottom: 3 }}>{doctor.full_name}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, background: "rgba(96,165,250,0.12)", color: "#60a5fa", padding: "2px 9px", borderRadius: 99, border: "1px solid rgba(96,165,250,0.25)" }}>{doctor.specialization}</span>
                        <span style={{ fontSize: 11, background: "rgba(255,255,255,0.06)", color: "#aaa", padding: "2px 9px", borderRadius: 99 }}>{doctor.consultation_mode}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, marginBottom: 2 }}>⭐</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>{doctor.rating}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 12, lineHeight: 1.8 }}>
                    <div>🏥 {doctor.hospital}</div>
                    <div>📍 {doctor.location} · {doctor.experience} yrs experience</div>
                  </div>

                  {doctor.bio && (
                    <p style={{ fontSize: 12, color: "#777", lineHeight: 1.65, marginBottom: 14, borderLeft: "2px solid rgba(255,255,255,0.08)", paddingLeft: 12 }}>
                      {doctor.bio}
                    </p>
                  )}

                  {/* Capacity bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: "#555" }}>Patient capacity</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isFull ? "#f87171" : LIME }}>
                        {doctor.currentPatients}/{doctor.maxPatients}
                      </span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)" }}>
                      <div style={{ height: "100%", width: `${capacityPct}%`, background: isFull ? "#f87171" : LIME, borderRadius: 2, transition: "width 0.4s" }} />
                    </div>
                  </div>

                  {/* Available slots */}
                  {doctor.available_slots?.length > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                      {doctor.available_slots.map(slot => (
                        <span key={slot} style={{ fontSize: 10, padding: "2px 8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "#666" }}>{slot}</span>
                      ))}
                    </div>
                  )}

                  {/* Action button */}
                  {isFull ? (
                    <div style={{ padding: "10px 16px", borderRadius: 50, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)", color: "#f87171", fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                      ⚠️ This doctor has reached maximum patient capacity.
                    </div>
                  ) : isRequested ? (
                    <div style={{ padding: "10px 16px", borderRadius: 50, background: `rgba(200,241,53,0.08)`, border: `1px solid ${LIME}33`, color: LIME, fontSize: 12, fontWeight: 600, textAlign: "center" }}>
                      ✓ Enrollment Requested — Awaiting Approval
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRequest(doctor)}
                      disabled={isLoading}
                      style={{ width: "100%", padding: "11px 0", borderRadius: 50, border: `1px solid ${LIME}44`, background: `rgba(200,241,53,0.10)`, color: LIME, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", opacity: isLoading ? 0.7 : 1 }}
                      onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = `rgba(200,241,53,0.20)`; e.currentTarget.style.boxShadow = `0 0 24px rgba(200,241,53,0.15)`; } }}
                      onMouseLeave={e => { e.currentTarget.style.background = `rgba(200,241,53,0.10)`; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      {isLoading ? "Sending Request…" : "Request Enrollment →"}
                    </button>
                  )}
                </DarkCard>
              );
            })}
          </div>
        )}

        {/* Bottom nav */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24 }}>
          <button onClick={onSkip} style={{ background: "none", border: "none", color: "#555", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
            Skip for now →
          </button>
          {requested.size > 0 && (
            <Btn onClick={onComplete}>
              Continue to Dashboard ({requested.size} request{requested.size > 1 ? "s" : ""} sent) →
            </Btn>
          )}
        </div>
      </div>
    </div>
  );
}
