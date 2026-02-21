import { useState } from "react";
import { T } from "../../utils/helpers";

export default function DarkCard({ children, style = {}, hover = true, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{ background: T.card, border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : T.cardBorder}`, borderRadius: 20, transition: "all 0.25s", transform: hov ? "translateY(-3px)" : "none", boxShadow: hov ? "0 20px 60px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.3)", cursor: onClick ? "pointer" : "default", ...style }}
    >
      {children}
    </div>
  );
}
