import { T } from "../utils/theme";
import { DarkCard, MiniChart } from "../components/RiskDashboard";

function BarChart({ data, labels, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
      {data.map((v, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div style={{ fontSize: 10, color: T.creamFaint, marginBottom: 4 }}>{v}</div>
          <div style={{ width: "100%", height: `${(v/max)*70}px`, background: `linear-gradient(180deg,${color}cc,${color}44)`, borderRadius: "4px 4px 0 0" }} />
          <div style={{ fontSize: 10, color: T.creamFaint, marginTop: 4 }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const months = ["Sep","Oct","Nov","Dec","Jan","Feb"];
  const tracks = [
    { label: "Speech",   data: [62,65,68,70,72,74], color: T.red,   trend: "↑ Improving" },
    { label: "Memory",   data: [70,72,75,78,80,82], color: T.green, trend: "↑ Improving" },
    { label: "Reaction", data: [55,58,60,62,65,68], color: T.blue,  trend: "↑ Improving" },
  ];
  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Progress Tracking</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>6-month longitudinal view of your cognitive scores</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
        {tracks.map(t => (
          <DarkCard key={t.label} style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: T.cream, fontSize: 14 }}>{t.label}</div>
              <span style={{ color: T.green, fontSize: 12, fontWeight: 600 }}>{t.trend}</span>
            </div>
            <MiniChart data={t.data} color={t.color} height={55} />
          </DarkCard>
        ))}
      </div>
      <DarkCard style={{ padding: 28, marginBottom: 16 }} hover={false}>
        <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Speech — 6 Months</div>
        <BarChart data={[62,65,68,70,72,74]} labels={months} color={T.red} />
      </DarkCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Memory Score</div>
          <BarChart data={[70,72,75,78,80,82]} labels={months} color={T.green} />
        </DarkCard>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Reaction Score</div>
          <BarChart data={[55,58,60,62,65,68]} labels={months} color={T.blue} />
        </DarkCard>
      </div>
    </div>
  );
}
