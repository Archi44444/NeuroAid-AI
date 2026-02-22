import { T } from "../utils/theme";
import { Stars, DarkCard, Btn, MiniChart } from "../components/RiskDashboard";

export default function LandingPage({ setView }) {
  const FloatCard = ({ children, style }) => (
    <div style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "10px 14px", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", backdropFilter: "blur(10px)", ...style }}>{children}</div>
  );

  return (
    <div style={{ background: T.bg, color: T.cream, fontFamily: "'DM Sans',sans-serif" }}>

      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 60px", borderBottom: `1px solid ${T.cardBorder}`, position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.88)", backdropFilter: "blur(16px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 14px ${T.redGlow}` }}>⬡</div>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, letterSpacing: -0.5 }}>NeuroAid</span>
        </div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {["Guides","Support"].map(l => (
            <button key={l} style={{ background: "none", border: "none", color: T.creamFaint, fontWeight: 500, cursor: "pointer", fontSize: 14, padding: "8px 14px", borderRadius: 8, fontFamily: "'DM Sans',sans-serif" }}
              onMouseEnter={e => e.target.style.color = T.cream} onMouseLeave={e => e.target.style.color = T.creamFaint}>{l}</button>
          ))}
          <button onClick={() => setView("about")} style={{ background: "none", border: "none", color: T.creamFaint, fontWeight: 700, cursor: "pointer", fontSize: 14, padding: "8px 14px", borderRadius: 8, fontFamily: "'DM Sans',sans-serif" }}
            onMouseEnter={e => e.target.style.color = T.cream} onMouseLeave={e => e.target.style.color = T.creamFaint}>About</button>
          <Btn small onClick={() => setView("disclaimer")}>Start Free Assessment</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,64,64,0.15) 0%, transparent 60%), #0a0a0a" }}>
        <Stars count={70} />
        <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,64,64,0.28) 0%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "glow-pulse 4s ease-in-out infinite", pointerEvents: "none" }} />

        <FloatCard style={{ position: "absolute", left: "8%", top: "25%", animation: "floatL 7s ease-in-out infinite" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1a3a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🎙️</div>
            <div><div style={{ fontSize: 10, color: T.creamFaint }}>Speech Rate</div><div style={{ fontSize: 13, fontWeight: 700, color: T.cream }}>142 wpm</div><div style={{ fontSize: 10, color: T.green }}>● Normal</div></div>
          </div>
        </FloatCard>
        <FloatCard style={{ position: "absolute", left: "6%", top: "46%", animation: "floatL 9s ease-in-out infinite 1s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1a1a3a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🧠</div>
            <div><div style={{ fontSize: 10, color: T.creamFaint }}>Memory Recall</div><div style={{ fontSize: 13, fontWeight: 700, color: T.cream }}>9 / 12 words</div><div style={{ fontSize: 10, color: T.green }}>● 75% accuracy</div></div>
          </div>
        </FloatCard>
        <FloatCard style={{ position: "absolute", left: "5%", top: "65%", animation: "floatL 8s ease-in-out infinite 0.5s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2a1a0a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
            <div><div style={{ fontSize: 10, color: T.creamFaint }}>Reaction Time</div><div style={{ fontSize: 13, fontWeight: 700, color: T.cream }}>284 ms avg</div><div style={{ fontSize: 10, color: T.amber }}>● Watch trend</div></div>
          </div>
        </FloatCard>
        <FloatCard style={{ position: "absolute", right: "7%", top: "22%", animation: "floatR 8s ease-in-out infinite 0.5s", minWidth: 130 }}>
          <div style={{ fontSize: 10, color: T.creamFaint, marginBottom: 4 }}>Cognitive Score</div>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, lineHeight: 1 }}>74</div>
          <div style={{ fontSize: 10, color: T.green, marginTop: 4 }}>● Low Risk</div>
        </FloatCard>
        <FloatCard style={{ position: "absolute", right: "6%", top: "42%", animation: "floatR 6s ease-in-out infinite 2s", minWidth: 150 }}>
          <div style={{ fontSize: 10, color: T.creamFaint, marginBottom: 6 }}>Assessment Complete ✓</div>
          <div style={{ background: T.bg3, borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 600, color: T.green, textAlign: "center" }}>View Full Results →</div>
        </FloatCard>
        <FloatCard style={{ position: "absolute", right: "8%", top: "61%", animation: "floatR 7s ease-in-out infinite 1s" }}>
          <div style={{ fontSize: 10, color: T.creamFaint, marginBottom: 2 }}>Pause Frequency</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.cream }}>0.8 / min</div>
          <div style={{ fontSize: 10, color: T.green }}>● Normal</div>
        </FloatCard>

        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{ width: 220, margin: "0 auto", background: "#1c1c1e", borderRadius: 36, padding: "16px 14px 24px", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)", animation: "float 6s ease-in-out infinite" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "0 4px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.cream }}>9:41</span>
              <span style={{ fontSize: 10, color: T.creamFaint }}>◀</span>
            </div>
            <div style={{ background: T.cream, borderRadius: 24, padding: "18px 14px", minHeight: 280 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 14, textAlign: "center" }}>My Score</div>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 56, color: "#111", lineHeight: 1 }}>74</div>
                <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Cognitive Score</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e8f8ee", borderRadius: 20, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#1a7a3a", marginTop: 6 }}>● Low Risk</div>
              </div>
              {[{label:"Speech",v:74,c:"#e84040"},{label:"Memory",v:82,c:"#22c55e"},{label:"Reaction",v:68,c:"#3b82f6"}].map(d => (
                <div key={d.label} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: "#666" }}>{d.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#111" }}>{d.v}</span>
                  </div>
                  <div style={{ height: 3, background: "#e0e0e0", borderRadius: 2 }}><div style={{ height: "100%", width: `${d.v}%`, background: d.c, borderRadius: 2 }} /></div>
                </div>
              ))}
              <div style={{ marginTop: 14, background: "#e84040", borderRadius: 12, padding: "10px 0", textAlign: "center", fontSize: 12, fontWeight: 700, color: "white", cursor: "pointer" }}>Start Assessment →</div>
            </div>
          </div>
          <div style={{ marginTop: 60, maxWidth: 620, padding: "0 24px" }}>
            <div style={{ display: "inline-block", background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: T.red, fontWeight: 600, marginBottom: 20 }}>
              🧠 Early Cognitive Risk Awareness Tool
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(38px,5vw,62px)", fontWeight: 400, lineHeight: 1.08, letterSpacing: -2, color: T.cream }}>
              Reimagine How You<br />Interact With <span style={{ fontStyle: "italic" }}>Your Brain</span>
            </h1>
            <p style={{ color: T.creamDim, fontSize: 16, marginTop: 16, marginBottom: 10, lineHeight: 1.6 }}>
              Don't just assess. <em>Understand. Practice. Master.</em><br/>
              Turn passive cognitive data into active insights.
            </p>
            <p style={{ color: T.creamFaint, fontSize: 13, marginBottom: 28, lineHeight: 1.5 }}>
              ⚠️ This tool does NOT diagnose medical conditions. For individuals aged 40+ and those with family history.
            </p>
            <Btn onClick={() => setView("disclaimer")} style={{ fontSize: 16, padding: "14px 32px" }}>⬡ Start Free Assessment</Btn>
          </div>
        </div>
      </section>

      

      
      {/* ── WHY THIS MATTERS + STATS ── */}
      <section style={{ background: "#0a0a0a", padding: "80px 60px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 60, alignItems: "flex-start", marginBottom: 60 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "inline-block", background: "rgba(232,64,64,0.1)", border: "1px solid rgba(232,64,64,0.25)", borderRadius: 20, padding: "5px 14px", fontSize: 12, color: T.red, fontWeight: 600, marginBottom: 16 }}>
                Why This Matters
              </div>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 38, fontWeight: 400, letterSpacing: -1.2, color: T.cream, lineHeight: 1.2, marginBottom: 16 }}>
                Early detection can change<br /><em style={{ color: T.creamDim }}>everything.</em>
              </h2>
              <p style={{ color: T.creamDim, fontSize: 15, lineHeight: 1.75, marginBottom: 20 }}>
                Cognitive decline often begins <strong style={{ color: T.cream }}>10–20 years</strong> before symptoms become obvious. 
                Regular screening allows you to track subtle changes over time and seek help before 
                serious decline sets in.
              </p>
              <p style={{ color: T.creamFaint, fontSize: 14, lineHeight: 1.7 }}>
                NeuroAid provides scientifically inspired cognitive assessments accessible to everyone — 
                no appointment needed, no expensive equipment. Just 7–10 minutes that could matter most.
              </p>
            </div>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { stat: "55M+", label: "People worldwide live with dementia", color: T.red },
                { stat: "10M",  label: "New cases of dementia diagnosed every year", color: T.amber },
                { stat: "40%",  label: "Of dementia cases may be preventable with lifestyle changes", color: T.green },
                { stat: "7–10", label: "Minutes for a full NeuroAid assessment", color: T.blue },
              ].map((s, i) => (
                <div key={i} style={{ background: T.bg3, borderRadius: 16, padding: "24px 20px", border: `1px solid ${T.cardBorder}` }}>
                  <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 38, color: s.color, lineHeight: 1, marginBottom: 8 }}>{s.stat}</div>
                  <div style={{ fontSize: 12, color: T.creamFaint, lineHeight: 1.5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Who it's for */}
          <div style={{ background: T.bg3, borderRadius: 20, padding: "32px 36px", border: `1px solid ${T.cardBorder}` }}>
            <div style={{ fontSize: 11, color: T.creamFaint, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 20 }}>Who Should Use NeuroAid</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { icon: "👴", title: "Adults 40+", desc: "Establish a cognitive baseline while your brain is healthy" },
                { icon: "🧬", title: "Family History", desc: "First-degree relatives of Alzheimer's or Parkinson's patients" },
                { icon: "🔍", title: "Concerned Individuals", desc: "Anyone noticing subtle memory or cognitive changes" },
                { icon: "🤝", title: "Caregivers", desc: "Help monitor a loved one's cognitive health over time" },
              ].map((w, i) => (
                <div key={i} style={{ flex: "1 0 200px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: T.bg2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{w.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: T.cream, fontSize: 14, marginBottom: 4 }}>{w.title}</div>
                    <div style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.5 }}>{w.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPLETE LEARNING ECOSYSTEM (feature cards) ── */}
      <section style={{ background: "#0f0f0f", padding: "90px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 40, fontWeight: 400, letterSpacing: -1.4, color: T.cream, marginBottom: 10 }}>Complete Assessment Ecosystem</h2>
          <p style={{ color: T.creamDim, fontSize: 15, marginBottom: 56, maxWidth: 520, margin: "0 auto 56px" }}>
            Everything you need to understand your brain health, all in one place.
          </p>

          {/* Main feature grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {/* Routine Generation */}
            <DarkCard style={{ padding: 28, textAlign: "left", border: `1px solid rgba(96,165,250,0.2)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(96,165,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📅</div>
                <div style={{ fontWeight: 700, color: T.cream, fontSize: 16 }}>Assessment Scheduling</div>
              </div>
              <p style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>Automated test schedules built around your cognitive goals and progress.</p>
              <div style={{ background: T.bg3, borderRadius: 12, padding: 14, border: `1px solid ${T.cardBorder}` }}>
                {[{ time: "09:00 AM", c: T.blue }, { time: "10:30 AM", c: "#a78bfa" }, { time: "01:00 PM", c: T.green }].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < 2 ? `1px solid ${T.cardBorder}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.c }} />
                      <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)" }} />
                    </div>
                    <span style={{ fontSize: 11, color: T.creamFaint }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </DarkCard>

            {/* Learning Feed */}
            <DarkCard style={{ padding: 28, textAlign: "left", border: `1px solid rgba(245,158,11,0.2)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
                <div style={{ fontWeight: 700, color: T.cream, fontSize: 16 }}>Results Feed</div>
              </div>
              <p style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>Bite-sized insights generated from your cognitive assessments.</p>
              <div style={{ background: T.bg3, borderRadius: 12, padding: 14, border: `1px solid ${T.cardBorder}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: T.creamDim, fontWeight: 600 }}>Results</span>
                  <span style={{ fontSize: 16 }}>⚡</span>
                </div>
                <div style={{ background: T.bg, borderRadius: 8, height: 80, display: "flex", flexDirection: "column", justifyContent: "center", padding: 10, gap: 6 }}>
                  {["Speech: Normal range","Memory: Improving","Reaction: Stable"].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: [T.green, T.blue, T.amber][i] }} />
                      <span style={{ fontSize: 11, color: T.creamFaint }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DarkCard>

            {/* Smart Note-Taking */}
            <DarkCard style={{ padding: 28, textAlign: "left", border: `1px solid rgba(74,222,128,0.2)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(74,222,128,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏷️</div>
                <div style={{ fontWeight: 700, color: T.cream, fontSize: 16 }}>Smart Reporting</div>
              </div>
              <p style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>Text analysis + visual charts. Doctor-ready reports with one click.</p>
              <div style={{ background: T.bg3, borderRadius: 12, padding: 14, border: `1px solid ${T.cardBorder}`, display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  {[70, 85, 65].map((w, i) => (
                    <div key={i} style={{ height: 5, borderRadius: 2, background: `rgba(74,222,128,${0.3 + i * 0.2})`, marginBottom: i < 2 ? 6 : 0, width: `${w}%` }} />
                  ))}
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 10, border: `2px solid ${T.green}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📄</div>
              </div>
            </DarkCard>

            {/* Deep Focus */}
            <DarkCard style={{ padding: 28, textAlign: "left", border: `1px solid rgba(232,64,64,0.2)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(232,64,64,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⏱️</div>
                <div style={{ fontWeight: 700, color: T.cream, fontSize: 16 }}>Deep Focus Mode</div>
              </div>
              <p style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65 }}>Distraction-free assessment environment with focus timer and immersive UI.</p>
            </DarkCard>

            {/* Intelligent Quizzes */}
            <DarkCard style={{ padding: 28, textAlign: "left", border: `1px solid rgba(167,139,250,0.2)`, gridColumn: "2 / 4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(167,139,250,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✅</div>
                <div style={{ fontWeight: 700, color: T.cream, fontSize: 16 }}>Intelligent Assessments</div>
              </div>
              <p style={{ color: T.creamFaint, fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>5 evidence-based cognitive tests — Speech, Memory, Reaction, Stroop, and Motor — powered by 18 behavioral feature signals and Hugging Face NLP models.</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["🎙️ Speech AI","🧠 Memory","⚡ Reaction","🎨 Stroop","🥁 Motor Tap"].map(t => (
                  <span key={t} style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: "1px solid rgba(167,139,250,0.2)" }}>{t}</span>
                ))}
              </div>
            </DarkCard>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "#0f0f0f", padding: "80px 60px", borderRadius: "24px 24px 0 0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 60, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1.15, color: T.cream, marginBottom: 16 }}>Your ultimate cognitive health platform, packed with features to simplify your brain health journey</h2>
            </div>
            <div style={{ flex: 1, paddingTop: 6 }}>
              <p style={{ color: T.creamDim, fontSize: 15, lineHeight: 1.75, marginBottom: 20 }}>From advanced speech biomarkers to seamless memory tests, we've designed everything to elevate your cognitive screening experience.</p>
              <Btn variant="cream" onClick={() => setView("disclaimer")}>↓ Get started</Btn>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 48 }}>
            <DarkCard style={{ padding: 32, gridRow: "span 2" }}>
              <div style={{ background: T.bg3, borderRadius: 16, padding: 16, marginBottom: 20, border: `1px solid ${T.cardBorder}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>⬡</div>
                  <div><div style={{ fontSize: 12, color: T.creamDim, marginBottom: 2 }}>Your weekly assessment is ready 🧠</div><div style={{ fontSize: 11, color: T.creamFaint }}>Tap to begin — takes ~8 minutes</div></div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", background: T.bg, borderRadius: 10, padding: "8px 12px" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: T.bg2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>📊</div>
                  <div style={{ fontSize: 11, color: T.creamDim }}>Score improved · <span style={{ color: T.green }}>+4 pts this week</span></div>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.cream, marginBottom: 10 }}>Push Notifications</div>
              <div style={{ color: T.creamFaint, fontSize: 14, lineHeight: 1.7 }}>Stay on top of your cognitive health with instant alerts for all assessments and score changes.</div>
            </DarkCard>
            <DarkCard style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #ffd700, #b8860b)", boxShadow: "0 0 40px rgba(255,215,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: "#8b6000" }}>⬡</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.cream, marginBottom: 6 }}>Effortless Assessments</div>
              <div style={{ color: T.creamFaint, fontSize: 14, lineHeight: 1.7 }}>Complete cognitive screenings with a user-friendly, guided interface.</div>
            </DarkCard>
            <DarkCard style={{ padding: 28 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.cream, marginBottom: 10 }}>Longitudinal Tracking</div>
              <div style={{ color: T.creamFaint, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>Score trends over months reveal trajectories invisible to single-point assessments.</div>
              <MiniChart data={[58,61,64,60,67,70,74]} color={T.red} height={50} />
            </DarkCard>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section style={{ background: "#0f0f0f", padding: "80px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 38, fontWeight: 400, letterSpacing: -1.2, color: T.cream, marginBottom: 10 }}>Explore, create, and assess<br /><em style={{ color: T.creamDim }}>seamlessly in the cognitive ecosystem.</em></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 48, marginBottom: 48 }}>
            {[
              { bg: "linear-gradient(135deg,#2a0a0a,#6b1a1a)", imgs: ["🎙️","🧠"], label: "Assess Speech & Memory with AI-powered biomarkers" },
              { bg: "linear-gradient(135deg,#0a1a2a,#1a3a6b)", imgs: ["⚡","📊","🩺"], label: "Track, analyze, and share longitudinal results" },
              { bg: "linear-gradient(135deg,#1a0a2a,#6b1a6b)", imgs: ["⬡"], label: "Doctor-verified reports and clinical interpretation", star: true },
            ].map((c, i) => (
              <DarkCard key={i} style={{ padding: 20, textAlign: "left" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {c.imgs.map((img, j) => <div key={j} style={{ width: 48, height: 48, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{img}</div>)}
                  {c.star && <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#2a1a0a,#8b4513)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✦</div>}
                </div>
                <div style={{ fontSize: 13, color: T.creamDim, lineHeight: 1.6 }}>{c.label}</div>
              </DarkCard>
            ))}
          </div>
          <div style={{ display: "flex", gap: 60, alignItems: "center", textAlign: "left", marginTop: 40 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1.2, color: T.cream, marginBottom: 16 }}>Privacy that lets you<br /><em>sleep easy</em></h2>
              <p style={{ color: T.creamDim, fontSize: 14, lineHeight: 1.75 }}>Your cognitive data is encrypted end-to-end and never sold. Only you and your authorized doctors can access your results.</p>
            </div>
            <DarkCard style={{ flex: 1, padding: 24 }} hover={false}>
              <div style={{ fontSize: 12, color: T.creamFaint, marginBottom: 8 }}>Message</div>
              <div style={{ background: T.bg3, borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 13, color: T.creamDim, fontStyle: "italic" }}>"I love NeuroAid"</div>
              <div style={{ fontSize: 12, color: T.creamFaint, marginBottom: 8 }}>From</div>
              <div style={{ background: T.bg3, borderRadius: 10, padding: 12, fontSize: 13, color: T.cream }}>Dr. Elena Marsh<span style={{ color: T.green, fontSize: 11 }}> · Verified</span></div>
            </DarkCard>
          </div>
        </div>
      </section>

      {/* GATEWAY */}
      <section style={{ background: "#0e0a18", padding: "80px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: -100, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(232,130,40,0.18) 0%, rgba(140,60,20,0.08) 40%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 38, fontWeight: 400, letterSpacing: -1.2, color: T.cream, marginBottom: 10 }}>Your comprehensive gateway<br />to cognitive health tools</h2>
          <p style={{ color: T.creamFaint, fontSize: 14, marginBottom: 56 }}>Access all 6 cognitive screening tools, all in one secure place.</p>
          {[[
            { label: "Speech AI",  bg: "linear-gradient(135deg,#7b2020,#e84040)", icon: "🎙️", rot: "-8deg" },
            { label: "MemoryTest", bg: "linear-gradient(135deg,#1a3a8b,#4060d0)", icon: "🧠", rot: "0deg"  },
            { label: "ReactionX",  bg: "linear-gradient(135deg,#1a6040,#28c070)", icon: "⚡", rot: "8deg"  },
          ],[
            { label: "Progress",   bg: "linear-gradient(135deg,#2a6020,#50b030)", icon: "📈", rot: "-6deg" },
            { label: "DocPortal", bg: "linear-gradient(135deg,#5a2080,#9040d0)", icon: "🩺", rot: "0deg"  },
            { label: "Reports",   bg: "linear-gradient(135deg,#1a4050,#2090b0)", icon: "📄", rot: "6deg"  },
          ]].map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 32 }}>
              {row.map(t => (
                <div key={t.label} onClick={() => setView("disclaimer")}
                  style={{ width: 140, height: 160, borderRadius: 24, background: t.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", transform: `rotate(${t.rot})`, boxShadow: "0 16px 50px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)", transition: "transform 0.25s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.06) rotate(0deg)"}
                  onMouseLeave={e => e.currentTarget.style.transform = `rotate(${t.rot})`}>
                  <div style={{ fontSize: 40 }}>{t.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.9)", letterSpacing: 0.5 }}>{t.label}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: "relative", background: T.bg, padding: "120px 60px", textAlign: "center", overflow: "hidden" }}>
        <Stars count={90} />
        <div style={{ position: "absolute", bottom: -60, left: "50%", transform: "translateX(-50%)", width: 700, height: 350, background: "radial-gradient(ellipse 70% 100% at 50% 100%, rgba(180,100,20,0.22) 0%, rgba(120,60,10,0.1) 40%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(28px,4vw,50px)", fontWeight: 400, letterSpacing: -1.5, color: T.cream, lineHeight: 1.2, marginBottom: 20 }}>Experience cognitive health like never<br />before with NeuroAid</h2>
          <Btn onClick={() => setView("disclaimer")} style={{ fontSize: 16, padding: "14px 32px", marginBottom: 24 }}>⬡ Start Free Assessment</Btn>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", alignItems: "center", marginBottom: 8 }}>
            {["🌐","📱","💻"].map((e, i) => <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", background: T.bg2, border: `1px solid ${T.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{e}</div>)}
          </div>
          <div style={{ color: T.creamFaint, fontSize: 12 }}>Available on web, iOS & Android</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: T.bg, borderTop: `1px solid ${T.cardBorder}`, padding: "40px 60px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 40 }}>
        <div>
          {["Home","Guides","Support","About"].map(l => (
            <button key={l} onClick={() => l === "About" && setView("about")} style={{ display: "block", background: "none", border: "none", color: T.creamFaint, fontSize: 13, cursor: "pointer", marginBottom: 8, fontFamily: "'DM Sans',sans-serif", textAlign: "left" }}>{l}</button>
          ))}
        </div>
        <div>
          <div style={{ color: T.creamDim, fontSize: 13, marginBottom: 12 }}>Stay in touch</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="name@email.com" style={{ background: T.bg2, border: `1px solid ${T.cardBorder}`, borderRadius: 8, padding: "10px 14px", color: T.cream, fontSize: 13, outline: "none", fontFamily: "'DM Sans',sans-serif", width: 200 }} />
            <Btn small>↗ Subscribe</Btn>
          </div>
        </div>
        <div style={{ color: T.creamFaint, fontSize: 11, lineHeight: 1.7, maxWidth: 300 }}>
          <strong style={{ color: T.creamDim }}>Medical Disclaimer:</strong> NeuroAid is a screening tool, not a diagnostic device. Always consult a qualified neurologist.
        </div>
      </footer>
    </div>
  );
}
