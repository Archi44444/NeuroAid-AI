import { useState } from "react";
import { T } from "../../utils/helpers";

export default function Btn({ children, variant = "primary", onClick, style = {}, small = false }) {
  const [hov, setHov] = useState(false);
  const v = {
    primary: { background: hov ? "#ff5252" : T.red, color: T.white, boxShadow: hov ? `0 8px 30px ${T.redGlow}` : `0 4px 16px ${T.redGlow}` },
    cream: { background: hov ? T.white : T.cream, color: T.bg },
    ghost: { background: hov ? "rgba(255,255,255,0.06)" : "transparent", color: T.creamDim, border: `1px solid ${hov ? "rgba(255,255,255,0.15)" : T.cardBorder}` },
  };
  return (
    <button
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={onClick}
      style={{ padding: small ? "8px 18px" : "12px 26px", borderRadius: 50, border: "none", fontWeight: 600, fontSize: small ? 13 : 14, cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'DM Sans',sans-serif", letterSpacing: 0.2, ...(v[variant] || v.primary), ...style }}
    >
      {children}
    </button>
  );
}
