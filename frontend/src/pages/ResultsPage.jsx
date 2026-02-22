import { useEffect, useRef } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, MiniChart } from "../components/RiskDashboard";
import { useAssessment } from "../context/AssessmentContext";

// ── Disease card styling ───────────────────────────────────────────────────────
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
  const meta  = DISEASE_META[diseaseKey];
  const lvlColor = riskColor(level);

  return (
    <DarkCard style={{ padding: 28, border: `1px solid ${meta.color}25`, background: `linear-gradient(135deg, #161616, #111)` }} hover={false}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${meta.color}15`, border: `1px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            {meta.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: T.cream, fontSize: 17 }}>{meta.label}</div>
            <div style={{ fontSize: 11, color: T.creamFaint, marginTop: 2 }}>Behavioral screening</div>
          </div>
        </div>
        <span style={{ background: `${lvlColor}18`, color: lvlColor, padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 0.5, border: `1px solid ${lvlColor}33` }}>
          {level} Risk
        </span>
      </div>

      {/* Big probability */}
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

export default function ResultsPage({ setPage }) {
  const { apiResult, profile, error } = useAssessment();
  if (!apiResult || typeof apiResult !== 'object' || Object.keys(apiResult).length === 0) {
    return (
      <div style={{ color: T.red, background: T.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
        <div>
          <h2>Assessment Results Not Found</h2>
          <p>{error ? error : 'No results available. Please complete all tests and submit your assessment.'}</p>
          <button style={{ marginTop: 24, padding: '12px 24px', borderRadius: 8, background: T.red, color: T.cream, fontWeight: 600, fontSize: 16 }} onClick={() => setPage('assessments')}>Go Back</button>
        </div>
      </div>
    );
  }
  const r = apiResult;
  const fv      = r.feature_vector;
  const today   = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const userAge = profile?.age ? parseInt(profile.age, 10) : null;
  const isLive = !!apiResult;

  // Extract composite risk values
  const compositeRisk = r.composite_risk_score ?? 0;
  const riskLevel = r.composite_risk_level ?? "Low";
  const ciLower = r.confidence_lower ?? 0;
  const ciUpper = r.confidence_upper ?? 100;
  const uncertainty = r.model_uncertainty ?? 0;

  const riskColorMap = {
    "Low": T.green,
    "Mild Concern": T.amber,
    "Moderate Risk": "#f97316",  // orange
    "High Risk": T.red,
  };

  const getRiskColor = (level) => riskColorMap[level] || T.green;

  const domainScores = [
    { label: "Speech",    score: Math.round(r.speech_score),    icon: "🎙️", color: T.red    },
    { label: "Memory",    score: Math.round(r.memory_score),    icon: "🧠", color: T.green  },
    { label: "Reaction",  score: Math.round(r.reaction_score),  icon: "⚡", color: T.blue   },
    { label: "Executive", score: Math.round(r.executive_score), icon: "🎨", color: "#a78bfa" },
    { label: "Motor",     score: Math.round(r.motor_score),     icon: "🥁", color: T.amber  },
  ];

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Assessment Results</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>{today} · {isLive ? "Live 18-feature analysis" : "Demo data — complete tests for real results"}</p>
      </div>

      {/* Age-normalized results messaging */}
      {userAge && (
        <div style={{ marginBottom: 16, color: T.creamFaint, fontSize: 13 }}>
          <strong>Results are age-normalized:</strong> All scores are compared to typical values for age {userAge}.
        </div>
      )}

      {/* Composite risk score with confidence interval */}
      <DarkCard style={{ padding: 36, marginBottom: 24, background: "linear-gradient(135deg,#161010,#100e0e)", border: `1px solid ${getRiskColor(riskLevel)}33` }} hover={false}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Composite Cognitive Risk Score</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 88, color: getRiskColor(riskLevel), lineHeight: 1 }}>{Math.round(compositeRisk)}</span>
              <span style={{ color: T.creamFaint, fontSize: 20, paddingBottom: 12 }}>/100</span>
            </div>
            
            {/* Risk level badge */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ 
                background: `${getRiskColor(riskLevel)}18`, 
                color: getRiskColor(riskLevel), 
                padding: "6px 16px", 
                borderRadius: 20, 
                fontSize: 13, 
                fontWeight: 700, 
                letterSpacing: 0.5, 
                border: `1px solid ${getRiskColor(riskLevel)}33` 
              }}>
                ➜ {riskLevel}
              </span>
            </div>

            {/* Confidence interval */}
            <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: `1px solid ${T.cardBorder}` }}>
              <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 0.5, marginBottom: 6 }}>95% Confidence Interval</div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 16, color: T.cream }}>
                {Math.round(ciLower)} – {Math.round(ciUpper)} (±{Math.round(uncertainty)}%)
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", marginTop: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${((ciUpper - ciLower) / 100) * 100}%`,
                  marginLeft: `${(ciLower / 100) * 100}%`,
                  background: `linear-gradient(90deg, ${getRiskColor(riskLevel)}44, ${getRiskColor(riskLevel)}22)`,
                  borderRadius: 3
                }} />
              </div>
            </div>

            {/* Model uncertainty note */}
            <div style={{ fontSize: 12, color: T.creamFaint, lineHeight: 1.6 }}>
              <strong>Note:</strong> {
                uncertainty < 12 ? "High confidence in this assessment." :
                uncertainty < 16 ? "Moderate confidence. Results in borderline range." :
                "High uncertainty — consider retesting for confirmation."
              }
              {riskLevel === "Mild Concern" && " Score in borderline range (50–69) = Model uncertainty is expected."}
            </div>
          </div>
          <MiniChart data={[58, 61, 64, 60, 67, 70, compositeRisk]} color={getRiskColor(riskLevel)} height={80} />
        </div>

        {/* Domain mini scores */}
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

      {/* Disease cards */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>Disease-Specific Risk Signals</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          <DiseaseCard diseaseKey="alzheimers" prob={r.alzheimers_risk} level={r.risk_levels.alzheimers} />
          <DiseaseCard diseaseKey="dementia"   prob={r.dementia_risk}   level={r.risk_levels.dementia}   />
          <DiseaseCard diseaseKey="parkinsons" prob={r.parkinsons_risk} level={r.risk_levels.parkinsons} />
        </div>
        {/* Uncertainty note for borderline scores */}
        {r.composite_risk_level === "Mild Concern" && (
          <div style={{ color: T.amber, fontSize: 13, marginTop: 8 }}>
            <strong>Note:</strong> Your score is in the borderline range (50–69). Model uncertainty is expected. Consider retesting or clinical follow-up if symptoms persist.
          </div>
        )}
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
              { k: "Imm. Recall",  v: `${fv.immediate_recall_accuracy.toFixed(1)}%`, group: "memory" },
              { k: "Del. Recall",  v: `${fv.delayed_recall_accuracy.toFixed(1)}%`,   group: "memory" },
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
                  <div style={{ fontWeight: 700, color: T.cream, fontSize: 15 }}>{m.v}</div>
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
        <Btn variant="ghost">📥 Download Report</Btn>
      </div>
    </div>
  );
}
