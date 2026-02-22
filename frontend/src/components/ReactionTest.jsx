import { useState, useRef } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn } from "./RiskDashboard";
import { useAssessment } from "../context/AssessmentContext";

const ROUNDS    = 7;    // more rounds = better drift measurement
const TIMEOUT_MS = 3000; // miss if no click within 3s of GREEN

const mean   = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
const stdDev = (arr, avg) => arr.length > 1 ? Math.sqrt(arr.reduce((s, t) => s + Math.pow(t - avg, 2), 0) / arr.length) : 0;

export default function ReactionTest({ setPage }) {
  const { setReactionData } = useAssessment();
  const [phase, setPhase] = useState("idle");
  const [times, setTimes] = useState([]);
  const [misses, setMisses] = useState(0);
  const [t0, setT0] = useState(null);
  const timeout = useRef(null);
  const missTimeout = useRef(null);

  function startRound() {
    setPhase("waiting");
    const delay = 1500 + Math.random() * 2500;
    timeout.current = setTimeout(() => {
      setT0(Date.now());
      setPhase("go");
      // Auto-miss if no response within TIMEOUT_MS
      missTimeout.current = setTimeout(() => {
        setMisses(m => m + 1);
        const total = times.length + 1;
        if (total >= ROUNDS) finishTest(times, misses + 1);
        else startRound();
      }, TIMEOUT_MS);
    }, delay);
  }

  function handleClick() {
    if (phase === "go") {
      clearTimeout(missTimeout.current);
      const rt   = Date.now() - t0;
      const next = [...times, rt];
      setTimes(next);
      if (next.length >= ROUNDS) finishTest(next, misses);
      else startRound();
    } else if (phase === "waiting") {
      clearTimeout(timeout.current);
      setPhase("idle"); // false start
    }
  }

  function finishTest(finalTimes, finalMisses) {
    setPhase("done");
    const arr  = finalTimes;
    if (!arr.length) return;

    const avg    = mean(arr);
    const sdv    = stdDev(arr, avg);
    const minRt  = Math.min(...arr);

    const half   = Math.floor(arr.length / 2);
    const drift  = half > 0 ? mean(arr.slice(half)) - mean(arr.slice(0, half)) : 0;

    setReactionData({
      times: arr,
      miss_count: finalMisses,
    });
  }

  const avg = Math.round(mean(times));
  const vr  = Math.round(stdDev(times, mean(times)));
  const drift = times.length >= 4
    ? Math.round(mean(times.slice(Math.floor(times.length / 2))) - mean(times.slice(0, Math.floor(times.length / 2))))
    : 0;

  return (
    <div>
      <button onClick={() => setPage("assessments")} style={{ background: "none", border: "none", color: T.creamFaint, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 24 }}>← Back</button>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Reaction Time Test</h1>
      <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 32 }}>Click when the box turns green. {ROUNDS} rounds — we measure speed, consistency, drift, and misses.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <div
            onClick={phase === "idle" ? startRound : handleClick}
            style={{ height: 280, borderRadius: 20, background: phase === "go" ? "rgba(74,222,128,0.15)" : phase === "waiting" ? "rgba(232,64,64,0.06)" : "rgba(255,255,255,0.03)", border: `1px solid ${phase === "go" ? T.green : phase === "waiting" ? "rgba(232,64,64,0.3)" : T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", cursor: "pointer", transition: "all 0.1s", userSelect: "none", boxShadow: phase === "go" ? "0 0 40px rgba(74,222,128,0.3)" : "none" }}
          >
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {phase === "idle" ? "👆" : phase === "waiting" ? "⏳" : phase === "go" ? "🟢" : "✅"}
            </div>
            <div style={{ fontWeight: 700, fontSize: 20, color: T.cream }}>
              {phase === "idle" && "Click to Start"}
              {phase === "waiting" && "Wait for GREEN…"}
              {phase === "go" && "CLICK NOW!"}
              {phase === "done" && "Test Complete!"}
            </div>
            {times.length > 0 && phase !== "idle" && phase !== "done" && (
              <div style={{ color: T.creamFaint, fontSize: 13, marginTop: 8 }}>Round {times.length + misses + 1}/{ROUNDS}</div>
            )}
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {times.map((t, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "6px 12px", fontWeight: 700, color: T.cream, fontSize: 13 }}>R{i + 1}: {t}ms</div>
            ))}
            {misses > 0 && <div style={{ background: "rgba(232,64,64,0.1)", border: `1px solid rgba(232,64,64,0.3)`, borderRadius: 8, padding: "6px 12px", color: T.red, fontSize: 13, fontWeight: 700 }}>✗ {misses} miss{misses > 1 ? "es" : ""}</div>}
          </div>
        </div>

        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>Results</div>
          {phase === "done" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Avg RT",       v: `${avg}ms`,   c: avg < 300 ? T.green : avg < 450 ? T.amber : T.red },
                  { label: "Variability",  v: `±${vr}ms`,   c: vr < 50 ? T.green : T.amber },
                  { label: "Fastest RT",   v: `${Math.min(...times)}ms`, c: T.green },
                  { label: "Fatigue Drift",v: `${drift > 0 ? "+" : ""}${drift}ms`, c: drift < 30 ? T.green : T.amber },
                  { label: "Misses",       v: misses,        c: misses === 0 ? T.green : T.red },
                  { label: "Attn. Index",  v: (vr / Math.max(avg, 1)).toFixed(3), c: T.cream },
                ].map(m => (
                  <div key={m.label} style={{ background: T.bg3, borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: T.creamFaint, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, color: m.c, fontSize: 20 }}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(74,222,128,0.08)", borderRadius: 14, padding: 18, border: "1px solid rgba(74,222,128,0.15)", marginBottom: 16 }}>
                <div style={{ color: T.green, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>✓ Reaction data captured</div>
                <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65 }}>5 reaction features extracted including drift and miss count.</div>
              </div>
              <Btn onClick={() => setPage("assessments")} style={{ width: "100%", justifyContent: "center" }}>← Back to Tests</Btn>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "70px 0", color: T.creamFaint }}>
              <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.2 }}>⚡</div>
              <div style={{ fontSize: 14 }}>Complete {ROUNDS} rounds</div>
              <div style={{ marginTop: 8, fontSize: 12 }}>{times.length + misses}/{ROUNDS} done</div>
            </div>
          )}
        </DarkCard>
      </div>
    </div>
  );
}
