import { useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Stars } from "../components/RiskDashboard";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function LoginPage({ setView, setRole, onLogin }) {
  const [mode, setMode]   = useState("user");
  const [tab, setTab]     = useState("login");
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [license, setLicense] = useState("");
  const [age, setAge]     = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]     = useState("");

  async function go() {
    setErr("");
    if (!email || !pass) { setErr("Please fill in all fields."); return; }
    if (tab === "register" && !name.trim()) { setErr("Please enter your name."); return; }
    if (tab === "register" && mode === "user" && (!age || isNaN(age) || age < 18 || age > 100)) { setErr("Please enter a valid age (18-100)."); return; }
    setLoading(true);
    try {
      if (tab === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        await updateProfile(cred.user, { displayName: name.trim() });
        await setDoc(doc(db, "users", cred.user.uid), {
          name: name.trim(),
          email,
          role: mode,
          age: mode === "user" ? parseInt(age, 10) : null,
          license: mode === "doctor" ? license : null,
          createdAt: new Date().toISOString(),
          profileComplete: false,
        });
        onLogin({ name: name.trim(), email, uid: cred.user.uid, role: mode, isNew: true, age: mode === "user" ? parseInt(age, 10) : null });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, pass);
        const snap = await getDoc(doc(db, "users", cred.user.uid));
        const data = snap.data() || {};
        const userName = data.name || cred.user.displayName || email.split("@")[0];
        onLogin({
          name: userName,
          email,
          uid: cred.user.uid,
          role: data.role || mode,
          isNew: false,
          ...data,
        });
      }
    } catch (e) {
      const msg = e.code === "auth/user-not-found" ? "No account found. Register first."
        : e.code === "auth/wrong-password" ? "Incorrect password."
        : e.code === "auth/email-already-in-use" ? "Email already registered."
        : e.code === "auth/invalid-email" ? "Invalid email address."
        : e.message;
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  // Guest mode — skip Firebase
  function guestMode() {
    const guestName = "Guest";
    onLogin({ name: guestName, email: "guest@neuroaid.ai", uid: "guest", role: mode, isNew: false, profileComplete: true });
  }

  const inputStyle = {
    padding: "13px 16px", borderRadius: 12,
    border: `1px solid ${T.cardBorder}`, background: T.bg2,
    fontSize: 14, color: T.cream, outline: "none",
    fontFamily: "'DM Sans',sans-serif", width: "100%",
  };

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
          {/* Role toggle */}
          <div style={{ display: "flex", background: T.bg3, borderRadius: 50, padding: 4, marginBottom: 28, border: `1px solid ${T.cardBorder}` }}>
            {["user","doctor"].map(r => (
              <button key={r} onClick={() => setMode(r)} style={{ flex: 1, padding: "9px 0", borderRadius: 50, border: "none", background: mode === r ? T.red : "transparent", color: mode === r ? T.white : T.creamFaint, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s", boxShadow: mode === r ? `0 0 16px ${T.redGlow}` : "none" }}>
                {r === "user" ? "👤 Patient" : "🩺 Doctor"}
              </button>
            ))}
          </div>

          {/* Tab */}
          <div style={{ display: "flex", marginBottom: 24, borderBottom: `1px solid ${T.cardBorder}` }}>
            {["login","register"].map(t => (
              <button key={t} onClick={() => { setTab(t); setErr(""); }} style={{ flex: 1, padding: "8px 0", border: "none", background: "transparent", color: tab === t ? T.cream : T.creamFaint, fontWeight: tab === t ? 700 : 400, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", borderBottom: tab === t ? `2px solid ${T.red}` : "2px solid transparent", marginBottom: -1, transition: "all 0.2s", textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Name field always visible on register; also shown on login for context */}
            {tab === "register" && (
              <input
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                style={inputStyle}
              />
            )}
            <input
              placeholder="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Password"
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && go()}
              style={inputStyle}
            />
            {mode === "doctor" && tab === "register" && (
              <input
                placeholder="Medical License Number"
                value={license}
                onChange={e => setLicense(e.target.value)}
                style={inputStyle}
              />
            )}
            {tab === "register" && mode === "user" && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: T.creamFaint, fontSize: 12, marginBottom: 6, display: "block" }}>Age</label>
                <input type="number" min="18" max="100" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g. 45" style={{ padding: "13px 16px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: T.bg2, fontSize: 14, color: T.cream, outline: "none", width: "100%" }} />
              </div>
            )}

            {err && (
              <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.25)", borderRadius: 10, padding: "10px 14px", color: T.red, fontSize: 13 }}>
                {err}
              </div>
            )}

            <Btn onClick={go} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.6 : 1 }}>
              {loading ? "⏳ Please wait…" : tab === "login" ? "Sign In →" : "Create Account →"}
            </Btn>

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: T.cardBorder }} />
              <span style={{ color: T.creamFaint, fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: T.cardBorder }} />
            </div>

            <button onClick={guestMode} style={{ padding: "11px 16px", borderRadius: 12, border: `1px solid ${T.cardBorder}`, background: "transparent", color: T.creamDim, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s" }}>
              Try Guest Mode
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => setView("landing")} style={{ background: "none", border: "none", color: T.creamFaint, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Back to Home</button>
          </div>
        </DarkCard>
      </div>
    </div>
  );
}
