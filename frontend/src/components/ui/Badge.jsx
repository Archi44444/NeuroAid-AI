import { T } from "../../utils/helpers";

export default function Badge({ level }) {
  const m = {
    Low: { bg: "rgba(74,222,128,0.12)", color: T.green, label: "Low Risk" },
    Moderate: { bg: "rgba(245,158,11,0.12)", color: T.amber, label: "Moderate Risk" },
    High: { bg: "rgba(232,64,64,0.15)", color: "#ff7070", label: "High Risk" },
  };
  const s = m[level] || m.Low;
  return (
    <span style={{ background: s.bg, color: s.color, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}
