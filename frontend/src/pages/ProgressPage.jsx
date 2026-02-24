import { useState, useEffect } from "react";
import { T } from "../utils/theme";
import { DarkCard, MiniChart } from "../components/RiskDashboard";
import { getMyResults } from "../services/api";

const LIME = "#C8F135";

function BarChart({ data, labels, color }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
      {data.map((v, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <div style={{ fontSize: 10, color: T.creamFaint, marginBottom: 4 }}>{v}</div>
          <div style={{ width: "100%", height: `${(v / max) * 70}px`, background: `linear-gradient(180deg,${color}cc,${color}44)`, borderRadius: "4px 4px 0 0" }} />
          <div style={{ fontSize: 9, color: T.creamFaint, marginTop: 4, maxWidth: 36, textAlign: "center", lineHeight: 1.2 }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyResults()
      .then(r => setResults(r || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ color: "#555", fontSize: 14, padding: 60, textAlign: "center" }}>Loading progress…</div>
  );

  if (results.length === 0) return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Progress Tracking</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>Track your cognitive scores over time</p>
      </div>
      <DarkCard style={{ padding: 56, textAlign: "center" }} hover={false}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>📈</div>
        <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 22, color: "#fff", marginBottom: 10 }}>No history yet</div>
        <p style={{ color: "#555", fontSize: 14, maxWidth: 380, margin: "0 auto", lineHeight: 1.7 }}>
          Complete at least one assessment to start tracking your progress. Your scores will appear here as a chart over time.
        </p>
      </DarkCard>
    </div>
  );

  // Build chart data from results (up to last 8 sessions)
  const sessions = results.slice(-8);
  const labels = sessions.map(r =>
    new Date(r.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  const speechData   = sessions.map(r => Math.round(r.speech_score));
  const memoryData   = sessions.map(r => Math.round(r.memory_score));
  const reactionData = sessions.map(r => Math.round(r.reaction_score));
  const execData     = sessions.map(r => Math.round(r.executive_score));
  const motorData    = sessions.map(r => Math.round(r.motor_score));
  const overallData  = sessions.map(r =>
    Math.round([r.speech_score, r.memory_score, r.reaction_score, r.executive_score, r.motor_score]
      .reduce((a, b) => a + b, 0) / 5)
  );

  const last = results[results.length - 1];
  const trendOf = (arr) => arr.length >= 2 ? arr[arr.length-1] - arr[arr.length-2] : 0;

  const tracks = [
    { label: "Speech",    data: speechData,   color: T.red,    trend: trendOf(speechData)   },
    { label: "Memory",    data: memoryData,   color: T.green,  trend: trendOf(memoryData)   },
    { label: "Reaction",  data: reactionData, color: T.blue,   trend: trendOf(reactionData) },
    { label: "Executive", data: execData,     color: "#a78bfa",trend: trendOf(execData)      },
    { label: "Motor",     data: motorData,    color: T.amber,  trend: trendOf(motorData)    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Progress Tracking</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>{results.length} session{results.length > 1 ? "s" : ""} completed · showing last {sessions.length}</p>
      </div>

      {/* Mini trend cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
        {tracks.map(t => (
          <DarkCard key={t.label} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
              <div style={{ fontWeight: 700, color: T.cream, fontSize: 13 }}>{t.label}</div>
              <span style={{ color: t.trend > 0 ? T.green : t.trend < 0 ? T.red : "#555", fontSize: 11, fontWeight: 700 }}>
                {t.trend > 0 ? `↑ ${t.trend}` : t.trend < 0 ? `↓ ${Math.abs(t.trend)}` : "—"}
              </span>
            </div>
            <div style={{ fontWeight: 900, color: t.color, fontSize: 28, marginBottom: 8 }}>{t.data[t.data.length-1]}</div>
            <MiniChart data={t.data} color={t.color} height={40} />
          </DarkCard>
        ))}
      </div>

      {/* Overall score chart */}
      <DarkCard style={{ padding: 28, marginBottom: 16 }} hover={false}>
        <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Overall Cognitive Score — All Sessions</div>
        <BarChart data={overallData} labels={labels} color={LIME} />
      </DarkCard>

      {/* Domain charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Speech & Memory</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>Speech</div>
            <BarChart data={speechData} labels={labels} color={T.red} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>Memory</div>
            <BarChart data={memoryData} labels={labels} color={T.green} />
          </div>
        </DarkCard>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Reaction, Executive & Motor</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>Reaction</div>
            <BarChart data={reactionData} labels={labels} color={T.blue} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>Executive</div>
            <BarChart data={execData} labels={labels} color="#a78bfa" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>Motor</div>
            <BarChart data={motorData} labels={labels} color={T.amber} />
          </div>
        </DarkCard>
      </div>

      {/* Disease risk history */}
      <DarkCard style={{ padding: 28 }} hover={false}>
        <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 20 }}>Disease Risk History — Latest Session</div>
        {[
          { key: "alzheimers", label: "Alzheimer's", color: "#a78bfa" },
          { key: "dementia",   label: "Dementia",    color: T.amber   },
          { key: "parkinsons", label: "Parkinson's", color: T.blue    },
        ].map(d => {
          const prob  = Math.round((last[`${d.key}_risk`] || 0) * 100);
          const level = last.risk_levels?.[d.key] || "Low";
          const lvlColor = level === "High" ? T.red : level === "Moderate" ? T.amber : T.green;
          return (
            <div key={d.key} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                <span style={{ fontSize: 14, color: T.cream, fontWeight: 600 }}>{d.label}</span>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ background: `${lvlColor}18`, color: lvlColor, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${lvlColor}33` }}>{level}</span>
                  <span style={{ fontWeight: 900, color: d.color, fontSize: 16 }}>{prob}%</span>
                </div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.07)" }}>
                <div style={{ height: "100%", width: `${prob}%`, background: d.color, borderRadius: 3, transition: "width 1s ease" }} />
              </div>
            </div>
          );
        })}
      </DarkCard>
    </div>
  );
}