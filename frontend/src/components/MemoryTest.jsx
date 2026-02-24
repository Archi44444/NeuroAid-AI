/**
 * MemoryTest — Fixed v3
 *
 * Bugs fixed:
 * 1. STALE CLOSURE: submitResult() called from useEffect timer captured
 *    selected=[] (initial state). Fixed by mirroring selected in selectedRef
 *    so the timer callback always reads the live value.
 * 2. ALL_WORDS shuffled at module level — moved inside component so each
 *    mount gets a fresh shuffle, preventing stale ordering.
 */
import { useState, useEffect, useRef } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Badge } from "./RiskDashboard";
import { useAssessment } from "../context/AssessmentContext";

const TARGET_WORDS = ["River","Apple","Clock","Bridge","Music","Cloud","Forest","Candle","Mirror","Stone"];
const DISTRACTORS  = ["Glass","Lantern","Copper","Flame","Arrow","Desert"];

function shuffled(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MemoryTest({ setPage }) {
  const { setMemoryData } = useAssessment();
  const [phase,    setPhase]    = useState("study");
  const [selected, setSelected] = useState([]);
  const [timer,    setTimer]    = useState(30);

  // ── Live refs — always hold current value inside async callbacks ──────────
  const selectedRef    = useRef([]);   // mirrors selected state
  const recallStartRef = useRef(null);
  const firstClickRef  = useRef(null);

  // Shuffle words once per mount
  const allWordsRef = useRef(shuffled([...TARGET_WORDS, ...DISTRACTORS]));

  // Keep selectedRef in sync
  function setSelectedSync(next) {
    selectedRef.current = next;
    setSelected(next);
  }

  useEffect(() => {
    if (phase === "result") return;
    const iv = setInterval(() => setTimer(t => {
      if (t <= 1) {
        clearInterval(iv);
        if (phase === "study") {
          setPhase("distract");
          setTimer(10);
        } else if (phase === "distract") {
          setPhase("recall");
          setTimer(60);
          recallStartRef.current = Date.now();
        } else if (phase === "recall") {
          // Use ref — not stale state
          submitResultWithSelected(selectedRef.current);
        }
        return 0;
      }
      return t - 1;
    }), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  function toggle(w) {
    if (!firstClickRef.current) firstClickRef.current = Date.now();
    const next = selected.includes(w)
      ? selected.filter(x => x !== w)
      : [...selected, w];
    setSelectedSync(next);
  }

  function submitResult() {
    submitResultWithSelected(selectedRef.current);
  }

  function submitResultWithSelected(currentSelected) {
    const latency = recallStartRef.current
      ? ((firstClickRef.current || Date.now()) - recallStartRef.current) / 1000
      : 5.0;

    const correctSet     = new Set(TARGET_WORDS);
    const hits           = currentSelected.filter(w => correctSet.has(w));
    const intrusions     = currentSelected.filter(w => !correctSet.has(w));
    const recalledTarget = currentSelected.filter(w => correctSet.has(w));

    let orderMatches = 0;
    for (let i = 0; i < recalledTarget.length - 1; i++) {
      if (TARGET_WORDS.indexOf(recalledTarget[i]) < TARGET_WORDS.indexOf(recalledTarget[i + 1])) {
        orderMatches++;
      }
    }
    const orderRatio = recalledTarget.length > 1
      ? orderMatches / (recalledTarget.length - 1)
      : 1.0;

    const accuracy = (hits.length / TARGET_WORDS.length) * 100;

    const payload = {
      word_recall_accuracy:    parseFloat(accuracy.toFixed(2)),
      pattern_accuracy:        parseFloat(accuracy.toFixed(2)),
      delayed_recall_accuracy: parseFloat(accuracy.toFixed(2)),
      recall_latency_seconds:  parseFloat(Math.max(latency, 0.5).toFixed(2)),
      order_match_ratio:       parseFloat(orderRatio.toFixed(3)),
      intrusion_count:         intrusions.length,
    };

    console.log("[MemoryTest] payload:", payload);
    setMemoryData(payload);
    setPhase("result");
  }

  const correctCount   = selected.filter(w => TARGET_WORDS.includes(w)).length;
  const intrusionCount = selected.filter(w => !TARGET_WORDS.includes(w)).length;

  return (
    <div>
      <button onClick={() => setPage("assessments")} style={{ background: "none", border: "none", color: T.creamFaint, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 24 }}>← Back</button>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Memory Test</h1>
      <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 32 }}>Study words → brief distractor → recall. We measure accuracy, latency, order, and errors.</p>

      <DarkCard style={{ padding: 32 }} hover={false}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontWeight: 600, color: T.cream, fontSize: 16 }}>
            {phase === "study"    && `📖 Memorize these ${TARGET_WORDS.length} words`}
            {phase === "distract" && "🔢 Quick distractor: count backwards from 50"}
            {phase === "recall"   && "🧠 Select the words you remember"}
            {phase === "result"   && "✅ Results"}
          </div>
          {phase !== "result" && (
            <div style={{ background: phase === "recall" ? "rgba(232,64,64,0.15)" : T.bg3, color: phase === "recall" ? T.red : T.cream, fontWeight: 700, fontSize: 20, padding: "8px 20px", borderRadius: 12, border: `1px solid ${phase === "recall" ? "rgba(232,64,64,0.3)" : T.cardBorder}` }}>
              {timer}s
            </div>
          )}
        </div>

        {phase === "study" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {TARGET_WORDS.map(w => (
              <div key={w} style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, color: T.cream, padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14 }}>{w}</div>
            ))}
          </div>
        )}

        {phase === "distract" && (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.creamFaint }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔢</div>
            <div style={{ fontSize: 18, color: T.cream }}>Count backwards from 50 by 3s</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>50… 47… 44… 41…</div>
          </div>
        )}

        {phase === "recall" && (
          <>
            <p style={{ color: T.creamFaint, fontSize: 13, marginBottom: 16 }}>Select ALL words from the original list (including distractors — choose carefully).</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
              {allWordsRef.current.map(w => {
                const sel = selected.includes(w);
                return (
                  <button key={w} onClick={() => toggle(w)} style={{ background: sel ? T.red : "rgba(255,255,255,0.04)", color: sel ? T.white : T.creamDim, border: `1px solid ${sel ? T.red : T.cardBorder}`, padding: "10px 18px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", boxShadow: sel ? `0 0 16px ${T.redGlow}` : "none" }}>{w}</button>
                );
              })}
            </div>
            <Btn onClick={submitResult}>Submit →</Btn>
          </>
        )}

        {phase === "result" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 80, color: T.cream, lineHeight: 1 }}>
              {correctCount}<span style={{ fontSize: 32, color: T.creamFaint }}>/{TARGET_WORDS.length}</span>
            </div>
            <div style={{ color: T.creamFaint, fontSize: 16, margin: "12px 0 20px" }}>Words Recalled</div>
            <Badge level={correctCount >= 8 ? "Low" : correctCount >= 5 ? "Moderate" : "High"} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "24px 0", textAlign: "left" }}>
              {[
                { label: "Correct",          v: `${correctCount}/${TARGET_WORDS.length}`, c: T.green },
                { label: "Intrusion Errors", v: intrusionCount,                           c: intrusionCount === 0 ? T.green : T.amber },
                { label: "Recall Latency",   v: `~${firstClickRef.current ? Math.round((firstClickRef.current - recallStartRef.current) / 1000) : "?"}s`, c: T.cream },
                { label: "Accuracy",         v: `${Math.round((correctCount / TARGET_WORDS.length) * 100)}%`, c: T.green },
              ].map(m => (
                <div key={m.label} style={{ background: T.bg3, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 11, color: T.creamFaint, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontWeight: 700, color: m.c, fontSize: 22 }}>{m.v}</div>
                </div>
              ))}
            </div>
            <Btn onClick={() => setPage("assessments")}>← Back to Tests</Btn>
          </div>
        )}
      </DarkCard>
    </div>
  );
}
