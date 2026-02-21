import { T } from "../utils/theme";
import { DarkCard, Btn, Badge, MiniChart } from "../components/RiskDashboard";

export default function UserDashboard({ setPage }) {
  const domains = [
    { label: "Speech",   v: 74, color: T.red   },
    { label: "Memory",   v: 82, color: T.green  },
    { label: "Reaction", v: 68, color: T.blue   },
  ];
  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Good morning, Alex</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>Last assessment Feb 14, 2026 · Next recommended Feb 21</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <DarkCard style={{ padding: 36 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Overall Cognitive Score</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
            <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 88, color: T.cream, lineHeight: 1 }}>74</span>
            <div style={{ paddingBottom: 14 }}>
              <div style={{ color: T.green, fontSize: 13, fontWeight: 600 }}>↑ 4 pts</div>
              <div style={{ color: T.creamFaint, fontSize: 11 }}>vs last month</div>
            </div>
          </div>
          <Badge level="Low" />
          <div style={{ marginTop: 20 }}><MiniChart data={[58,61,64,60,67,70,74]} color={T.red} height={60} /></div>
        </DarkCard>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 20 }}>Domain Scores</div>
          {domains.map(d => (
            <div key={d.label} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <span style={{ fontSize: 13, color: T.creamDim }}>{d.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.cream }}>{d.v}</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                <div style={{ height: "100%", width: `${d.v}%`, background: d.color, borderRadius: 2, boxShadow: `0 0 8px ${d.color}44` }} />
              </div>
            </div>
          ))}
        </DarkCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
        {[
          { icon: "🎙️", label: "Speech Rate",    val: "142 wpm", sub: "Normal",      c: T.green },
          { icon: "⏱️", label: "Avg Reaction",   val: "284 ms",  sub: "Within norm", c: T.green },
          { icon: "📋", label: "Words Recalled",  val: "9/12",    sub: "75%",         c: T.amber },
        ].map(s => (
          <DarkCard key={s.label} style={{ padding: 22 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.05)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `1px solid ${T.cardBorder}` }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 11, color: T.creamFaint, marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontWeight: 700, color: T.cream, fontSize: 18 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: s.c, fontWeight: 600 }}>{s.sub}</div>
              </div>
            </div>
          </DarkCard>
        ))}
      </div>
      <DarkCard style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#1a0a0a,#100e0e)", border: "1px solid rgba(232,64,64,0.2)" }} hover={false}>
        <div>
          <div style={{ color: T.red, fontWeight: 600, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Assessment Due</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.cream, marginBottom: 4 }}>Your weekly cognitive check is ready</div>
          <div style={{ color: T.creamFaint, fontSize: 13 }}>~8 minutes · 3 simple tests</div>
        </div>
        <Btn onClick={() => setPage("assessments")}>Begin Now →</Btn>
      </DarkCard>
    </div>
  );
}
