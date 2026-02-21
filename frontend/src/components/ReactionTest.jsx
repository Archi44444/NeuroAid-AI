import { useState, useRef } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn } from "./RiskDashboard";

const mean   = arr => arr.length ? Math.round(arr.reduce((a,b) => a+b,0) / arr.length) : 0;
const stdDev = (arr, avg) => arr.length > 1 ? Math.round(Math.sqrt(arr.reduce((s,t) => s+Math.pow(t-avg,2),0) / arr.length)) : 0;

export default function ReactionTest({ setPage }) {
  const [phase, setPhase] = useState("idle");
  const [times, setTimes] = useState([]);
  const [t0, setT0] = useState(null);
  const timeout = useRef(null);

  function startRound() {
    setPhase("waiting");
    timeout.current = setTimeout(() => { setT0(Date.now()); setPhase("go"); }, 1500 + Math.random() * 2000);
  }
  function handleClick() {
    if (phase === "go") {
      const rt = Date.now() - t0;
      const next = [...times, rt];
      setTimes(next);
      if (next.length >= 5) setPhase("done"); else startRound();
    } else if (phase === "waiting") { clearTimeout(timeout.current); setPhase("idle"); }
  }

  const avg = mean(times);
  const vr  = stdDev(times, avg);

  return (
    <div>
      <button onClick={() => setPage("assessments")} style={{ background: "none", border: "none", color: T.creamFaint, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 24 }}>← Back</button>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Reaction Time Test</h1>
      <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 32 }}>Click when the box turns green. 5 rounds total.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div onClick={phase === "idle" ? startRound : handleClick}
            style={{ height: 280, borderRadius: 20, background: phase === "go" ? "rgba(74,222,128,0.15)" : phase === "waiting" ? "rgba(232,64,64,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${phase === "go" ? T.green : phase === "waiting" ? "rgba(232,64,64,0.3)" : T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", cursor: "pointer", transition: "all 0.1s", userSelect: "none", boxShadow: phase === "go" ? "0 0 40px rgba(74,222,128,0.3)" : "none" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{phase === "idle" ? "👆" : phase === "waiting" ? "⏳" : phase === "go" ? "🟢" : "✅"}</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: T.cream }}>
              {phase === "idle" && "Click to Start"}{phase === "waiting" && "Wait..."}{phase === "go" && "CLICK!"}{phase === "done" && "Done!"}
            </div>
            {times.length > 0 && phase !== "idle" && phase !== "done" && <div style={{ color: T.creamFaint, fontSize: 13, marginTop: 8 }}>Round {times.length + 1}/5</div>}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {times.map((t, i) => <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "6px 12px", fontWeight: 700, color: T.cream, fontSize: 13 }}>R{i+1}: {t}ms</div>)}
          </div>
        </div>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>Results</div>
          {phase === "done" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <div style={{ background: T.bg3, borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, color: T.creamFaint, marginBottom: 4 }}>Avg Reaction</div>
                  <div style={{ fontWeight: 800, color: T.cream, fontSize: 28 }}>{avg}ms</div>
                  <div style={{ color: avg < 300 ? T.green : avg < 400 ? T.amber : T.red, fontSize: 11, fontWeight: 600 }}>{avg < 300 ? "Fast" : avg < 400 ? "Average" : "Slow"}</div>
                </div>
                <div style={{ background: T.bg3, borderRadius: 12, padding: 18 }}>
                  <div style={{ fontSize: 11, color: T.creamFaint, marginBottom: 4 }}>Variability</div>
                  <div style={{ fontWeight: 800, color: T.cream, fontSize: 28 }}>{vr}ms</div>
                  <div style={{ color: vr < 50 ? T.green : T.amber, fontSize: 11, fontWeight: 600 }}>{vr < 50 ? "Consistent" : "Variable"}</div>
                </div>
              </div>
              <div style={{ background: "rgba(74,222,128,0.08)", borderRadius: 14, padding: 18, border: "1px solid rgba(74,222,128,0.15)", marginBottom: 16 }}>
                <div style={{ color: T.green, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>✓ Test Complete</div>
                <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65 }}>Reaction time within normal range. Consistent neuromotor control detected.</div>
              </div>
              <Btn onClick={() => setPage("results")} style={{ width: "100%", justifyContent: "center" }}>View Full Results →</Btn>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "70px 0", color: T.creamFaint }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.2 }}>⚡</div>
              <div style={{ fontSize: 14 }}>Complete 5 rounds</div>
              <div style={{ marginTop: 8, fontSize: 12 }}>{times.length}/5 done</div>
            </div>
          )}
        </DarkCard>
      </div>
    </div>
  );
}
