import { useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Stars } from "../components/RiskDashboard";

export default function LoginPage({ setView, setRole }) {
  const [mode, setMode] = useState("user");
  const [tab, setTab]   = useState("login");

  function go() {
    setRole(mode);
    setView(mode === "doctor" ? "doctor-dashboard" : "dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>
      <Stars count={60} />
      <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 500, height: 300, background: "radial-gradient(ellipse 70% 100% at 50% 100%, rgba(180,100,20,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px", boxShadow: `0 0 30px ${T.redGlow}` }}>⬡</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: T.cream }}>NeuroAid</div>
          <div style={{ color: T.creamFaint, fontSize: 13, marginTop: 4 }}>Cognitive AI Platform</div>
        </div>
        <DarkCard style={{ padding: 36 }} hover={false}>
          <div style={{ display: "flex", background: T.bg3, borderRadius: 50, padding: 4, marginBottom: 28, border: `1px solid ${T.cardBorder}` }}>
            {["user","doctor"].map(r => (
              <button key={r} onClick={() => setMode(r)} style={{ flex: 1, padding: "9px 0", borderRadius: 50, border: "none", background: mode === r ? T.red : "transparent", color: mode === r ? T.white : T.creamFaint, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", boxShadow: mode === r ? `0 0 16px ${T.redGlow}` : "none" }}>
                {r === "user" ? "👤 Patient" : "🩺 Doctor"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", marginBottom: 24, borderBottom: `1px solid ${T.cardBorder}` }}>
            {["login","register"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "8px 0", border: "none", background: "transparent", color: tab === t ? T.cream : T.creamFaint, fontWeight: tab === t ? 700 : 400, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", borderBottom: tab === t ? `2px solid ${T.red}` : "2px solid transparent", marginBottom: -1, transition: "all 0.2s", textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tab === "register" && <input placeholder="Full Name" style={{ padding: "13px 16px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: T.bg2, fontSize: 14, color: T.cream, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />}
            <input placeholder="Email address" type="email" style={{ padding: "13px 16px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: T.bg2, fontSize: 14, color: T.cream, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
            <input placeholder="Password" type="password" style={{ padding: "13px 16px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: T.bg2, fontSize: 14, color: T.cream, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
            {mode === "doctor" && <input placeholder="Medical License Number" style={{ padding: "13px 16px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: T.bg2, fontSize: 14, color: T.cream, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />}
            <Btn onClick={go} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>{tab === "login" ? "Sign In →" : "Create Account →"}</Btn>
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => setView("landing")} style={{ background: "none", border: "none", color: T.creamFaint, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Back to Home</button>
          </div>
        </DarkCard>
      </div>
    </div>
  );
}
