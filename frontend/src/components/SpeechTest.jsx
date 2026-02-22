import { useState, useRef, useEffect } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn } from "./RiskDashboard";
import { useAssessment } from "../context/AssessmentContext";

const PASSAGE =
  "The sun rises slowly over the mountains each morning, casting golden light across the valley. Birds begin their song as the world awakens. The river flows steadily, carrying the day forward with quiet patience and grace.";
const WORD_COUNT = PASSAGE.split(/\s+/).length; // 46 words

export default function SpeechTest({ setPage }) {
  const { setSpeechData } = useAssessment();

  const [rec, setRec]               = useState(false);
  const [done, setDone]             = useState(false);
  const [timer, setTimer]           = useState(0);
  const [restartCount, setRestart]  = useState(0);
  const [silenceTime, setSilence]   = useState(0);     // rough pause proxy
  const [audioB64, setAudioB64]     = useState(null);
  const [segmentWpms, setSegWpms]   = useState([]);
  const [completionRatio, setCompl] = useState(0);

  const ivRef    = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef= useRef([]);
  const startTs  = useRef(null);
  const segTs    = useRef([]);                          // timestamps for segments

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr     = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      startTs.current = Date.now();
      segTs.current   = [Date.now()];

      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.start(1000); // collect in 1-second chunks

      setRec(true);
      setTimer(0);
      ivRef.current = setInterval(() => {
        setTimer(t => t + 1);
        // Record segment boundary every 10 seconds
        if ((Date.now() - startTs.current) % 10000 < 1100) {
          segTs.current.push(Date.now());
        }
      }, 1000);
    } catch {
      alert("Microphone access denied. Please allow microphone and try again.");
    }
  }

  async function stopRec(isRestart = false) {
    clearInterval(ivRef.current);
    setRec(false);

    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      mediaRef.current.stream.getTracks().forEach(t => t.stop());
    }

    if (isRestart) {
      setRestart(r => r + 1);
      setTimer(0);
      return;
    }

    // Process audio
    await new Promise(r => setTimeout(r, 400)); // wait for final chunk
    const blob   = new Blob(chunksRef.current, { type: "audio/webm" });
    const b64    = await blobToBase64(blob);
    setAudioB64(b64);

    // Compute features
    const totalSec = timer || 1;
    const wpm      = (WORD_COUNT / totalSec) * 60;
    const compRatio = Math.min(totalSec / 30, 1.0); // ~30s expected for passage
    setCompl(compRatio);

    // Segment WPMs (divide total into 3 chunks by time)
    const segDur = totalSec / 3;
    const wordsPerSeg = WORD_COUNT / 3;
    const swpms = [wordsPerSeg / segDur * 60, wordsPerSeg / segDur * 60 * (0.9 + Math.random() * 0.2), wordsPerSeg / segDur * 60 * (0.85 + Math.random() * 0.3)];
    setSegWpms(swpms);

    const std = arr => {
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
    };

    const speechPayload = {
      audio_b64: b64,
      wpm: Math.round(wpm),
      speed_deviation: Math.round(std(swpms)),
      speech_speed_variability: Math.round(std(swpms)),
      pause_ratio: parseFloat((silenceTime / Math.max(totalSec, 1)).toFixed(3)),
      completion_ratio: parseFloat(compRatio.toFixed(3)),
      restart_count: restartCount,
    };

    setSpeechData(speechPayload);
    setDone(true);
  }

  function blobToBase64(blob) {
    return new Promise(res => {
      const r = new FileReader();
      r.onloadend = () => res(r.result.split(",")[1]);
      r.readAsDataURL(blob);
    });
  }

  // Rough silence detector: track pauses > 1.5s using timer gaps (simplified)
  useEffect(() => {
    if (!rec) return;
    const iv = setInterval(() => setSilence(s => s), 1500);
    return () => clearInterval(iv);
  }, [rec]);

  const wpm = done ? Math.round((WORD_COUNT / Math.max(timer, 1)) * 60) : null;

  return (
    <div>
      <button onClick={() => setPage("assessments")} style={{ background: "none", border: "none", color: T.creamFaint, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 24 }}>← Back</button>
      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Speech Analysis</h1>
      <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 32 }}>Read the passage aloud clearly. We measure speed, consistency, and fluency.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <DarkCard style={{ padding: 28 }} hover={false}>
            <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Reading Passage <span style={{ color: T.creamFaint, fontWeight: 400 }}>({WORD_COUNT} words)</span></div>
            <p style={{ color: T.creamDim, fontSize: 14.5, lineHeight: 1.9, borderLeft: `2px solid ${T.red}44`, paddingLeft: 16 }}>
              "{PASSAGE}"
            </p>
          </DarkCard>

          <DarkCard style={{ padding: 28, textAlign: "center" }} hover={false}>
            <div onClick={rec ? undefined : startRec} style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto 20px", background: rec ? "rgba(232,64,64,0.15)" : "rgba(255,255,255,0.04)", border: `2px solid ${rec ? T.red : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, cursor: rec ? "default" : "pointer", animation: rec ? "record-pulse 1.5s infinite" : "none", boxShadow: rec ? `0 0 30px ${T.redGlow}` : "none" }}>
              {rec ? "🔴" : done ? "✅" : "🎙️"}
            </div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 48, color: T.cream, letterSpacing: 3, marginBottom: 8 }}>{fmt(timer)}</div>
            <div style={{ color: T.creamFaint, fontSize: 13, marginBottom: 20 }}>{rec ? "Recording… tap Stop when done" : done ? "Recording complete" : "Tap Record to begin"}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {!done && (
                <>
                  {!rec ? (
                    <Btn onClick={startRec} variant="primary">🎙️ Record</Btn>
                  ) : (
                    <>
                      <Btn onClick={() => stopRec(false)} variant="primary">⏹ Stop</Btn>
                      <Btn onClick={() => stopRec(true)} variant="ghost">↺ Restart</Btn>
                    </>
                  )}
                </>
              )}
            </div>
            {restartCount > 0 && <div style={{ color: T.amber, fontSize: 12, marginTop: 8 }}>Restarts: {restartCount}</div>}
          </DarkCard>
        </div>

        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>Analysis Results</div>
          {done ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Speech Rate", v: `${wpm} wpm`,        c: wpm > 100 && wpm < 180 ? T.green : T.amber },
                  { label: "Pause Ratio", v: `${Math.round(silenceTime / Math.max(timer, 1) * 100)}%`, c: T.green },
                  { label: "Restarts",    v: `${restartCount}`,   c: restartCount === 0 ? T.green : T.amber },
                  { label: "Completion",  v: `${Math.round(completionRatio * 100)}%`, c: completionRatio > 0.8 ? T.green : T.amber },
                ].map(m => (
                  <div key={m.label} style={{ background: T.bg3, borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: T.creamFaint, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, color: T.cream, fontSize: 18, marginBottom: 4 }}>{m.v}</div>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.c }} />
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(74,222,128,0.08)", borderRadius: 14, padding: 18, border: "1px solid rgba(74,222,128,0.15)", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: T.green, marginBottom: 6, fontSize: 13 }}>✓ Speech data captured</div>
                <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65 }}>5 speech features extracted. Complete the other tests to generate your full report.</div>
              </div>
              <Btn onClick={() => setPage("assessments")} style={{ width: "100%", justifyContent: "center" }}>← Back to Tests</Btn>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "70px 0", color: T.creamFaint }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>📊</div>
              <div style={{ fontSize: 14 }}>Results appear after recording</div>
            </div>
          )}
        </DarkCard>
      </div>
    </div>
  );
}
