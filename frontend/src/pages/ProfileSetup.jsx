import { useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Stars } from "../components/RiskDashboard";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const STEP_COUNT = 3;

export default function ProfileSetup({ onComplete, user }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    age: user?.age || "",
    gender: "", handedness: "right",
    education: "", occupation: "",
    medicalHistory: [], currentMeds: "",
    cognitiveComplaints: [], sleepHours: "", exerciseFreq: "",
  });
  const [loading, setLoading] = useState(false);

  function update(key, val) { setData(d => ({ ...d, [key]: val })); }

  function toggleArr(key, val) {
    setData(d => ({
      ...d,
      [key]: d[key].includes(val) ? d[key].filter(x => x !== val) : [...d[key], val],
    }));
  }

  async function finish() {
    setLoading(true);
    try {
      if (user?.uid && user.uid !== "guest") {
        await updateDoc(doc(db, "users", user.uid), {
          profile: data,
          profileComplete: true,
          updatedAt: new Date().toISOString(),
        });
      }
      onComplete({ profile: data, profileComplete: true });
    } catch (e) {
      console.error(e);
      onComplete({ profile: data, profileComplete: true });
    } finally {
      setLoading(false);
    }
  }

  const labelStyle = { fontSize: 12, color: T.creamFaint, marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.8 };
  const inputStyle = { padding: "11px 14px", borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: T.bg2, fontSize: 14, color: T.cream, outline: "none", fontFamily: "'DM Sans',sans-serif", width: "100%" };
  const chipBase   = (active) => ({ padding: "8px 16px", borderRadius: 50, border: `1px solid ${active ? T.red : T.cardBorder}`, background: active ? "rgba(232,64,64,0.15)" : T.bg3, color: active ? T.red : T.creamDim, fontSize: 13, cursor: "pointer", fontWeight: active ? 600 : 400, transition: "all 0.2s", fontFamily: "'DM Sans',sans-serif" });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>
      <Stars count={40} />
      <div style={{ width: "100%", maxWidth: 560, position: "relative", zIndex: 2 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px", boxShadow: `0 0 30px ${T.redGlow}` }}>⬡</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: T.cream }}>
            Welcome, {user?.name || "there"} 👋
          </div>
          <div style={{ color: T.creamFaint, fontSize: 13, marginTop: 6 }}>Let's set up your profile — takes ~2 minutes</div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {Array.from({ length: STEP_COUNT }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? T.red : "rgba(255,255,255,0.08)", transition: "background 0.4s" }} />
          ))}
        </div>

        <DarkCard style={{ padding: 36 }} hover={false}>
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.cream, marginBottom: 4 }}>Basic Information</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Age</label>
                  <input type="number" min="18" max="100" placeholder="e.g. 45" value={data.age} onChange={e => update("age", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Sleep (hrs/night)</label>
                  <input type="number" min="1" max="12" placeholder="e.g. 7" value={data.sleepHours} onChange={e => update("sleepHours", e.target.value)} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Male","Female","Non-binary","Prefer not to say"].map(g => (
                    <button key={g} style={chipBase(data.gender === g)} onClick={() => update("gender", g)}>{g}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Dominant Hand</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["right","left","ambidextrous"].map(h => (
                    <button key={h} style={chipBase(data.handedness === h)} onClick={() => update("handedness", h)} >{h.charAt(0).toUpperCase()+h.slice(1)}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Education Level</label>
                <select value={data.education} onChange={e => update("education", e.target.value)} style={{ ...inputStyle, background: T.bg2 }}>
                  <option value="">Select…</option>
                  {["High School","Some College","Bachelor's","Master's","Doctoral","Professional Degree"].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.cream, marginBottom: 4 }}>Health Background</div>
              <div>
                <label style={labelStyle}>Medical History (select all that apply)</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["Hypertension","Diabetes","Heart Disease","Stroke","Depression","Anxiety","TBI","Sleep Apnea","None"].map(m => (
                    <button key={m} style={chipBase(data.medicalHistory.includes(m))} onClick={() => toggleArr("medicalHistory", m)}>{m}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Current Medications</label>
                <input placeholder="e.g. Amlodipine, Metformin (or 'None')" value={data.currentMeds} onChange={e => update("currentMeds", e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Exercise Frequency</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["None","1-2x/week","3-4x/week","5+/week"].map(f => (
                    <button key={f} style={chipBase(data.exerciseFreq === f)} onClick={() => update("exerciseFreq", f)}>{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Occupation</label>
                <input placeholder="e.g. Engineer, Retired, Student" value={data.occupation} onChange={e => update("occupation", e.target.value)} style={inputStyle} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.cream, marginBottom: 4 }}>Cognitive Concerns</div>
              <div>
                <label style={labelStyle}>Have you noticed any of the following?</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    "Memory lapses","Word-finding difficulty","Concentration issues",
                    "Slower reaction","Mood changes","Coordination issues","Sleep disturbances","None",
                  ].map(c => (
                    <button key={c} style={chipBase(data.cognitiveComplaints.includes(c))} onClick={() => toggleArr("cognitiveComplaints", c)}>{c}</button>
                  ))}
                </div>
              </div>
              <div style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 14, padding: "16px 20px" }}>
                <div style={{ color: T.green, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>✓ Profile Complete</div>
                <p style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65 }}>
                  This profile information helps calibrate your cognitive baselines and makes results more accurate over time. 
                  Your data is encrypted and never shared without consent.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: "11px 22px", borderRadius: 50, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.creamDim, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Back</button>
            ) : (
              <div />
            )}
            {step < STEP_COUNT ? (
              <Btn onClick={() => setStep(s => s + 1)}>Next →</Btn>
            ) : (
              <Btn onClick={finish} style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? "⏳ Saving…" : "Start Assessments →"}
              </Btn>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button onClick={() => onComplete({ profileComplete: true })} style={{ background: "none", border: "none", color: T.creamFaint, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
              Skip for now
            </button>
          </div>
        </DarkCard>
      </div>
    </div>
  );
}
