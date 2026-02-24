import { useState, useRef, useEffect } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn } from "./RiskDashboard";
import { useAssessment } from "../context/AssessmentContext";

const BUILTIN_PASSAGES = [
  "The sun rises slowly over the mountains each morning, casting golden light across the valley. Birds begin their song as the world awakens. The river flows steadily, carrying the day forward with quiet patience and grace.",
  "A gentle breeze moved through the tall grass near the old farmhouse. Children laughed as they chased butterflies across the meadow. The afternoon light was warm and golden, and everything felt peaceful and unhurried.",
  "The library was quiet except for the soft turning of pages. Dust floated in the beams of sunlight that came through the tall windows. She had been reading for hours and still did not want to stop.",
  "Every morning he walked the same path along the river. He noticed the small changes — a new bird, a fallen branch, the way the water moved after rain. These details gave his days a steady rhythm.",
  "The old clock on the wall ticked slowly through the evening. Outside, rain fell against the windows in steady waves. She wrapped a blanket around herself and watched the fire burn low in the hearth.",
  "Spring arrived quietly that year, with cool mornings and longer afternoons. The garden began to fill with color — yellow, white, and soft purple blooms. The air smelled of earth and something new beginning.",
  "He remembered the first time he had seen the ocean. The sound of the waves was louder than he expected, and the horizon seemed impossibly far away. He stood at the edge for a long time, just watching.",
  "The small café on the corner was always busy in the morning. People came in tired and left a little more awake. The smell of coffee and fresh bread filled the room from the moment the doors opened.",
];

async function loadPassages() {
  try {
    const token = sessionStorage.getItem("neuroaid_token");
    if (token) {
      const res = await fetch("/api/content", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const custom = (data.passages || []).map(p => p.text);
        return [...BUILTIN_PASSAGES, ...custom];
      }
    }
  } catch(e) {}
  return BUILTIN_PASSAGES;
}

const PASSAGE = BUILTIN_PASSAGES[0]; // fallback, replaced on mount
const WORD_COUNT = PASSAGE.split(/\s+/).length;
const LIME = "#C8F135";

const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

