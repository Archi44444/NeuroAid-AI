import { useEffect, useRef } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, MiniChart } from "../components/RiskDashboard";
import { useAssessment } from "../context/AssessmentContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const DISEASE_META = {
  alzheimers: {
    label: "Alzheimer's", icon: "🧩",
    color: "#a78bfa", glow: "rgba(167,139,250,0.2)",
    primaryFeatures: ["Memory decay", "Word retrieval", "Delayed recall"],
    description: "Primarily signals short-term memory loss, word-finding difficulties, and delayed recall decline.",
  },
  dementia: {
    label: "Dementia", icon: "🌀",
    color: T.amber, glow: "rgba(245,158,11,0.2)",
    primaryFeatures: ["Processing speed", "Attention stability", "Executive control"],
    description: "Broad cognitive decline marker — attention, processing speed, and executive function.",
  },
  parkinsons: {
    label: "Parkinson's", icon: "🎯",
    color: T.blue, glow: "rgba(96,165,250,0.2)",
    primaryFeatures: ["Motor rhythm", "Reaction consistency", "Initiation delay"],
    description: "Motor timing irregularity, bradykinesia signals, and rhythmic tapping consistency.",
  },
};

function riskColor(level) {
  return level === "Low" ? T.green : level === "Moderate" ? T.amber : T.red;
}

function ProbBar({ prob, color }) {
  const pct = Math.round(prob * 100);
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: T.creamFaint }}>Probability</span>
        <span style={{ fontSize: 14, fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.07)" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, boxShadow: `0 0 10px ${color}66`, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function DiseaseCard({ diseaseKey, prob, level }) {
  const meta = DISEASE_META[diseaseKey];
  const lvlColor = riskColor(level);
  return (
    <DarkCard style={{ padding: 28, border: `1px solid ${meta.color}25`, background: "linear-gradient(135deg, #161616, #111)" }} hover={false}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{meta.icon}</div>
          <div>
            <div style={{ fontWeight: 700, color: T.cream, fontSize: 17 }}>{meta.label}</div>
            <div style={{ fontSize: 11, color: T.creamFaint, marginTop: 2 }}>Behavioral screening</div>
          </div>
        </div>
        <span style={{ background: `${lvlColor}18`, color: lvlColor, padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, border: `1px solid ${lvlColor}33` }}>
          {level} Risk
        </span>
      </div>
      <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
        <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 64, color: meta.color, lineHeight: 1, textShadow: `0 0 30px ${meta.glow}` }}>
          {Math.round(prob * 100)}<span style={{ fontSize: 24, color: T.creamFaint }}>%</span>
        </div>
        <div style={{ color: T.creamFaint, fontSize: 13, marginTop: 4 }}>probability signal</div>
      </div>
      <ProbBar prob={prob} color={meta.color} />
      <div style={{ marginTop: 20, padding: "14px 0", borderTop: `1px solid ${T.cardBorder}` }}>
        <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>Primary signals</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {meta.primaryFeatures.map(f => (
            <span key={f} style={{ background: `${meta.color}12`, color: meta.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{f}</span>
          ))}
        </div>
        <p style={{ color: T.creamFaint, fontSize: 12, lineHeight: 1.65, marginTop: 10 }}>{meta.description}</p>
      </div>
    </DarkCard>
  );
}

