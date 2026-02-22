import { useState, useRef } from "react";
import { T } from "../utils/theme";

export function Stars({ count = 60 }) {
  const stars = useRef(Array.from({ length: count }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    delay: Math.random() * 4, dur: Math.random() * 3 + 2,
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, borderRadius: "50%", background: T.cream, animation: `twinkle ${s.dur}s ${s.delay}s infinite` }} />
      ))}
    </div>
  );
}

export function DarkCard({ children, style = {}, hover = true, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{ background: T.card, border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : T.cardBorder}`, borderRadius: 20, transition: "all 0.25s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.3)", cursor: onClick ? "pointer" : "default", ...style }}>
      {children}
    </div>
  );
}

export function Btn({ children, variant = "primary", onClick, style = {}, small = false }) {
  const [hov, setHov] = useState(false);
  const v = {
    primary: { background: hov ? "#ff5252" : T.red, color: T.white, boxShadow: hov ? `0 8px 30px ${T.redGlow}` : `0 4px 16px ${T.redGlow}` },
    cream:   { background: hov ? T.white : T.cream, color: T.bg },
    ghost:   { background: hov ? "rgba(255,255,255,0.06)" : "transparent", color: T.creamDim, border: `1px solid ${hov ? "rgba(255,255,255,0.15)" : T.cardBorder}` },
  };
  return (
    <button onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ padding: small ? "8px 18px" : "12px 26px", borderRadius: 50, border: "none", fontWeight: 600, fontSize: small ? 13 : 14, cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans',sans-serif", letterSpacing: 0.2, ...(v[variant] || v.primary), ...style }}>
      {children}
    </button>
  );
}

export function Badge({ level }) {
  const m = {
    Low:      { bg: "rgba(74,222,128,0.12)",  color: T.green,   label: "Low Risk"      },
    Moderate: { bg: "rgba(245,158,11,0.12)",  color: T.amber,   label: "Moderate Risk" },
    High:     { bg: "rgba(232,64,64,0.15)",   color: "#ff7070", label: "High Risk"     },
  };
  const s = m[level] || m.Low;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />{s.label}
    </span>
  );
}

export function MiniChart({ data, color = T.red, height = 60 }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const w = 200, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`);
  const id = `gc${color.replace(/[^a-z0-9]/gi, "")}${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => { const x = (i / (data.length - 1)) * w, y = h - ((v - min) / range) * (h - 10) - 5; return i === data.length - 1 ? <circle key={i} cx={x} cy={y} r={4} fill={color} stroke={T.bg1} strokeWidth={2} /> : null; })}
    </svg>
  );
}

export function Sidebar({ role, page, setPage, setView, user }) {
  const uNav = [
    { id: "dashboard",   label: "Overview",      icon: "◈" },
    { id: "assessments", label: "Assessments",   icon: "◉" },
    { id: "speech",      label: "Speech Test",   icon: "◎" },
    { id: "memory",      label: "Memory Test",   icon: "⬡" },
    { id: "reaction",    label: "Reaction Test", icon: "◷" },
    { id: "stroop",      label: "Stroop Test",   icon: "◐" },
    { id: "tap",         label: "Motor Tap",     icon: "⬤" },
    { id: "results",     label: "Results",       icon: "◆" },
    { id: "progress",    label: "Progress",      icon: "↗" },
  ];
  const dNav = [
    { id: "doctor-dashboard", label: "Dashboard", icon: "◈" },
    { id: "patients",         label: "Patients",  icon: "◉" },
  ];
  const nav = role === "doctor" ? dNav : uNav;
  return (
    <div style={{ width: 220, minHeight: "100vh", background: T.bg1, borderRight: `1px solid ${T.cardBorder}`, display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100 }}>
      <div style={{ padding: "28px 24px 20px", borderBottom: `1px solid ${T.cardBorder}`, cursor: "pointer" }} onClick={() => setView("landing")}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: `0 0 16px ${T.redGlow}` }}>⬡</div>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, color: T.cream, letterSpacing: -0.5 }}>NeuroAid</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(item => {
          const a = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, border: "none", background: a ? "rgba(232,64,64,0.12)" : "transparent", color: a ? T.red : T.creamFaint, fontWeight: a ? 600 : 400, fontSize: 13.5, cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'DM Sans',sans-serif" }}>
              <span style={{ fontSize: 14, width: 18 }}>{item.icon}</span>{item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.cardBorder}` }}>
        {user?.name && (
          <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.white, flexShrink: 0 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, color: T.cream, fontWeight: 600 }}>{user.name}</div>
              {user.email && <div style={{ fontSize: 10, color: T.creamFaint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{user.email}</div>}
            </div>
          </div>
        )}
        <button onClick={() => setView("landing")} style={{ background: "transparent", border: "none", color: T.creamFaint, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>← Sign out</button>
      </div>
    </div>
  );
}

export function Shell({ role, page, setPage, setView, children, user }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg }}>
      <Sidebar role={role} page={page} setPage={setPage} setView={setView} user={user} />
      <main style={{ marginLeft: 220, flex: 1, padding: "40px 48px", maxWidth: "calc(100vw - 220px)", minHeight: "100vh" }}>{children}</main>
    </div>
  );
}
