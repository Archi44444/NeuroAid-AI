import { useState, useRef, useEffect } from "react";
import { T } from "../utils/theme";

const LIME = "#C8F135";

// ── Stars (tiny twinkling dots) ───────────────────────────────────────────────
export function Stars({ count = 40 }) {
  const stars = useRef(Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.6 + 0.4,
    delay: Math.random() * 5, dur: Math.random() * 3 + 2,
    color: i % 10 === 0 ? "rgba(200,241,53,0.80)"
         : i % 8  === 0 ? "rgba(96,165,250,0.65)"
         : "rgba(255,255,255,0.70)",
  }))).current;
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {stars.map((s, i) => (
        <div key={i} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, borderRadius:"50%", background:s.color, animation:`twinkle ${s.dur}s ${s.delay}s infinite` }} />
      ))}
    </div>
  );
}

// ── DarkCard — dark glass card with lime bottom-right glow ────────────────────
export function DarkCard({ children, style = {}, hover = true, onClick, limeGlow = false }) {
  const [hov, setHov] = useState(false);
  const active = hover && hov;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: "rgba(10,12,10,0.90)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        border: `1px solid ${active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.09)"}`,
        borderRadius: 20,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        transform: active ? "translateY(-4px)" : "none",
        boxShadow: active
          ? `0 28px 72px rgba(0,0,0,0.65), 0 0 40px ${LIME}18, inset 0 1px 0 rgba(255,255,255,0.10)`
          : `0 8px 36px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.06)`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {/* Top-left white shine */}
      <div style={{ position:"absolute", top:0, left:"8%", right:"8%", height:1, background:`linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)`, pointerEvents:"none", zIndex:1 }} />
      {/* Lime glow — bottom right corner, always on */}
      <div style={{
        position:"absolute", bottom:0, right:0,
        width:"75%", height:"60%",
        background:`radial-gradient(ellipse 80% 80% at 85% 110%, ${LIME}2A 0%, ${LIME}10 30%, transparent 70%)`,
        pointerEvents:"none", zIndex:1,
        opacity: active ? 1.0 : 0.7,
        transition:"opacity 0.3s",
      }} />
      {/* Bottom fade */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40, background:"linear-gradient(to top,rgba(0,0,0,0.15),transparent)", pointerEvents:"none", zIndex:1 }} />
      {children}
    </div>
  );
}

// ── Btn ───────────────────────────────────────────────────────────────────────
export function Btn({ children, variant = "primary", onClick, style = {}, small = false, disabled = false }) {
  const [hov, setHov] = useState(false);

  const variants = {
    primary: {
      background: hov ? "#d4ff40" : LIME,
      color: "#080808",
      border: "none",
      boxShadow: hov
        ? `0 12px 36px ${LIME}60, 0 0 60px ${LIME}20, inset 0 1px 0 rgba(255,255,255,0.24)`
        : `0 6px 20px ${LIME}38, inset 0 1px 0 rgba(255,255,255,0.18)`,
    },
    cream: {
      background: hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
      color: T.cream,
      border: "1px solid rgba(255,255,255,0.20)",
      boxShadow: hov ? "0 6px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)" : "inset 0 1px 0 rgba(255,255,255,0.08)",
    },
    ghost: {
      background: hov ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
      color: hov ? T.cream : T.creamDim,
      border: `1px solid ${hov ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)"}`,
      boxShadow: hov ? "0 4px 20px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
    },
    red: {
      background: hov ? "linear-gradient(135deg,rgba(255,82,82,0.97),rgba(220,38,38,1))" : "linear-gradient(135deg,rgba(232,64,64,0.90),rgba(200,36,36,0.96))",
      color: "#fff",
      border: "1px solid rgba(255,100,100,0.30)",
      boxShadow: hov
        ? "0 12px 36px rgba(232,64,64,0.50), inset 0 1px 0 rgba(255,255,255,0.22)"
        : "0 6px 20px rgba(232,64,64,0.30), inset 0 1px 0 rgba(255,255,255,0.15)",
    },
  };

  const v = variants[variant] || variants.primary;
  return (
    <button
      onMouseEnter={() => !disabled && setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={!disabled ? onClick : undefined}
      style={{
        padding: small ? "8px 18px" : "11px 24px",
        borderRadius: 50, fontWeight: 700,
        fontSize: small ? 13 : 14,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.22s ease",
        display: "inline-flex", alignItems: "center", gap: 8,
        fontFamily: "'DM Sans',sans-serif", letterSpacing: 0.2,
        backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        opacity: disabled ? 0.45 : 1,
        transform: hov && !disabled ? "translateY(-2px)" : "none",
        ...v, ...style,
      }}
    >{children}</button>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ level }) {
  const m = {
    Low:      { bg:`rgba(200,241,53,0.12)`,  border:`rgba(200,241,53,0.30)`, color:LIME,        label:"Low Risk"      },
    Moderate: { bg:"rgba(245,158,11,0.10)",  border:"rgba(245,158,11,0.28)", color:T.amber,     label:"Moderate Risk" },
    High:     { bg:"rgba(232,64,64,0.12)",   border:"rgba(232,64,64,0.28)",  color:"#ff7070",   label:"High Risk"     },
  };
  const s = m[level] || m.Low;
  return (
    <span style={{
      background:s.bg, color:s.color, padding:"4px 12px", borderRadius:20,
      fontSize:11, fontWeight:700, letterSpacing:0.8,
      display:"inline-flex", alignItems:"center", gap:6,
      border:`1px solid ${s.border}`,
      backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
    }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.color, display:"inline-block", animation:"pulse-dot 2s infinite" }} />
      {s.label}
    </span>
  );
}

