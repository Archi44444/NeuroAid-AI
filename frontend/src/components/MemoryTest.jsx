import { useState, useEffect, useRef } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Badge } from "./RiskDashboard";

const WORDS = ["River","Apple","Clock","Bridge","Music","Cloud","Forest","Candle","Mirror","Stone","Glass","Lantern"];

export default function MemoryTest({ setPage }) {
  const [phase, setPhase] = useState("study");
  const [selected, setSelected] = useState([]);
  const [timer, setTimer] = useState(30);
  const opts = useRef([...WORDS].sort(() => Math.random() - 0.5)).current;

  useEffect(() => {
    if (phase === "result") return;
    const iv = setInterval(() => setTimer(t => {
      if (t <= 1) {
        clearInterval(iv);
        if (phase === "study") { setPhase("recall"); setTimer(60); }
        else setPhase("result");
        return 0;
      }
      return t - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const toggle = w => setSelected(p => p.includes(w) ? p.filter(x => x !== w) : [...p, w]);
  const correct = selected.filter(w => WORDS.slice(0,10).includes(w)).length;

  return (
    <div>
      <button onClick={() => setPage("assessments")} style={{ background: "none", border: "none", color: T.creamFaint, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 24 }}>← Back</button>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Memory Test</h1>
      <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 32 }}>Study the words, then recall as many as you can.</p>
      <DarkCard style={{ padding: 32 }} hover={false}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: T.cream, fontSize: 16 }}>
            {phase === "study" ? "Memorize these words" : phase === "recall" ? "Select the words you remember" : "Results"}
          </div>
          {phase !== "result" && (
            <div style={{ background: phase === "recall" ? "rgba(232,64,64,0.15)" : T.bg3, color: phase === "recall" ? T.red : T.cream, fontWeight: 700, fontSize: 20, padding: "8px 20px", borderRadius: 12, border: `1px solid ${phase === "recall" ? "rgba(232,64,64,0.3)" : T.cardBorder}` }}>{timer}s</div>
          )}
        </div>
        {phase === "study" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {WORDS.map(w => <div key={w} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, color: T.cream, padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>{w}</div>)}
          </div>
        )}
        {phase === "recall" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {opts.map(w => { const sel = selected.includes(w); return (
                <button key={w} onClick={() => toggle(w)} style={{ background: sel ? T.red : "rgba(255,255,255,0.04)", color: sel ? T.white : T.creamDim, border: `1px solid ${sel ? T.red : T.cardBorder}`, padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", boxShadow: sel ? `0 0 16px ${T.redGlow}` : "none" }}>{w}</button>
              ); })}
            </div>
            <Btn onClick={() => setPhase("result")}>Submit →</Btn>
          </>
        )}
        {phase === "result" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 80, color: T.cream, lineHeight: 1 }}>{correct}<span style={{ fontSize: 32, color: T.creamFaint }}>/10</span></div>
            <div style={{ color: T.creamFaint, fontSize: 16, margin: "12px 0 20px" }}>Words Recalled</div>
            <Badge level={correct >= 8 ? "Low" : correct >= 5 ? "Moderate" : "High"} />
            <div style={{ background: T.bg3, borderRadius: 14, padding: 20, margin: "24px 0", textAlign: "left" }}>
              <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.7 }}>Memory score: <strong style={{ color: T.cream }}>{Math.round((correct/10)*100)}%</strong> — {correct >= 8 ? "Excellent recall." : correct >= 5 ? "Average. Mild decline possible." : "Below average. Further evaluation recommended."}</div>
            </div>
            <Btn onClick={() => setPage("results")}>View Full Results →</Btn>
          </div>
        )}
      </DarkCard>
    </div>
  );
}
