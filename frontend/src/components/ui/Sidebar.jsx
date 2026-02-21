import { T } from "../../utils/helpers";

const USER_NAV = [
  { id: "dashboard", label: "Overview", icon: "◈" },
  { id: "assessments", label: "Assessments", icon: "◉" },
  { id: "speech", label: "Speech Test", icon: "◎" },
  { id: "memory", label: "Memory Test", icon: "⬡" },
  { id: "reaction", label: "Reaction Test", icon: "◷" },
  { id: "results", label: "Results", icon: "◆" },
  { id: "progress", label: "Progress", icon: "↗" },
];

const DOCTOR_NAV = [
  { id: "doctor-dashboard", label: "Dashboard", icon: "◈" },
  { id: "patients", label: "Patients", icon: "◉" },
];

export default function Sidebar({ role, page, setPage, setView }) {
  const nav = role === "doctor" ? DOCTOR_NAV : USER_NAV;
  return (
    <div style={{ width: 220, minHeight: "100vh", background: T.bg1, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100 }}>
      <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${T.cardBorder}`, cursor: "pointer" }} onClick={() => setView("landing")}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: `0 0 16px ${T.redGlow}` }}>⬡</div>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: T.cream, letterSpacing: -0.5 }}>NeuroAid</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map((item) => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "none", background: active ? "rgba(232,64,64,0.12)" : "transparent", color: active ? T.red : T.creamFaint, fontWeight: active ? 600 : 400, fontSize: 13.5, cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif" }}>
              <span style={{ fontSize: 14, width: 18 }}>{item.icon}</span>{item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.cardBorder}` }}>
        <button onClick={() => setView("landing")} style={{ background: "transparent", border: "none", color: T.creamFaint, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Sign out</button>
      </div>
    </div>
  );
}
