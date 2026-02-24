import { useState, useEffect } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Badge, MiniChart } from "../components/RiskDashboard";
import { getUser, getMyResults } from "../services/api";

const LIME = "#C8F135";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function UserDashboard({ setPage }) {
  const user      = getUser();
  const firstName = user?.full_name?.split(" ")[0] || "there";
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getMyResults()
      .then(r => setResults(r || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, []);

  const last    = results.length > 0 ? results[results.length - 1] : null;
  const hasData = !!last;

  const domains = hasData
    ? [
        { label: "Speech",    v: Math.round(last.speech_score),    color: T.red    },
        { label: "Memory",    v: Math.round(last.memory_score),    color: "#60a5fa" },
        { label: "Reaction",  v: Math.round(last.reaction_score),  color: "#f59e0b" },
        { label: "Executive", v: Math.round(last.executive_score), color: "#a78bfa" },
        { label: "Motor",     v: Math.round(last.motor_score),     color: LIME      },
      ]
    : [];

  const overallScore = hasData
    ? Math.round(domains.reduce((s, d) => s + d.v, 0) / domains.length)
    : null;

  // Chart history: last 7 overall scores
  const chartData = results.slice(-7).map(r =>
    Math.round([r.speech_score, r.memory_score, r.reaction_score, r.executive_score, r.motor_score]
      .reduce((a, b) => a + b, 0) / 5)
  );
  while (chartData.length < 7) chartData.unshift(null);

  const lastDate = last
    ? new Date(last.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const riskLevel = hasData
    ? (last.risk_levels?.alzheimers === "High" || last.risk_levels?.dementia === "High" || last.risk_levels?.parkinsons === "High"
        ? "High"
        : last.risk_levels?.alzheimers === "Moderate" || last.risk_levels?.dementia === "Moderate" || last.risk_levels?.parkinsons === "Moderate"
          ? "Moderate" : "Low")
    : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 36, position: "relative" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `rgba(200,241,53,0.10)`, border: `1px solid ${LIME}33`, borderRadius: 99, padding: "5px 14px", marginBottom: 14, fontSize: 11, fontWeight: 700, color: LIME, letterSpacing: 1.5, textTransform: "uppercase" }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: LIME, display: "inline-block", animation: "pulse-dot 2s infinite" }} />
          Cognitive Overview
        </div>
        <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: "clamp(28px,3.5vw,48px)", color: "#fff", letterSpacing: "-1.5px", lineHeight: 1.1, marginBottom: 8 }}>
          {greeting()}, <span style={{ color: LIME }}>{firstName}.</span>
        </h1>
        <p style={{ color: "#555", fontSize: 14, fontWeight: 500 }}>
          {hasData
            ? `Last assessment ${lastDate} · ${results.length} session${results.length > 1 ? "s" : ""} completed`
            : "No assessments yet — take your first test to see your results"}
        </p>
      </div>

      {loading ? (
        <div style={{ color: "#555", fontSize: 14, padding: 40, textAlign: "center" }}>Loading your results…</div>
      ) : !hasData ? (
        /* ── Empty state ── */
        <DarkCard style={{ padding: 56, textAlign: "center", border: `1px solid ${LIME}20` }} hover={false}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🧠</div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 24, color: "#fff", marginBottom: 10 }}>
            No assessments yet
          </div>
          <p style={{ color: "#555", fontSize: 14, maxWidth: 400, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Complete all 5 cognitive tests to get your personalized Alzheimer's, Dementia, and Parkinson's risk scores.
          </p>
          <Btn onClick={() => setPage("assessments")}>Start First Assessment →</Btn>
        </DarkCard>
      ) : (
        <>
          {/* Top row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

            {/* Score card */}
            <DarkCard style={{ padding: 36 }} hover={false}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontWeight: 700 }}>Overall Cognitive Score</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 20 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 100, color: "#fff", lineHeight: 1, letterSpacing: "-5px" }}>{overallScore}</span>
                <div style={{ paddingBottom: 18 }}>
                  {results.length >= 2 && (() => {
                    const prev = results[results.length - 2];
                    const prevScore = Math.round([prev.speech_score, prev.memory_score, prev.reaction_score, prev.executive_score, prev.motor_score].reduce((a, b) => a + b, 0) / 5);
                    const diff = overallScore - prevScore;
                    return diff !== 0 ? (
                      <>
                        <div style={{ color: diff > 0 ? LIME : T.red, fontSize: 14, fontWeight: 700 }}>{diff > 0 ? "↑" : "↓"} {Math.abs(diff)} pts</div>
                        <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>vs last session</div>
                      </>
                    ) : null;
                  })()}
                </div>
              </div>
              <Badge level={riskLevel} />
              <div style={{ marginTop: 24 }}>
                <MiniChart data={chartData.filter(Boolean)} color={LIME} height={60} />
              </div>
            </DarkCard>

            {/* Domain scores */}
            <DarkCard style={{ padding: 28 }} hover={false}>
              <div style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase", marginBottom: 24, fontWeight: 700 }}>Domain Scores</div>
              {domains.map(d => (
                <div key={d.label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>{d.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{d.v}</span>
                  </div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)" }}>
                    <div style={{ height: "100%", width: `${d.v}%`, background: d.color, borderRadius: 2, boxShadow: `0 0 10px ${d.color}55`, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </DarkCard>
          </div>

          {/* Disease Risk row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
            {[
              { key: "alzheimers", label: "Alzheimer's", icon: "🧩", color: "#a78bfa" },
              { key: "dementia",   label: "Dementia",    icon: "🌀", color: "#f59e0b" },
              { key: "parkinsons", label: "Parkinson's", icon: "🎯", color: "#60a5fa" },
            ].map(d => {
              const prob  = Math.round((last[`${d.key}_risk`] || 0) * 100);
              const level = last.risk_levels?.[d.key] || "Low";
              const lvlColor = level === "High" ? T.red : level === "Moderate" ? T.amber : T.green;
              return (
                <DarkCard key={d.key} style={{ padding: 22, border: `1px solid ${d.color}20` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{d.icon}</span>
                      <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{d.label}</span>
                    </div>
                    <span style={{ background: `${lvlColor}18`, color: lvlColor, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${lvlColor}33` }}>{level}</span>
                  </div>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 40, color: d.color, lineHeight: 1 }}>{prob}<span style={{ fontSize: 16, color: "#555" }}>%</span></div>
                  <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", marginTop: 12 }}>
                    <div style={{ height: "100%", width: `${prob}%`, background: d.color, borderRadius: 2 }} />
                  </div>
                </DarkCard>
              );
            })}
          </div>

          {/* CTA */}
          <DarkCard style={{ padding: 36, display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${LIME}28` }} hover={false}>
            <div>
              <div style={{ color: LIME, fontWeight: 700, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>● Ready for next session</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: "clamp(18px,2vw,26px)", color: "#fff", marginBottom: 6, letterSpacing: "-0.5px" }}>
                Take another cognitive assessment
              </div>
              <div style={{ color: "#555", fontSize: 13, fontWeight: 500 }}>~8 minutes · 5 tests · tracks changes over time</div>
            </div>
            <Btn onClick={() => setPage("assessments")} style={{ flexShrink: 0 }}>Begin Now →</Btn>
          </DarkCard>
        </>
      )}
    </div>
  );
}