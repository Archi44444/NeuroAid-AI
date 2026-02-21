import { T } from "../utils/theme";
import { DarkCard } from "../components/RiskDashboard";

export default function AssessmentHub({ setPage }) {
  const tests = [
    { id: "speech",   icon: "🎙️", title: "Speech Analysis", desc: "Read a passage aloud. AI measures speech rate, pauses, and linguistic patterns.", dur: "3 min", accent: T.red   },
    { id: "memory",   icon: "🧠", title: "Memory Test",      desc: "Study a word list, then recall as many as possible after a brief delay.",          dur: "3 min", accent: T.green },
    { id: "reaction", icon: "⚡", title: "Reaction Time",    desc: "Click when the color changes. Variability is the key neuromotor metric.",           dur: "2 min", accent: T.blue  },
  ];
  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Assessment Hub</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>Complete all three tests to generate your full cognitive score.</p>
      </div>
      <DarkCard style={{ padding: 20, marginBottom: 24 }} hover={false}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: T.creamDim, fontWeight: 600 }}>Session Progress</span>
          <span style={{ fontSize: 12, color: T.creamFaint }}>0 / 3 completed</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ height: "100%", width: "0%", background: `linear-gradient(90deg,${T.red},${T.green})`, borderRadius: 2 }} />
        </div>
      </DarkCard>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {tests.map(t => (
          <DarkCard key={t.id} style={{ padding: 28 }} onClick={() => setPage(t.id)}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${t.accent}18`, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>{t.icon}</div>
            <div style={{ fontWeight: 700, color: T.cream, fontSize: 17, marginBottom: 8 }}>{t.title}</div>
            <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65, marginBottom: 20 }}>{t.desc}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.cardBorder}`, paddingTop: 16 }}>
              <span style={{ fontSize: 12, color: T.creamFaint }}>⏱ {t.dur}</span>
              <span style={{ fontSize: 12, color: t.accent, fontWeight: 600 }}>Ready →</span>
            </div>
          </DarkCard>
        ))}
      </div>
    </div>
  );
}
