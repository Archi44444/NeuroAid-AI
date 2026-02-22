import { useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn } from "../components/RiskDashboard";
import { useAssessment } from "../context/AssessmentContext";
import { submitAnalysis } from "../services/api";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AssessmentHub({ setPage, user }) {
  const {
    speechData, memoryData, reactionData, stroopData, tapData,
    fluencyData, digitSpanData,
    setApiResult, setLoading, setError, loading, error, completedCount,
    profile,
  } = useAssessment();

  const tests = [
    { id: "speech",    icon: "🎙️", title: "Speech Analysis",  desc: "Passage reading — WPM, pauses, rhythm variability.",    dur: "~2 min", accent: T.red,     done: !!speechData,    required: true },
    { id: "memory",    icon: "🧠", title: "Memory Recall",     desc: "Recall + delayed recall. Latency, order, intrusions.", dur: "~3 min", accent: T.green,   done: !!memoryData,    required: true },
    { id: "reaction",  icon: "⚡", title: "Reaction Time",     desc: "Speed, drift, misses. Sustained attention signal.",    dur: "~2 min", accent: T.blue,    done: !!reactionData,  required: true },
    { id: "stroop",    icon: "🎨", title: "Stroop Test",       desc: "Color-word interference. Executive function signal.",  dur: "~2 min", accent: "#a78bfa", done: !!stroopData,    required: true },
    { id: "tap",       icon: "🥁", title: "Motor Tap Test",    desc: "10-second rapid tapping. Rhythmic motor control.",     dur: "~1 min", accent: T.amber,   done: !!tapData,       required: true },
    { id: "fluency",   icon: "🦁", title: "Word Fluency",      desc: "Name as many animals as possible in 30 seconds.",     dur: "~1 min", accent: "#f472b6", done: !!fluencyData,   required: false },
    { id: "digitspan", icon: "🔢", title: "Working Memory",    desc: "Digit span — repeat number sequences forward.",       dur: "~2 min", accent: "#67e8f9", done: !!digitSpanData, required: false },
  ];

  const requiredDone = [speechData, memoryData, reactionData, stroopData, tapData].filter(Boolean).length;
  const totalDone    = completedCount;
  const allRequired  = requiredDone >= 5;

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
          word_recall_accuracy:    memoryData.word_recall_accuracy,
          pattern_accuracy:        memoryData.pattern_accuracy,
          delayed_recall_accuracy: memoryData.delayed_recall_accuracy,
          recall_latency_seconds:  memoryData.recall_latency_seconds,
          order_match_ratio:       memoryData.order_match_ratio,
          intrusion_count:         memoryData.intrusion_count,
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
        profile: profile ? {
          age:                parseInt(profile.age, 10) || null,
          education_level:    parseInt(profile.education, 10) || null,
          sleep_hours:        parseFloat(profile.sleepHours) || null,
          family_history:     profile.familyHistory || false,
          existing_diagnosis: profile.existingDiagnosis || false,
          sleep_quality:      profile.sleepQuality || "normal",
        } : null,
        fluency:    fluencyData || null,
        digit_span: digitSpanData || null,
      };

      const result = await submitAnalysis(payload);
      setApiResult(result);

      // ── Save assessment to Firestore ──────────────────────────────────────
      if (user?.uid && user.uid !== "guest") {
        try {
          await addDoc(collection(db, "assessments"), {
            uid:                  user.uid,
            createdAt:            new Date().toISOString(),
            speech_score:         result.speech_score,
            memory_score:         result.memory_score,
            reaction_score:       result.reaction_score,
            executive_score:      result.executive_score,
            motor_score:          result.motor_score,
            composite_risk_score: result.composite_risk_score,
            composite_risk_level: result.composite_risk_level,
            composite_risk_tier:  result.composite_risk_level,
            alzheimers_risk:      result.alzheimers_risk,
            dementia_risk:        result.dementia_risk,
            parkinsons_risk:      result.parkinsons_risk,
            risk_levels:          result.risk_levels,
            fluency_word_count:   fluencyData?.word_count ?? null,
            digit_max_span:       digitSpanData?.max_forward_span ?? null,
          });
        } catch (fsErr) {
          console.warn("Firestore save failed (non-critical):", fsErr.message);
        }
      }

      setPage("results");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Assessment Hub</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>Complete all 5 core tests to generate disease-specific risk scores. Bonus tests improve accuracy.</p>
      </div>

      {/* Progress */}
      <DarkCard style={{ padding: 20, marginBottom: 24 }} hover={false}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: T.creamDim, fontWeight: 600 }}>Session Progress</span>
          <span style={{ fontSize: 12, color: T.creamFaint }}>{totalDone} / 7 completed ({requiredDone}/5 required)</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
          <div style={{ height: "100%", width: `${(totalDone / 7) * 100}%`, background: `linear-gradient(90deg,${T.red},#a78bfa,${T.green})`, borderRadius: 3, transition: "width 0.5s ease" }} />
        </div>
      </DarkCard>

      {/* Core Tests */}
      <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12 }}>Core Tests (Required)</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 16 }}>
        {tests.slice(0, 3).map(t => <TestCard key={t.id} t={t} setPage={setPage} loading={loading} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {tests.slice(3, 5).map(t => <TestCard key={t.id} t={t} setPage={setPage} loading={loading} />)}
      </div>

      {/* Bonus Tests */}
      <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 12 }}>Bonus Tests (Optional — improves accuracy)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        {tests.slice(5).map(t => <TestCard key={t.id} t={t} setPage={setPage} loading={loading} />)}
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
          ⚠️ {error}
          <br /><span style={{ fontSize: 11, color: T.creamFaint }}>Ensure backend is running at <code>localhost:8000</code> or set VITE_API_URL in your .env</span>
        </div>
      )}

      <Btn
        onClick={handleSubmit}
        disabled={!allRequired || loading}
        style={{ opacity: !allRequired || loading ? 0.4 : 1, cursor: !allRequired || loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "⏳ Analyzing features…" : !allRequired ? `Complete ${5 - requiredDone} more core test${5 - requiredDone > 1 ? "s" : ""}` : "🧠 Submit & Get Risk Analysis →"}
      </Btn>
    </div>
  );
}

function TestCard({ t, setPage, loading }) {
  return (
    <DarkCard
      style={{ padding: 24, position: "relative", opacity: loading ? 0.6 : 1, border: t.done ? `1px solid rgba(74,222,128,0.2)` : undefined }}
      onClick={loading ? undefined : () => setPage(t.id)}
    >
      {t.done && (
        <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: T.green, fontWeight: 700 }}>✓ Done</div>
      )}
      {!t.required && !t.done && (
        <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.05)", border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "3px 10px", fontSize: 10, color: T.creamFaint }}>Optional</div>
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