export default function ResultsPage({ setPage, user }) {
  const { apiResult, reset } = useAssessment();
  const savedRef = useRef(false);

  const r = apiResult || {
    speech_score: 0, memory_score: 0, reaction_score: 0,
    executive_score: 0, motor_score: 0,
    alzheimers_risk: 0, dementia_risk: 0, parkinsons_risk: 0,
    risk_levels: { alzheimers: "Low", dementia: "Low", parkinsons: "Low" },
    feature_vector: null, attention_variability_index: null,
    disclaimer: "⚠️ Screening tool only — not a medical diagnosis.",
  };

  const isLive = !!apiResult;
  const fv     = r.feature_vector;
  const today  = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const compositeRisk = r.composite_risk_score ?? null;
  const compositeTier = r.composite_risk_tier  ?? null;
  const ageNormalized = r.age_normalized        ?? false;

  function tierColor(tier) {
    return tier === "Low" ? T.green
      : tier === "Mild Concern" ? "#60a5fa"
      : tier === "Moderate Risk" ? T.amber
      : T.red;
  }

  const domainScores = [
    { label: "Speech",    score: Math.round(r.speech_score),    icon: "🎙️", color: T.red    },
    { label: "Memory",    score: Math.round(r.memory_score),    icon: "🧠", color: T.green  },
    { label: "Reaction",  score: Math.round(r.reaction_score),  icon: "⚡", color: T.blue   },
    { label: "Executive", score: Math.round(r.executive_score), icon: "🎨", color: "#a78bfa" },
    { label: "Motor",     score: Math.round(r.motor_score),     icon: "🥁", color: T.amber  },
  ];

  const overallHealth = Math.round(domainScores.reduce((s, d) => s + d.score, 0) / domainScores.length);

  // Save to Firestore once when live result comes in
  useEffect(() => {
    if (!isLive || savedRef.current || !user?.uid || user.uid === "guest") return;
    savedRef.current = true;
    addDoc(collection(db, "assessments"), {
      uid:              user.uid,
      name:             user.name || "",
      createdAt:        new Date().toISOString(),
      speech_score:     r.speech_score,
      memory_score:     r.memory_score,
      reaction_score:   r.reaction_score,
      executive_score:  r.executive_score,
      motor_score:      r.motor_score,
      alzheimers_risk:  r.alzheimers_risk,
      dementia_risk:    r.dementia_risk,
      parkinsons_risk:  r.parkinsons_risk,
      risk_levels:      r.risk_levels,
      feature_vector:   r.feature_vector || null,
    }).catch(console.error);
  }, [isLive]);

  // ── Download report as HTML ──────────────────────────────────────────────────
  function downloadReport() {
    const userName = user?.name || "Patient";
    const date     = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    const riskBadge = (level) => {
      const color = level === "Low" ? "#4ade80" : level === "Moderate" ? "#f59e0b" : "#e84040";
      return `<span style="background:${color}22;color:${color};padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;border:1px solid ${color}44">${level} Risk</span>`;
    };

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>NeuroAid Report — ${userName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f8f8; color: #111; padding: 40px; max-width: 820px; margin: 0 auto; }
  .header { text-align: center; background: linear-gradient(135deg,#0a0a0a,#1a0505); color: #f0ece3; padding: 40px; border-radius: 16px; margin-bottom: 32px; }
  .logo { font-size: 40px; margin-bottom: 8px; }
  .title { font-size: 28px; font-weight: 300; margin-bottom: 6px; }
  .subtitle { font-size: 14px; color: #888; }
  .patient-info { background: white; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid #e0e0e0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .info-item label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 4px; }
  .info-item span { font-size: 15px; font-weight: 600; }
  .score-card { background: white; border-radius: 12px; padding: 28px; margin-bottom: 24px; border: 1px solid #e0e0e0; }
  .score-card h2 { font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
  .overall-score { font-size: 72px; font-weight: 200; color: #111; line-height: 1; }
  .domain-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
  .domain-row:last-child { border-bottom: none; }
  .bar-wrap { flex: 1; height: 6px; background: #f0f0f0; border-radius: 3px; margin: 0 16px; }
  .bar { height: 100%; border-radius: 3px; }
  .risk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .risk-card { background: white; border-radius: 12px; padding: 20px; border: 1px solid #e0e0e0; text-align: center; }
  .risk-card .icon { font-size: 28px; margin-bottom: 10px; }
  .risk-card .disease { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
  .risk-card .prob { font-size: 32px; font-weight: 200; margin-bottom: 8px; }
  .disclaimer { background: #fffbf0; border: 1px solid #f59e0b44; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; color: #92400e; font-size: 13px; line-height: 1.65; }
  .footer { text-align: center; color: #aaa; font-size: 12px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div class="logo">⬡</div>
  <div class="title">NeuroAid Cognitive Assessment Report</div>
  <div class="subtitle">${date}</div>
</div>

<div class="patient-info">
  <div class="info-item"><label>Patient Name</label><span>${userName}</span></div>
  <div class="info-item"><label>Assessment Date</label><span>${date}</span></div>
  <div class="info-item"><label>Overall Score</label><span>${overallHealth} / 100</span></div>
  <div class="info-item"><label>Risk Status</label><span>${Object.values(r.risk_levels || {}).includes("High") ? "High" : Object.values(r.risk_levels || {}).includes("Moderate") ? "Moderate" : "Low"} Risk</span></div>
</div>

<div class="score-card">
  <h2>Overall Cognitive Health</h2>
  <div style="display:flex;align-items:flex-end;gap:16px;margin-bottom:24px">
    <div class="overall-score">${overallHealth}</div>
    <div style="padding-bottom:8px;color:#888;font-size:18px">/100</div>
  </div>
  ${domainScores.map(d => `
  <div class="domain-row">
    <span style="width:90px;font-size:13px">${d.icon} ${d.label}</span>
    <div class="bar-wrap"><div class="bar" style="width:${d.score}%;background:${d.color}"></div></div>
    <span style="font-weight:700;font-size:14px;width:30px;text-align:right">${d.score}</span>
  </div>`).join("")}
</div>

<div class="risk-grid">
  ${[
    { key: "alzheimers", label: "Alzheimer's", icon: "🧩", prob: r.alzheimers_risk },
    { key: "dementia",   label: "Dementia",    icon: "🌀", prob: r.dementia_risk   },
    { key: "parkinsons", label: "Parkinson's", icon: "🎯", prob: r.parkinsons_risk },
  ].map(d => `
  <div class="risk-card">
    <div class="icon">${d.icon}</div>
    <div class="disease">${d.label}</div>
    <div class="prob">${Math.round(d.prob * 100)}%</div>
    ${riskBadge(r.risk_levels?.[d.key] || "Low")}
  </div>`).join("")}
</div>

${fv ? `
<div class="score-card">
  <h2>Behavioral Feature Vector (18 signals)</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:8px">
    ${[
      ["WPM", fv.wpm?.toFixed(0)],
      ["Speed Dev.", fv.speed_deviation?.toFixed(2)],
      ["Pause Ratio", `${(fv.pause_ratio * 100).toFixed(1)}%`],
      ["Start Delay", `${fv.speech_start_delay}s`],
      ["Imm. Recall", `${fv.immediate_recall_accuracy?.toFixed(1)}%`],
      ["Del. Recall", `${fv.delayed_recall_accuracy?.toFixed(1)}%`],
      ["Intrusions", fv.intrusion_count],
      ["Recall Lat.", `${fv.recall_latency}s`],
      ["Mean RT", `${Math.round(fv.mean_rt)}ms`],
      ["Std RT", `±${Math.round(fv.std_rt)}ms`],
      ["Drift", `${fv.reaction_drift > 0 ? "+" : ""}${Math.round(fv.reaction_drift)}ms`],
      ["Misses", fv.miss_count],
      ["Stroop Err", `${(fv.stroop_error_rate * 100).toFixed(0)}%`],
      ["Stroop RT", `${Math.round(fv.stroop_rt)}ms`],
      ["Tap Std", `${Math.round(fv.tap_interval_std)}ms`],
    ].map(([k, v]) => `<div style="background:#f8f8f8;border-radius:8px;padding:10px 12px"><div style="font-size:10px;color:#888;text-transform:uppercase;margin-bottom:4px">${k}</div><div style="font-weight:700;font-size:15px">${v ?? "—"}</div></div>`).join("")}
  </div>
</div>` : ""}

<div class="disclaimer">
  ⚠️ <strong>Medical Disclaimer:</strong> ${r.disclaimer || "This is a screening tool only and does not constitute a medical diagnosis. Always consult a qualified neurologist or physician for clinical evaluation and diagnosis."}
</div>

<div class="footer">
  Generated by NeuroAid Cognitive AI Platform · ${date}<br/>
  <em>For clinical use only under physician supervision</em>
</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `NeuroAid_Report_${userName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Assessment Results</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>
          {today} · {isLive ? "Live 18-feature analysis" : "Complete tests for real results"}
        </p>
      </div>

      {/* Overall */}
      <DarkCard style={{ padding: 36, marginBottom: 24, background: "linear-gradient(135deg,#161010,#100e0e)", border: "1px solid rgba(232,64,64,0.15)" }} hover={false}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Overall Cognitive Health</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
              <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 88, color: T.cream, lineHeight: 1 }}>{overallHealth}</span>
              <span style={{ color: T.creamFaint, fontSize: 20, paddingBottom: 12 }}>/100</span>
            </div>
          </div>
          <MiniChart data={[58, 61, 64, 60, 67, 70, overallHealth]} color={T.red} height={80} />
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          {domainScores.map(d => (
            <div key={d.label} style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}>{d.icon}</div>
              <div style={{ fontWeight: 700, color: d.color, fontSize: 20 }}>{d.score}</div>
              <div style={{ fontSize: 10, color: T.creamFaint, marginTop: 2 }}>{d.label}</div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", marginTop: 6 }}>
                <div style={{ height: "100%", width: `${d.score}%`, background: d.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </DarkCard>

      {/* Composite Risk Score — weighted model */}
      {compositeRisk !== null && (
        <DarkCard style={{ padding: 28, marginBottom: 24, background: "linear-gradient(135deg,#0e0e18,#111)" }} hover={false}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>
                Composite Risk Score
                {ageNormalized && <span style={{ marginLeft: 8, background: "rgba(74,222,128,0.12)", color: T.green, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>Age-Normalized ✓</span>}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 64, color: tierColor(compositeTier), lineHeight: 1 }}>{Math.round(compositeRisk)}</span>
                <span style={{ color: T.creamFaint, fontSize: 18, paddingBottom: 8 }}>/100</span>
              </div>
              <div style={{ marginTop: 10 }}>
                <span style={{ background: `${tierColor(compositeTier)}18`, color: tierColor(compositeTier), padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, border: `1px solid ${tierColor(compositeTier)}33` }}>
                  {compositeTier}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 11, color: T.creamFaint, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>Weighted Contribution</div>
              {[
                { label: "Memory",    w: 30, score: r.memory_score,    color: T.green   },
                { label: "Speech",    w: 25, score: r.speech_score,    color: T.red     },
                { label: "Executive", w: 20, score: r.executive_score, color: "#a78bfa" },
                { label: "Reaction",  w: 15, score: r.reaction_score,  color: T.blue    },
                { label: "Motor",     w: 10, score: r.motor_score,     color: T.amber   },
              ].map(d => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: T.creamFaint, width: 68 }}>{d.label}</span>
                  <span style={{ fontSize: 10, color: T.creamFaint, width: 28 }}>{d.w}%</span>
                  <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${Math.round(d.score ?? 0)}%`, background: d.color, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: d.color, width: 28, textAlign: "right" }}>{Math.round(d.score ?? 0)}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 11, color: T.creamFaint, lineHeight: 1.6 }}>
                Thresholds: <span style={{ color: T.green }}>0–49 Low</span> · <span style={{ color: "#60a5fa" }}>50–69 Mild</span> · <span style={{ color: T.amber }}>70–84 Moderate</span> · <span style={{ color: T.red }}>85+ High</span>
              </div>
            </div>
          </div>
        </DarkCard>
      )}

      {/* Disease cards */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Disease-Specific Risk Signals</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          <DiseaseCard diseaseKey="alzheimers" prob={r.alzheimers_risk} level={r.risk_levels.alzheimers} />
          <DiseaseCard diseaseKey="dementia"   prob={r.dementia_risk}   level={r.risk_levels.dementia}   />
          <DiseaseCard diseaseKey="parkinsons" prob={r.parkinsons_risk} level={r.risk_levels.parkinsons} />
        </div>
      </div>

      {/* Feature vector */}
      {fv && (
        <DarkCard style={{ padding: 28, marginBottom: 20 }} hover={false}>
          <div style={{ fontWeight: 700, color: T.cream, fontSize: 15, marginBottom: 16 }}>📊 18-Feature Behavioral Vector</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {[
              { k: "WPM",          v: fv.wpm,                              group: "speech"    },
              { k: "Speed Dev.",   v: fv.speed_deviation,                  group: "speech"    },
              { k: "Speech Var.",  v: fv.speech_variability,               group: "speech"    },
              { k: "Pause Ratio",  v: `${(fv.pause_ratio * 100).toFixed(1)}%`, group: "speech" },
              { k: "Start Delay",  v: `${fv.speech_start_delay}s`,         group: "speech"    },
              { k: "Imm. Recall",  v: `${fv.immediate_recall_accuracy?.toFixed(1)}%`, group: "memory" },
              { k: "Del. Recall",  v: `${fv.delayed_recall_accuracy?.toFixed(1)}%`,   group: "memory" },
              { k: "Intrusions",   v: fv.intrusion_count,                  group: "memory"    },
              { k: "Rec. Latency", v: `${fv.recall_latency}s`,             group: "memory"    },
              { k: "Order Match",  v: `${(fv.order_match_ratio * 100).toFixed(0)}%`, group: "memory" },
              { k: "Mean RT",      v: `${Math.round(fv.mean_rt)}ms`,       group: "reaction"  },
              { k: "Std RT",       v: `±${Math.round(fv.std_rt)}ms`,       group: "reaction"  },
              { k: "Min RT",       v: `${Math.round(fv.min_rt)}ms`,        group: "reaction"  },
              { k: "Drift",        v: `${fv.reaction_drift > 0 ? "+" : ""}${Math.round(fv.reaction_drift)}ms`, group: "reaction" },
              { k: "Misses",       v: fv.miss_count,                       group: "reaction"  },
              { k: "Stroop Err",   v: `${(fv.stroop_error_rate * 100).toFixed(0)}%`, group: "exec" },
              { k: "Stroop RT",    v: `${Math.round(fv.stroop_rt)}ms`,     group: "exec"      },
              { k: "Tap Std",      v: `${Math.round(fv.tap_interval_std)}ms`, group: "motor"   },
            ].map(m => {
              const groupColor = { speech: T.red, memory: T.green, reaction: T.blue, exec: "#a78bfa", motor: T.amber }[m.group];
              return (
                <div key={m.k} style={{ background: T.bg3, borderRadius: 10, padding: "10px 12px", borderTop: `2px solid ${groupColor}33` }}>
                  <div style={{ fontSize: 10, color: T.creamFaint, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.4 }}>{m.k}</div>
                  <div style={{ fontWeight: 700, color: T.cream, fontSize: 15 }}>{m.v ?? "—"}</div>
                </div>
              );
            })}
          </div>
          {r.attention_variability_index != null && (
            <div style={{ marginTop: 14, color: T.creamFaint, fontSize: 12 }}>
              Attention Variability Index (std_rt / mean_rt): <strong style={{ color: T.cream }}>{r.attention_variability_index}</strong>
            </div>
          )}
        </DarkCard>
      )}

      {/* Disclaimer */}
      <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
        <p style={{ color: T.amber, fontSize: 13, lineHeight: 1.7 }}>{r.disclaimer}</p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Btn onClick={() => setPage("progress")}>📈 View History</Btn>
        <Btn variant="ghost" onClick={() => { reset(); setPage("assessments"); }}>🔄 Retake Assessment</Btn>
        <Btn variant="ghost" onClick={downloadReport}>📥 Download Report</Btn>
      </div>
    </div>
  );
}
