import { useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Stars } from "../components/RiskDashboard";
import { login, register } from "../services/api";

export default function LoginPage({ setView, setRole, setCurrentUser }) {
  const [mode, setMode]         = useState("user");       // "user" | "doctor"
  const [tab, setTab]           = useState("login");      // "login" | "register"
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [license, setLicense]   = useState("");
  const [age, setAge]           = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Map UI mode to backend role
  const backendRole = mode === "doctor" ? "doctor" : "patient";

  async function handleSubmit() {
    setError("");

    if (!email.trim() || !password.trim()) return setError("Email and password are required.");
    const emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRe.test(email.trim())) return setError("Please enter a valid email address (e.g. name@example.com).");
    if (tab === "register" && !fullName.trim()) return setError("Full name is required.");
    if (tab === "register" && password.length < 6) return setError("Password must be at least 6 characters.");
    if (tab === "register" && mode === "doctor" && !license.trim()) return setError("Medical license number is required.");

    setLoading(true);
    try {
      let result;
      if (tab === "login") {
        result = await login(email.trim(), password, backendRole);
      } else {
        result = await register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
          role: backendRole,
          age: age ? parseInt(age) : undefined,
          license_number: license.trim() || undefined,
        });
      }

      if (setCurrentUser) setCurrentUser(result.user);
      setRole(mode);
      setView(mode === "doctor" ? "doctor-dashboard" : "dashboard");

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setFullName(""); setEmail(""); setPassword(""); setLicense(""); setAge("");
  }

  function switchTab(newTab) {
    setTab(newTab);
    setError("");
  }

  const inputStyle = { padding: "13px 16px", borderRadius: 12, fontSize: 14, fontFamily: "'DM Sans',sans-serif" };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,40,40,0.20) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(245,158,11,0.08) 0%, transparent 55%), ${T.bg}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans',sans-serif", position: "relative", overflow: "hidden" }}>
      <Stars count={60} />
      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 2 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,rgba(232,64,64,0.9),rgba(200,36,36,0.95))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px", boxShadow: `0 0 32px rgba(232,64,64,0.45), inset 0 1px 0 rgba(255,255,255,0.16)` }}>⬡</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, color: T.cream }}>NeuroAid</div>
          <div style={{ color: T.creamFaint, fontSize: 13, marginTop: 4 }}>Cognitive AI Platform</div>
        </div>

        <DarkCard style={{ padding: 36 }} hover={false}>

          {/* Role switcher */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 50, padding: 4, marginBottom: 28, border: "1px solid rgba(255,255,255,0.08)" }}>
            {[{ key: "user", label: "👤 Patient" }, { key: "doctor", label: "🩺 Doctor" }].map(r => (
              <button key={r.key} onClick={() => switchMode(r.key)} style={{ flex: 1, padding: "9px 0", borderRadius: 50, border: "none", background: mode === r.key ? "linear-gradient(135deg,rgba(232,64,64,0.88),rgba(200,36,36,0.95))" : "transparent", color: mode === r.key ? "#fff" : T.creamFaint, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Role hint */}
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: T.creamFaint, border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
            {mode === "doctor"
              ? "🩺 Doctor accounts can view all registered patients"
              : "👤 Patient accounts can take cognitive assessments"}
          </div>

          {/* Login / Register tabs */}
          <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => switchTab(t)} style={{ flex: 1, padding: "8px 0", border: "none", background: "transparent", color: tab === t ? T.cream : T.creamFaint, fontWeight: tab === t ? 700 : 400, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", borderBottom: tab === t ? `2px solid ${T.red}` : "2px solid transparent", marginBottom: -1, transition: "all 0.2s", textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {tab === "register" && (
              <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className="glass-input" style={inputStyle} />
            )}
            <input placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} className="glass-input" style={inputStyle} autoComplete="email" />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="glass-input" style={inputStyle} autoComplete={tab === "login" ? "current-password" : "new-password"} />

            {tab === "register" && mode === "user" && (
              <input placeholder="Age (optional)" type="number" value={age} onChange={e => setAge(e.target.value)} className="glass-input" style={inputStyle} />
            )}
            {tab === "register" && mode === "doctor" && (
              <input placeholder="Medical License Number" value={license} onChange={e => setLicense(e.target.value)} className="glass-input" style={inputStyle} autoComplete="off" />
            )}

            {/* Error */}
            {error && (
              <div style={{ color: "#ff6b6b", fontSize: 13, textAlign: "center", padding: "10px 14px", background: "rgba(232,64,64,0.10)", borderRadius: 10, border: "1px solid rgba(232,64,64,0.25)", lineHeight: 1.5 }}>
                ⚠️ {error}
              </div>
            )}

            <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait…" : tab === "login" ? `Sign In as ${mode === "doctor" ? "Doctor" : "Patient"} →` : "Create Account →"}
            </Btn>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => setView("landing")} style={{ background: "none", border: "none", color: T.creamFaint, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Back to Home</button>
          </div>
        </DarkCard>
      </div>
    </div>
  );
}