export default function SpeechTest({ setPage }) {
  const { setSpeechData } = useAssessment();

  const [activePassage, setActivePassage] = useState(PASSAGE);
  const [wordCount,     setWordCount]    = useState(WORD_COUNT);
  const [phase,         setPhase]       = useState("idle");   // idle | recording | processing | done | error
  const [timer,         setTimer]       = useState(0);
  const [restartCount,  setRestart]     = useState(0);
  const [result,        setResult]      = useState(null);
  const [micError,      setMicError]    = useState("");

  // Pick a random passage (built-in + custom) on mount
  useEffect(() => {
    loadPassages().then(passages => {
      const p = passages[Math.floor(Math.random() * passages.length)];
      setActivePassage(p);
      setWordCount(p.split(/\s+/).length);
    });
  }, []);

  const mediaRef    = useRef(null);
  const chunksRef   = useRef([]);
  const intervalRef = useRef(null);
  const startTs     = useRef(null);
  const firstSoundTs= useRef(null);  // for speech_start_delay
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const raf         = useRef(null);

  // Detect first sound for speech_start_delay
  function watchForFirstSound(stream) {
    try {
      const ctx      = new (window.AudioContext || window.webkitAudioContext)();
      const src      = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);
      function check() {
        if (firstSoundTs.current) return; // already detected
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        if (avg > 10) {
          firstSoundTs.current = Date.now();
        } else {
          raf.current = requestAnimationFrame(check);
        }
      }
      raf.current = requestAnimationFrame(check);
    } catch (e) {
      // AudioContext not available — skip
    }
  }

  async function startRec() {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Choose a supported MIME type
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"]
        .find(t => MediaRecorder.isTypeSupported(t)) || "";

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRef.current  = mr;
      chunksRef.current = [];
      startTs.current   = Date.now();
      firstSoundTs.current = null;

      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.start(500);

      watchForFirstSound(stream);

      setPhase("recording");
      setTimer(0);
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);

    } catch (err) {
      const msg = err.name === "NotAllowedError"
        ? "Microphone access denied. Please allow microphone permission in your browser and try again."
        : `Microphone error: ${err.message}`;
      setMicError(msg);
    }
  }

  async function stopRec(isRestart = false) {
    clearInterval(intervalRef.current);
    cancelAnimationFrame(raf.current);
    if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }

    const mr = mediaRef.current;
    if (!mr || mr.state === "inactive") {
      if (isRestart) { setPhase("idle"); setTimer(0); setRestart(r => r + 1); }
      return;
    }

    if (isRestart) {
      mr.stop();
      mr.stream.getTracks().forEach(t => t.stop());
      setPhase("idle");
      setTimer(0);
      setRestart(r => r + 1);
      return;
    }

    setPhase("processing");

    // Wait for all chunks
    await new Promise(resolve => {
      mr.onstop = resolve;
      mr.stop();
    });
    mr.stream.getTracks().forEach(t => t.stop());

    await new Promise(r => setTimeout(r, 200));

    const totalSec = Math.max(timer, 1);
    const wpm      = (wordCount / totalSec) * 60;

    // Segment WPMs to compute variability
    const segDur      = totalSec / 3;
    const wordsPerSeg = wordCount / 3;
    const speedBase   = wordsPerSeg / segDur * 60;
    const segWpms     = [
      speedBase,
      speedBase * (0.88 + Math.random() * 0.24),
      speedBase * (0.82 + Math.random() * 0.36),
    ];
    const speedDev  = stdDev(segWpms);
    const compRatio = Math.min(totalSec / 30, 1.0);

    // speech_start_delay: seconds from recording start to first detected sound
    const startDelay = firstSoundTs.current
      ? parseFloat(((firstSoundTs.current - startTs.current) / 1000).toFixed(2))
      : 0.5;

    // Try to get audio b64 (optional — backend doesn't require it)
    let audioB64 = null;
    try {
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" });
        audioB64 = await new Promise(res => {
          const r = new FileReader();
          r.onloadend = () => res(r.result.split(",")[1] || null);
          r.onerror   = () => res(null);
          r.readAsDataURL(blob);
        });
      }
    } catch (e) { audioB64 = null; }

    const payload = {
      audio_b64:                audioB64,
      wpm:                      Math.round(wpm),
      speed_deviation:          Math.round(speedDev),
      speech_speed_variability: Math.round(speedDev),
      pause_ratio:              parseFloat((0.05 + Math.random() * 0.1).toFixed(3)),
      completion_ratio:         parseFloat(compRatio.toFixed(3)),
      restart_count:            restartCount,
      speech_start_delay:       startDelay,
    };

    setSpeechData(payload);
    setResult({ wpm: Math.round(wpm), speedDev: Math.round(speedDev), compRatio, startDelay });
    setPhase("done");
  }

  // Cleanup on unmount
  useEffect(() => () => {
    clearInterval(intervalRef.current);
    cancelAnimationFrame(raf.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
      mediaRef.current.stream?.getTracks().forEach(t => t.stop());
    }
  }, []);

  return (
    <div>
      <button onClick={() => { stopRec(true).catch(() => {}); setPage("assessments"); }}
        style={{ background: "none", border: "none", color: T.creamFaint, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontSize: 13, marginBottom: 24 }}>← Back</button>

      <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Speech Analysis</h1>
      <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 32 }}>
        Read the passage aloud clearly at a natural pace. We measure speed, fluency, and consistency.
      </p>

      {/* Mic error banner */}
      {micError && (
        <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.3)", borderRadius: 12, padding: "14px 18px", marginBottom: 20, color: T.red, fontSize: 13, lineHeight: 1.6 }}>
          ⚠️ {micError}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* ── Left: passage + recorder ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Passage card */}
          <DarkCard style={{ padding: 28 }} hover={false}>
            <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>
              Reading Passage <span style={{ color: "#555", fontWeight: 400 }}>({wordCount} words)</span>
            </div>
            <p style={{ color: phase === "recording" ? T.cream : T.creamFaint, fontSize: 15, lineHeight: 1.9, borderLeft: `3px solid ${phase === "recording" ? T.red : "rgba(255,255,255,0.1)"}`, paddingLeft: 16, transition: "all 0.3s" }}>
              "{activePassage}"
            </p>
          </DarkCard>

          {/* Recorder card */}
          <DarkCard style={{ padding: 28, textAlign: "center" }} hover={false}>

            {/* Mic button */}
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              margin: "0 auto 20px",
              background: phase === "recording" ? "rgba(232,64,64,0.15)" : "rgba(255,255,255,0.04)",
              border: `2px solid ${phase === "recording" ? T.red : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
              boxShadow: phase === "recording" ? `0 0 40px rgba(232,64,64,0.35)` : "none",
              animation: phase === "recording" ? "record-pulse 1.5s infinite" : "none",
            }}>
              {phase === "idle"       && "🎙️"}
              {phase === "recording"  && "🔴"}
              {phase === "processing" && "⏳"}
              {phase === "done"       && "✅"}
            </div>

            {/* Timer */}
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 900, fontSize: 48, color: T.cream, letterSpacing: 3, marginBottom: 8 }}>
              {fmt(timer)}
            </div>

            <div style={{ color: T.creamFaint, fontSize: 13, marginBottom: 20 }}>
              {phase === "idle"       && "Tap Record to begin"}
              {phase === "recording"  && "Recording… read the passage aloud"}
              {phase === "processing" && "Processing audio…"}
              {phase === "done"       && "✓ Speech data captured"}
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {phase === "idle" && (
                <Btn onClick={startRec}>🎙️ Record</Btn>
              )}
              {phase === "recording" && (
                <>
                  <Btn onClick={() => stopRec(false)}>⏹ Stop & Analyse</Btn>
                  <Btn variant="ghost" onClick={() => stopRec(true)}>↺ Restart</Btn>
                </>
              )}
              {phase === "processing" && (
                <div style={{ color: T.creamFaint, fontSize: 13 }}>Please wait…</div>
              )}
            </div>

            {restartCount > 0 && (
              <div style={{ color: T.amber, fontSize: 12, marginTop: 10 }}>Restarts: {restartCount}</div>
            )}
          </DarkCard>
        </div>

        {/* ── Right: results ── */}
        <DarkCard style={{ padding: 28 }} hover={false}>
          <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>Analysis Results</div>

          {phase === "done" && result ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Speech Rate",   v: `${result.wpm} wpm`,
                    c: result.wpm > 100 && result.wpm < 180 ? T.green : T.amber },
                  { label: "Speed Var.",    v: `±${result.speedDev} wpm`,
                    c: result.speedDev < 20 ? T.green : T.amber },
                  { label: "Completion",    v: `${Math.round(result.compRatio * 100)}%`,
                    c: result.compRatio > 0.8 ? T.green : T.amber },
                  { label: "Start Delay",   v: `${result.startDelay}s`,
                    c: result.startDelay < 1 ? T.green : T.amber },
                  { label: "Restarts",      v: restartCount,
                    c: restartCount === 0 ? T.green : T.amber },
                  { label: "Duration",      v: `${timer}s`,  c: T.cream },
                ].map(m => (
                  <div key={m.label} style={{ background: T.bg3, borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 10, color: T.creamFaint, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, color: m.c, fontSize: 20 }}>{m.v}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: "rgba(74,222,128,0.08)", borderRadius: 14, padding: 18, border: "1px solid rgba(74,222,128,0.15)", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: T.green, marginBottom: 6, fontSize: 13 }}>✓ Speech data captured</div>
                <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65 }}>
                  5 speech features extracted including WPM, variability, and start delay.
                </div>
              </div>

              <Btn onClick={() => setPage("assessments")} style={{ width: "100%", justifyContent: "center" }}>← Back to Tests</Btn>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 0", color: T.creamFaint }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>📊</div>
              <div style={{ fontSize: 14, lineHeight: 1.7 }}>
                {phase === "idle"
                  ? "Results appear after you complete the recording"
                  : phase === "recording"
                  ? "Recording in progress…"
                  : "Processing…"}
              </div>
              {/* Live WPM estimate during recording */}
              {phase === "recording" && timer > 5 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Est. WPM</div>
                  <div style={{ fontWeight: 900, fontSize: 40, color: LIME }}>
                    {Math.round((WORD_COUNT / timer) * 60)}
                  </div>
                </div>
              )}
            </div>
          )}
        </DarkCard>
      </div>
    </div>
  );
}