// ── MiniChart ─────────────────────────────────────────────────────────────────
export function MiniChart({ data, color = LIME, height = 60 }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const w = 200, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`);
  const id = `gc${color.replace(/[^a-z0-9]/gi,"")}${h}`;
  const glowId = `glow${color.replace(/[^a-z0-9]/gi,"")}${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow:"visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <polygon points={`0,${h} ${pts.join(" ")} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" filter={`url(#${glowId})`} />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 10) - 5;
        return i === data.length - 1 ? (
          <g key={i}>
            <circle cx={x} cy={y} r={7} fill={color} opacity="0.22" />
            <circle cx={x} cy={y} r={4} fill={color} stroke="rgba(8,8,8,0.9)" strokeWidth={2} />
          </g>
        ) : null;
      })}
    </svg>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export function Sidebar({ role, page, setPage, setView, onLogout }) {
  const storedUser = (() => { try { const u = sessionStorage.getItem("neuroaid_user"); return u ? JSON.parse(u) : null; } catch(e) { return null; } })();
  const displayName = storedUser?.full_name || (role === "doctor" ? "Doctor" : "Patient");
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    import("../services/api").then(({ getUnreadCount }) => {
      getUnreadCount().then(n => setUnread(n || 0)).catch(() => {});
      const iv = setInterval(() => getUnreadCount().then(n => setUnread(n||0)).catch(()=>{}), 8000);
      return () => clearInterval(iv);
    });
  }, []);

  const uNav = [
    { id:"dashboard",   label:"Overview",      icon:"◈" },
    { id:"assessments", label:"Assessments",   icon:"◉" },
    { id:"speech",      label:"Speech Test",   icon:"◎" },
    { id:"memory",      label:"Memory Test",   icon:"⬡" },
    { id:"reaction",    label:"Reaction Test", icon:"◷" },
    { id:"stroop",      label:"Stroop Test",   icon:"◐" },
    { id:"tap",         label:"Motor Tap",     icon:"⬤" },
    { id:"results",     label:"Results",       icon:"◆" },
    { id:"progress",    label:"Progress",      icon:"↗" },
    { id:"messages",    label:"Messages",      icon:"✉", badge: unread },
  ];
  const dNav = [
    { id:"doctor-dashboard", label:"Dashboard", icon:"◈" },
    { id:"patients",         label:"Patients",  icon:"◉" },
    { id:"messages",         label:"Messages",  icon:"✉", badge: unread },
    { id:"content",          label:"Content",   icon:"✎" },
  ];
  const nav = role === "doctor" ? dNav : uNav;

  return (
    <div style={{
      width:220, minHeight:"100vh",
      background:"rgba(4,5,4,0.95)",
      backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)",
      borderRight:`1px solid rgba(255,255,255,0.07)`,
      display:"flex", flexDirection:"column",
      position:"fixed", left:0, top:0, bottom:0, zIndex:100,
      boxShadow:`6px 0 40px rgba(0,0,0,0.60)`,
      backgroundImage:`linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`,
      backgroundSize:"60px 60px",
      overflow:"hidden",
    }}>
      {/* Lime glow bottom of sidebar */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"35%", background:`radial-gradient(ellipse 120% 60% at 50% 120%, ${LIME}1A 0%, transparent 70%)`, pointerEvents:"none" }} />

      {/* Logo — clicking refreshes dashboard, does NOT log out */}
      <div style={{ padding:"28px 22px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", cursor:"pointer", position:"relative", zIndex:2 }}
        onClick={() => setPage(role === "doctor" ? "doctor-dashboard" : "dashboard")}
        title="Go to dashboard">
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:9, background:`linear-gradient(135deg,${LIME},#9ABF28)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#080808", boxShadow:`0 0 16px ${LIME}44` }}>N</div>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:900, fontSize:18, color:"#fff", letterSpacing:-0.5 }}>NeuroAid</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"14px 10px", display:"flex", flexDirection:"column", gap:2, position:"relative", zIndex:2 }}>
        {nav.map(item => {
          const a = page === item.id;
          const hasBadge = item.badge && item.badge > 0;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
              borderRadius:12, border:a ? `1px solid ${LIME}33` : "1px solid transparent",
              background:a ? `rgba(200,241,53,0.10)` : "transparent",
              color:a ? LIME : "#555",
              fontWeight:a ? 700 : 400, fontSize:13.5, cursor:"pointer",
              textAlign:"left", transition:"all 0.15s",
              fontFamily:"'DM Sans',sans-serif",
              boxShadow:a ? `0 0 20px ${LIME}12` : "none",
            }}>
              <span style={{ fontSize:14, width:18 }}>{item.icon}</span>{item.label}
            </button>
          );
        })}
      </nav>

      <div style={{ padding:"16px 22px", borderTop:"1px solid rgba(255,255,255,0.05)", position:"relative", zIndex:2 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:`rgba(200,241,53,0.15)`, border:`1px solid ${LIME}44`, display:"flex", alignItems:"center", justifyContent:"center", color:LIME, fontWeight:700, fontSize:12, flexShrink:0 }}>{initials}</div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ fontSize:13, color:"#fff", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{displayName}</div>
            <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:1 }}>{role === "doctor" ? "Doctor" : "Patient"}</div>
          </div>
        </div>
        <button onClick={() => onLogout ? onLogout() : setView("landing")} style={{ background:"transparent", border:"none", color:"#444", fontSize:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"color 0.2s" }}
          onMouseEnter={e => e.target.style.color = LIME}
          onMouseLeave={e => e.target.style.color = "#444"}
        >← Sign out</button>
      </div>
    </div>
  );
}

// ── Ghost text watermark ──────────────────────────────────────────────────────
function GhostText({ text, style = {} }) {
  return (
    <div style={{
      position:"absolute", fontFamily:"'DM Sans',sans-serif", fontWeight:900,
      fontSize:"clamp(80px,12vw,160px)", lineHeight:1,
      color:"rgba(255,255,255,0.032)", letterSpacing:"-4px",
      userSelect:"none", pointerEvents:"none", whiteSpace:"nowrap",
      animation:"ghost-drift 6s ease-in-out infinite",
      ...style,
    }}>{text}</div>
  );
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export function Shell({ role, page, setPage, setView, children, onLogout }) {
  // Map page to ghost label
  const ghostLabels = {
    dashboard:        "OVERVIEW",
    assessments:      "ASSESS",
    speech:           "SPEECH",
    memory:           "MEMORY",
    reaction:         "REACT",
    stroop:           "STROOP",
    tap:              "MOTOR",
    results:          "RESULTS",
    progress:         "PROGRESS",
    "doctor-dashboard":"DOCTOR",
    patients:         "PATIENTS",
  };
  const ghost = ghostLabels[page] || "NEURO";

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#080808" }}>
      <Sidebar role={role} page={page} setPage={setPage} setView={setView} onLogout={onLogout} />
      <main style={{
        marginLeft:220, flex:1, padding:"40px 48px",
        maxWidth:"calc(100vw - 220px)", minHeight:"100vh",
        position:"relative", overflow:"hidden",
        backgroundImage:`linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)`,
        backgroundSize:"80px 80px",
        backgroundAttachment:"fixed",
      }}>
        {/* Ghost watermark text */}
        <GhostText text={ghost} style={{ top:-20, right:-20, zIndex:0 }} />
        {/* Lime glow bottom-right of content area */}
        <div style={{
          position:"fixed", bottom:0, right:0,
          width:500, height:400,
          background:`radial-gradient(ellipse 80% 70% at 100% 100%, ${LIME}12 0%, ${LIME}06 35%, transparent 70%)`,
          pointerEvents:"none", zIndex:0,
        }} />
        <div style={{ position:"relative", zIndex:2 }}>
          {children}
        </div>
      </main>
    </div>
  );
}