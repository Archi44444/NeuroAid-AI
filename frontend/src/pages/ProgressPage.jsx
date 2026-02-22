import { useEffect, useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, MiniChart } from "../components/RiskDashboard";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function BarChart({ data, labels, color }) {
  const max = Math.max(...data, 1);
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

export default function ProgressPage({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.uid || user.uid === "guest") return;
    setLoading(true);
    getDocs(query(
      collection(db, "assessments"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "asc")
    )).then(snap => {
      setHistory(snap.docs.map(d => d.data()));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user?.uid]);

  const hasData = history.length > 0;

  const labels = hasData
    ? history.map(h => {
        const d = new Date(h.createdAt);
        return `${d.getMonth()+1}/${d.getDate()}`;
      })
    : ["Sep","Oct","Nov","Dec","Jan","Feb"];

  const speechData   = hasData ? history.map(h => Math.round(h.speech_score   ?? 0)) : [62,65,68,70,72,74];
  const memoryData   = hasData ? history.map(h => Math.round(h.memory_score   ?? 0)) : [70,72,75,78,80,82];
  const reactionData = hasData ? history.map(h => Math.round(h.reaction_score ?? 0)) : [55,58,60,62,65,68];
  const overallData  = hasData ? history.map(h => {
    const vals = [h.speech_score, h.memory_score, h.reaction_score, h.executive_score, h.motor_score].filter(Boolean);
    return vals.length ? Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
  }) : [60,63,66,65,68,72];

  const trend = (arr) => {
    if (arr.length < 2) return "—";
    const diff = arr[arr.length-1] - arr[0];
    return diff > 0 ? `↑ +${diff} pts` : diff < 0 ? `↓ ${diff} pts` : "→ Stable";
  };
  const trendColor = (arr) => {
    if (arr.length < 2) return T.creamFaint;
    return arr[arr.length-1] >= arr[0] ? T.green : T.red;
  };

  const tracks = [
    { label: "Speech",   data: speechData,   color: T.red   },
    { label: "Memory",   data: memoryData,   color: T.green  },
    { label: "Reaction", data: reactionData, color: T.blue   },
  ];

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Progress Tracking</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>
          {hasData
            ? `${history.length} assessment${history.length > 1 ? "s" : ""} recorded · Longitudinal cognitive view`
            : "Complete assessments to track your cognitive progress over time"}
        </p>
      </div>

      {loading && (
        <div style={{ color: T.creamFaint, fontSize: 14, marginBottom: 24 }}>Loading your history…</div>
      )}

      {!loading && !hasData && (
        <DarkCard style={{ padding: 36, textAlign: "center", marginBottom: 24 }} hover={false}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📈</div>
          <div style={{ color: T.cream, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No assessment history yet</div>
          <p style={{ color: T.creamFaint, fontSize: 14 }}>Complete at least one assessment to see your cognitive trends here.</p>
        </DarkCard>
      )}

      {/* Overall trend */}
      {overallData.length > 1 && (
        <DarkCard style={{ padding: 28, marginBottom: 20 }} hover={false}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: T.cream, fontSize: 15 }}>Overall Cognitive Score</div>
            <span style={{ color: trendColor(overallData), fontSize: 13, fontWeight: 600 }}>{trend(overallData)}</span>
          </div>
          <MiniChart data={overallData} color={T.red} height={70} />
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
            {labels.map((l, i) => <span key={i} style={{ flex: 1, fontSize: 10, color: T.creamFaint, textAlign: "center" }}>{l}</span>)}
          </div>
        </DarkCard>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
        {tracks.map(t => (
          <DarkCard key={t.label} style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: T.cream, fontSize: 14 }}>{t.label}</div>
              <span style={{ color: trendColor(t.data), fontSize: 12, fontWeight: 600 }}>{trend(t.data)}</span>
            </div>
            <MiniChart data={t.data} color={t.color} height={55} />
          </DarkCard>
        ))}
      </div>

      <DarkCard style={{ padding: 28, marginBottom: 16 }} hover={false}>
        <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Speech — All Assessments</div>
        <BarChart data={speechData} labels={labels} color={T.red} />
      </DarkCard>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Memory Score</div>
          <BarChart data={memoryData} labels={labels} color={T.green} />
        </DarkCard>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Reaction Score</div>
          <BarChart data={reactionData} labels={labels} color={T.blue} />
        </DarkCard>
      </div>

      {/* Assessment history table */}
      {hasData && (
        <DarkCard style={{ padding: 28, marginTop: 20 }} hover={false}>
          <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 16 }}>Assessment History</div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr", gap: 0 }}>
            {["Date","Overall","Speech","Memory","Reaction","Risk"].map(h => (
              <div key={h} style={{ fontSize: 11, color: T.creamFaint, textTransform: "uppercase", letterSpacing: 0.8, padding: "8px 10px", borderBottom: `1px solid ${T.cardBorder}` }}>{h}</div>
            ))}
            {[...history].reverse().map((a, i) => {
              const overall = Math.round(([a.speech_score, a.memory_score, a.reaction_score, a.executive_score, a.motor_score].filter(Boolean).reduce((x,y)=>x+y,0)) / 5);
              const riskVals = Object.values(a.risk_levels || {});
              const risk = riskVals.includes("High") ? "High" : riskVals.includes("Moderate") ? "Moderate" : "Low";
              const riskC = risk === "Low" ? T.green : risk === "Moderate" ? T.amber : T.red;
              const date = new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <>
                  <div key={`${i}-d`} style={{ fontSize: 12, color: T.creamDim, padding: "10px 10px", borderBottom: `1px solid ${T.cardBorder}22` }}>{date}</div>
                  <div key={`${i}-o`} style={{ fontSize: 13, fontWeight: 700, color: T.cream, padding: "10px 10px", borderBottom: `1px solid ${T.cardBorder}22` }}>{overall}</div>
                  <div key={`${i}-s`} style={{ fontSize: 12, color: T.red, padding: "10px 10px", borderBottom: `1px solid ${T.cardBorder}22` }}>{Math.round(a.speech_score ?? 0)}</div>
                  <div key={`${i}-m`} style={{ fontSize: 12, color: T.green, padding: "10px 10px", borderBottom: `1px solid ${T.cardBorder}22` }}>{Math.round(a.memory_score ?? 0)}</div>
                  <div key={`${i}-r`} style={{ fontSize: 12, color: T.blue, padding: "10px 10px", borderBottom: `1px solid ${T.cardBorder}22` }}>{Math.round(a.reaction_score ?? 0)}</div>
                  <div key={`${i}-rk`} style={{ fontSize: 11, color: riskC, fontWeight: 700, padding: "10px 10px", borderBottom: `1px solid ${T.cardBorder}22` }}>{risk}</div>
                </>
              );
            })}
          </div>
        </DarkCard>
      )}
    </div>
  );
}
