import { T } from "../utils/theme";
import { DarkCard, Btn, Badge, MiniChart } from "../components/RiskDashboard";

export default function PatientDetail({ patient, setPage }) {
  if (!patient) return null;
  const data = [patient.score-14, patient.score-11, patient.score-8, patient.score-6, patient.score-2, patient.score];
  const rc = patient.risk === "High" ? T.red : patient.risk === "Moderate" ? T.amber : T.green;

  return (
    <div>
      <button onClick={() => setPage("doctor-dashboard")} style={{ background: "none", border: "none", color: T.creamFaint, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 24 }}>← Back to Patients</button>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${rc}18`, border: `1px solid ${rc}44`, display: "flex", alignItems: "center", justifyContent: "center", color: T.cream, fontWeight: 700, fontSize: 22 }}>{patient.name[0]}</div>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 30, color: T.cream, letterSpacing: -0.8 }}>{patient.name}</h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 4 }}>
            <span style={{ color: T.creamFaint, fontSize: 13 }}>Age {patient.age}</span>
            <Badge level={patient.risk} />
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Btn variant="ghost">📥 Download Report</Btn>
          <Btn>+ Add Note</Btn>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Score Trend</div>
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 56, color: T.cream, lineHeight: 1 }}>{patient.score}</span>
            <span style={{ color: T.creamFaint, fontSize: 18 }}>/100</span>
          </div>
          <MiniChart data={data} color={patient.score >= 70 ? T.green : patient.score >= 50 ? T.amber : T.red} height={80} />
        </DarkCard>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 18 }}>Domain Breakdown</div>
          {[
            { label: "Speech",   v: Math.min(100, patient.score - 8),  c: T.red   },
            { label: "Memory",   v: Math.min(100, patient.score + 5),  c: T.green },
            { label: "Reaction", v: Math.min(100, patient.score - 12), c: T.blue  },
          ].map(d => (
            <div key={d.label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: T.creamDim }}>{d.label}</span>
                <span style={{ fontWeight: 700, color: T.cream, fontSize: 13 }}>{d.v}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                <div style={{ height: "100%", width: `${d.v}%`, background: d.c, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </DarkCard>
      </div>
      <DarkCard style={{ padding: 28 }} hover={false}>
        <div style={{ fontWeight: 700, color: T.cream, fontSize: 15, marginBottom: 16 }}>Clinical Notes</div>
        <textarea defaultValue={`Patient shows ${patient.risk === "High" ? "significant" : "mild"} cognitive decline. ${patient.risk === "High" ? "Recommend neurologist referral." : "Schedule follow-up in 30 days."}`}
          style={{ width: "100%", minHeight: 110, padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: T.bg3, fontSize: 14, color: T.creamDim, lineHeight: 1.75, outline: "none", resize: "vertical", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }} />
        <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
          <Btn small>Save Note</Btn>
          <Btn small variant="ghost">Clear</Btn>
        </div>
      </DarkCard>
    </div>
  );
}
