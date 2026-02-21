import { useState, useRef } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn } from "./RiskDashboard";

export default function SpeechTest({ setPage }) {
  const [rec, setRec] = useState(false);
  const [done, setDone] = useState(false);
  const [timer, setTimer] = useState(0);
  const iv = useRef(null);

  function start() { setRec(true); iv.current = setInterval(() => setTimer(t => t + 1), 1000); }
  function stop()  { setRec(false); clearInterval(iv.current); setTimeout(() => setDone(true), 400); }
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  return (
    <div>
      <button onClick={() => setPage("assessments")} style={{ background: "none", border: "none", color: T.creamFaint, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 24 }}>← Back</button>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Speech Analysis</h1>
      <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 32 }}>Read the passage aloud clearly. AI analyzes your speech patterns.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DarkCard style={{ padding: 28 }} hover={false}>
            <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Reading Passage</div>
            <p style={{ color: T.creamDim, fontSize: 14.5, lineHeight: 1.9, borderLeft: `2px solid ${T.red}44`, paddingLeft: 16 }}>
              "The sun rises slowly over the mountains each morning, casting golden light across the valley. Birds begin their song as the world awakens. The river flows steadily, carrying the day forward with quiet patience and grace."
            </p>
          </DarkCard>
          <DarkCard style={{ padding: 28, textAlign: "center" }} hover={false}>
            <div onClick={rec ? stop : start} style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 20px", background: rec ? "rgba(232,64,64,0.15)" : "rgba(255,255,255,0.04)", border: `2px solid ${rec ? T.red : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, cursor: "pointer", animation: rec ? "record-pulse 1.5s infinite" : "none", boxShadow: rec ? `0 0 30px ${T.redGlow}` : "none" }}>
              {rec ? "⏹" : "🎙️"}
            </div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 48, color: T.cream, letterSpacing: 3, marginBottom: 8 }}>{fmt(timer)}</div>
            <div style={{ color: T.creamFaint, fontSize: 13, marginBottom: 20 }}>{rec ? "Recording... tap to stop" : "Tap microphone to start"}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Btn onClick={rec ? stop : start} variant={rec ? "ghost" : "primary"}>{rec ? "⏹ Stop" : "🎙️ Record"}</Btn>
              <Btn variant="ghost">📁 Upload</Btn>
            </div>
          </DarkCard>
        </div>
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>Analysis Results</div>
          {done ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[{ label: "Speech Rate", v: "142 wpm", c: T.green }, { label: "Pause Freq.", v: "0.8/min", c: T.green }, { label: "Filler Words", v: "3 found", c: T.amber }, { label: "Fluency", v: "87/100", c: T.green }].map(m => (
                  <div key={m.label} style={{ background: T.bg3, borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: T.creamFaint, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, color: T.cream, fontSize: 18, marginBottom: 4 }}>{m.v}</div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.c }} />
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(74,222,128,0.08)", borderRadius: 14, padding: 18, border: "1px solid rgba(74,222,128,0.15)", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: T.green, marginBottom: 6, fontSize: 13 }}>✓ Low Risk Interpretation</div>
                <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65 }}>Speech patterns consistent with normal cognitive function. No significant pausing anomalies detected.</div>
              </div>
              <Btn onClick={() => setPage("results")} style={{ width: "100%", justifyContent: "center" }}>View Full Results →</Btn>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "70px 0", color: T.creamFaint }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>📊</div>
              <div style={{ fontSize: 14 }}>Results appear after analysis</div>
            </div>
          )}
        </DarkCard>
      </div>
    </div>
  );
}
