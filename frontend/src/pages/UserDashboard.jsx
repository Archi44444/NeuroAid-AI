import { useEffect, useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Badge, MiniChart } from "../components/RiskDashboard";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAssessment } from "../context/AssessmentContext";

export default function UserDashboard({ setPage, user }) {
  const { apiResult } = useAssessment();
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const name = user?.name || user?.email?.split("@")[0] || "there";

  // Load assessment history from Firestore if user is logged in
  useEffect(() => {
    if (!user?.uid || user.uid === "guest") return;
    setLoadingHistory(true);
    getDocs(query(
      collection(db, "assessments"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    )).then(snap => {
      const items = snap.docs.map(d => d.data());
      setHistory(items);
    }).catch(() => {}).finally(() => setLoadingHistory(false));
  }, [user?.uid]);

  // Use live API result if available, otherwise last history entry, otherwise defaults
  const latest = apiResult || history[0] || null;

  const domains = latest ? [
    { label: "Speech",   v: Math.round(latest.speech_score   ?? 0), color: T.red   },
    { label: "Memory",   v: Math.round(latest.memory_score   ?? 0), color: T.green  },
    { label: "Reaction", v: Math.round(latest.reaction_score ?? 0), color: T.blue   },
  ] : [];

  const overallScore = latest
    ? Math.round(((latest.speech_score ?? 0) + (latest.memory_score ?? 0) + (latest.reaction_score ?? 0) + (latest.executive_score ?? 0) + (latest.motor_score ?? 0)) / 5)
    : null;

  // Build chart data from history
  const chartData = history.length > 0
    ? history.slice(0, 7).reverse().map(h => {
        const vals = [h.speech_score, h.memory_score, h.reaction_score, h.executive_score, h.motor_score].filter(Boolean);
        return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 60;
      })
    : [58, 61, 64, 60, 67, 70, overallScore ?? 74];

  const riskLevel = latest
    ? (latest.composite_risk_tier ||
      (Object.values(latest.risk_levels || {}).includes("High") ? "High"
      : Object.values(latest.risk_levels || {}).includes("Moderate") ? "Moderate" : "Low"))
    : null;

  function tierColor(tier) {
    return tier === "Low" ? T.green
      : tier === "Mild Concern" ? "#60a5fa"
      : tier === "Moderate Risk" || tier === "Moderate" ? T.amber
      : T.red;
  }

  const lastDate = history[0]?.createdAt
    ? new Date(history[0].createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>
          Hello, {name} 👋
        </h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>
          {lastDate
            ? `Last assessment ${lastDate} · Data updates after each test`
            : "Welcome! Complete your first assessment to see your cognitive baseline."}
        </p>
      </div>

      {/* No data yet — CTA */}
      {!latest && (
        <DarkCard style={{ padding: 40, marginBottom: 24, textAlign: "center", background: "linear-gradient(135deg,#1a0a0a,#100e0e)", border: "1px solid rgba(232,64,64,0.2)" }} hover={false}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, color: T.cream, marginBottom: 8 }}>No assessments yet</div>
          <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 24, maxWidth: 380, margin: "0 auto 24px" }}>
            Complete your first cognitive assessment to see your personalized scores, risk levels, and brain health trend.
          </p>
          <Btn onClick={() => setPage("assessments")}>Begin First Assessment →</Btn>
        </DarkCard>
      )}

      {latest && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <DarkCard style={{ padding: 36 }} hover={false}>
              <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Overall Cognitive Score</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 16 }}>
                <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 88, color: T.cream, lineHeight: 1 }}>{overallScore}</span>
                <div style={{ paddingBottom: 14 }}>
                  {history.length > 1 && (() => {
                    const prev = history[1];
                    const prevScore = Math.round(((prev.speech_score ?? 0) + (prev.memory_score ?? 0) + (prev.reaction_score ?? 0) + (prev.executive_score ?? 0) + (prev.motor_score ?? 0)) / 5);
                    const diff = overallScore - prevScore;
                    return (
                      <>
                        <div style={{ color: diff >= 0 ? T.green : T.red, fontSize: 13, fontWeight: 600 }}>{diff >= 0 ? "↑" : "↓"} {Math.abs(diff)} pts</div>
                        <div style={{ color: T.creamFaint, fontSize: 11 }}>vs last assessment</div>
                      </>
                    );
                  })()}
                </div>
              </div>
              {riskLevel && (
            <span style={{ background: `${tierColor(riskLevel)}18`, color: tierColor(riskLevel), padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${tierColor(riskLevel)}33`, display: "inline-block" }}>
              {riskLevel}
              {latest?.age_normalized && <span style={{ marginLeft: 6, opacity: 0.7 }}>· Age-adj.</span>}
            </span>
          )}
              <div style={{ marginTop: 20 }}><MiniChart data={chartData} color={T.red} height={60} /></div>
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
              { icon: "🎙️", label: "Speech Rate",   val: latest.feature_vector?.wpm ? `${Math.round(latest.feature_vector.wpm)} wpm` : `${Math.round(latest.speech_score ?? 0)}/100`,   sub: "From last test", c: T.green },
              { icon: "⏱️", label: "Avg Reaction",  val: latest.feature_vector?.mean_rt ? `${Math.round(latest.feature_vector.mean_rt)} ms` : `${Math.round(latest.reaction_score ?? 0)}/100`,  sub: "From last test", c: T.green },
              { icon: "📋", label: "Memory Score",   val: `${Math.round(latest.memory_score ?? 0)}/100`, sub: `${riskLevel ?? "—"} Risk`,  c: riskLevel === "Low" ? T.green : riskLevel === "Moderate" ? T.amber : T.red },
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
        </>
      )}

      <DarkCard style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(135deg,#1a0a0a,#100e0e)", border: "1px solid rgba(232,64,64,0.2)" }} hover={false}>
        <div>
          <div style={{ color: T.red, fontWeight: 600, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{latest ? "Take Another" : "Start Now"}</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, color: T.cream, marginBottom: 4 }}>
            {latest ? "Your weekly cognitive check is ready" : "Begin your baseline assessment"}
          </div>
          <div style={{ color: T.creamFaint, fontSize: 13 }}>~8 minutes · 5 tests · AI analysis</div>
        </div>
        <Btn onClick={() => setPage("assessments")}>Begin Now →</Btn>
      </DarkCard>
    </div>
  );
}
