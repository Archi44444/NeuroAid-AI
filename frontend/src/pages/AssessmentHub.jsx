import { useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn } from "../components/RiskDashboard";
import { useAssessment } from "../context/AssessmentContext";
import { submitAnalysis } from "../services/api";

export default function AssessmentHub({ setPage }) {
  const {
    speechData, memoryData, reactionData, stroopData, tapData,
    setApiResult, setLoading, setError, loading, error, completedCount,
  } = useAssessment();

  const tests = [
    { id: "speech",   icon: "🎙️", title: "Speech Analysis",     desc: "Passage reading — WPM, pauses, rhythm variability.",     dur: "~2 min", accent: T.red,   done: !!speechData   },
    { id: "memory",   icon: "🧠", title: "Memory Test",          desc: "Recall + delayed recall. Latency, order, intrusions.",  dur: "~3 min", accent: T.green, done: !!memoryData   },
    { id: "reaction", icon: "⚡", title: "Reaction Time",        desc: "Speed, drift, misses. Sustained attention signal.",     dur: "~2 min", accent: T.blue,  done: !!reactionData },
    { id: "stroop",   icon: "🎨", title: "Stroop Test",          desc: "Color-word interference. Executive function signal.",   dur: "~2 min", accent: "#a78bfa", done: !!stroopData  },
    { id: "tap",      icon: "🥁", title: "Motor Tap Test",       desc: "10-second rapid tapping. Rhythmic motor control.",      dur: "~1 min", accent: T.amber,  done: !!tapData     },
  ];

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        speech_audio:   speechData?.audio_b64 || null,
        memory_results: {
          word_recall_accuracy: memoryData?.word_recall_accuracy ?? 50,
          pattern_accuracy:     memoryData?.pattern_accuracy     ?? 50,
        },
        reaction_times: reactionData?.times ?? [],
        speech: speechData ? {
          wpm:                      speechData.wpm,
          speed_deviation:          speechData.speed_deviation,
          speech_speed_variability: speechData.speech_speed_variability,
          pause_ratio:              speechData.pause_ratio,
          completion_ratio:         speechData.completion_ratio,
          restart_count:            speechData.restart_count,
          speech_start_delay:       speechData.speech_start_delay,
        } : null,
        memory: memoryData ? {
          word_recall_accuracy:   memoryData.word_recall_accuracy,
          pattern_accuracy:       memoryData.pattern_accuracy,
          delayed_recall_accuracy:memoryData.delayed_recall_accuracy,
          recall_latency_seconds: memoryData.recall_latency_seconds,
          order_match_ratio:      memoryData.order_match_ratio,
          intrusion_count:        memoryData.intrusion_count,
        } : null,
        reaction: reactionData ? {
          times:      reactionData.times,
          miss_count: reactionData.miss_count,
        } : null,
        stroop: stroopData ? {
          total_trials:   stroopData.total_trials,
          error_count:    stroopData.error_count,
          mean_rt:        stroopData.mean_rt,
          incongruent_rt: stroopData.incongruent_rt,
        } : null,
        tap: tapData ? {
          intervals:  tapData.intervals,
          tap_count:  tapData.tap_count,
        } : null,
      };

      const result = await submitAnalysis(payload);
      setApiResult(result);
      setPage("results");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const allDone = completedCount >= 5;

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Assessment Hub</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>Complete all 5 tests to generate disease-specific risk scores (Alzheimer's · Dementia · Parkinson's).</p>
      </div>

      {/* Progress */}
      <DarkCard style={{ padding: 20, marginBottom: 24 }} hover={false}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: T.creamDim, fontWeight: 600 }}>Session Progress</span>
          <span style={{ fontSize: 12, color: T.creamFaint }}>{completedCount} / 5 completed</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ height: "100%", width: `${(completedCount / 5) * 100}%`, background: `linear-gradient(90deg,${T.red},#a78bfa,${T.green})`, borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>
      </DarkCard>

      {/* Test grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {tests.slice(0, 3).map(t => <TestCard key={t.id} t={t} setPage={setPage} loading={loading} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {tests.slice(3).map(t => <TestCard key={t.id} t={t} setPage={setPage} loading={loading} />)}
      </div>

      {/* Disclaimer */}
      <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "14px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 18 }}>⚠️</span>
        <p style={{ color: T.amber, fontSize: 13, lineHeight: 1.65 }}>
          <strong>Screening tool only.</strong> This assessment measures behavioral signals only and is NOT a medical diagnosis. Always consult a qualified neurologist for clinical evaluation.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.3)", borderRadius: 12, padding: 16, marginBottom: 16, color: T.red, fontSize: 13 }}>
          ⚠️ {error} — Make sure the backend is running: <code style={{ fontSize: 11 }}>uvicorn main:app --reload --port 8000</code>
        </div>
      )}

      <Btn
        onClick={handleSubmit}
        disabled={!allDone || loading}
        style={{ opacity: !allDone || loading ? 0.4 : 1, cursor: !allDone || loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "⏳ Analyzing 18 features…" : !allDone ? `Complete ${5 - completedCount} more test${5 - completedCount > 1 ? "s" : ""}` : "🧠 Submit & Get Disease Risk Scores →"}
      </Btn>
    </div>
  );
}

function TestCard({ t, setPage, loading }) {
  return (
    <DarkCard style={{ padding: 24, position: "relative", opacity: loading ? 0.6 : 1 }} onClick={loading ? undefined : () => setPage(t.id)}>
      {t.done && (
        <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: T.green, fontWeight: 700 }}>✓ Done</div>
      )}
      <div style={{ width: 48, height: 48, borderRadius: 12, background: `${t.accent}18`, border: `1px solid ${t.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{t.icon}</div>
      <div style={{ fontWeight: 700, color: T.cream, fontSize: 16, marginBottom: 6 }}>{t.title}</div>
      <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>{t.desc}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.cardBorder}`, paddingTop: 14 }}>
        <span style={{ fontSize: 12, color: T.creamFaint }}>⏱ {t.dur}</span>
        <span style={{ fontSize: 12, color: t.done ? T.green : t.accent, fontWeight: 600 }}>{t.done ? "Redo →" : "Start →"}</span>
      </div>
    </DarkCard>
  );
}
