import { useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Stars } from "../components/RiskDashboard";
import { login, register } from "../services/api";

const SPECIALIZATIONS = ["Neurology","Psychiatry","Geriatrics","Internal Medicine","General Practice","Neuropsychology"];
const CONSULTATION_MODES = ["Online","Offline","Both"];
const SLOTS = ["Mon AM","Mon PM","Tue AM","Tue PM","Wed AM","Wed PM","Thu AM","Thu PM","Fri AM","Fri PM"];

export default function LoginPage({ setView, setRole, setCurrentUser, onAuthSuccess }) {
  const [mode, setMode]         = useState("user");
  const [tab, setTab]           = useState("login");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [doctorStep, setDoctorStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge]           = useState("");
  const [phone, setPhone]       = useState("");
  const [gender, setGender]     = useState("");
  const [license, setLicense]   = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [hospital, setHospital] = useState("");
  const [location, setLocation] = useState("");
  const [consultMode, setConsultMode] = useState("");
  const [bio, setBio]           = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  function toggleSlot(slot) {
    setAvailableSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  }

  const backendRole = mode === "doctor" ? "doctor" : "patient";

  async function handleSubmit() {
    setError("");
    if (!email.trim() || !password.trim()) return setError("Email and password are required.");
    const emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRe.test(email.trim())) return setError("Please enter a valid email address.");
    if (tab === "register" && !fullName.trim()) return setError("Full name is required.");
    if (tab === "register" && password.length < 6) return setError("Password must be at least 6 characters.");
    if (tab === "register" && mode === "doctor" && !license.trim()) return setError("Medical license number is required.");

    setLoading(true);
    try {
      let result;
      if (tab === "login") {
        result = await login(email.trim(), password, backendRole);
      } else {
        const extraData = mode === "doctor"
          ? { specialization, experience, hospital, location, consultation_mode: consultMode, bio, max_patients: 10, available_slots: availableSlots }
          : { age: age ? parseInt(age) : undefined, gender, phone };
        result = await register({ full_name: fullName.trim(), email: email.trim(), password, role: backendRole, license_number: license.trim() || undefined, ...extraData });
      }
      const isNewUser = tab === "register";
      if (setCurrentUser) setCurrentUser(result.user);
      if (onAuthSuccess) {
        onAuthSuccess(result.user, mode, isNewUser);
      } else {
        setRole(mode);
        setView(mode === "doctor" ? "doctor-dashboard" : "dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m) {
    setMode(m); setError(""); setDoctorStep(1);
    setFullName(""); setEmail(""); setPassword(""); setLicense(""); setAge("");
    setPhone(""); setGender(""); setSpecialization(""); setExperience("");
    setHospital(""); setLocation(""); setConsultMode(""); setBio(""); setAvailableSlots([]);
  }

  const inp = { padding:"11px 14px",borderRadius:10,fontSize:14,fontFamily:"'DM Sans',sans-serif",width:"100%",background:T.bg2,border:`1px solid ${T.cardBorder}`,color:T.cream,outline:"none" };
  const lbl = { fontSize:11,color:T.creamFaint,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:0.8 };
  const chip = (a) => ({ padding:"7px 14px",borderRadius:50,border:`1px solid ${a?T.red:T.cardBorder}`,background:a?"rgba(232,64,64,0.15)":T.bg3,color:a?T.red:T.creamDim,fontSize:12,cursor:"pointer",fontWeight:a?600:400,transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif" });

  const isDR = tab === "register" && mode === "doctor";

  return (
    <div style={{ minHeight:"100vh",background:`radial-gradient(ellipse 80% 60% at 50% -10%,rgba(200,40,40,0.20) 0%,transparent 60%),${T.bg}`,display:"flex",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden" }}>
      <Stars count={60} />
      <div style={{ width:"100%",maxWidth:isDR?560:420,position:"relative",zIndex:2 }}>
        <div style={{ textAlign:"center",marginBottom:28 }}>
          <div style={{ width:46,height:46,borderRadius:14,background:"linear-gradient(135deg,rgba(232,64,64,0.9),rgba(200,36,36,0.95))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,margin:"0 auto 14px",boxShadow:"0 0 32px rgba(232,64,64,0.45)" }}>⬡</div>
          <div style={{ fontFamily:"'Instrument Serif',serif",fontSize:24,color:T.cream }}>NeuroAid</div>
          <div style={{ color:T.creamFaint,fontSize:13,marginTop:4 }}>Cognitive AI Platform</div>
        </div>

        <DarkCard style={{ padding:32 }} hover={false}>
          <div style={{ display:"flex",background:"rgba(255,255,255,0.04)",borderRadius:50,padding:4,marginBottom:24,border:"1px solid rgba(255,255,255,0.08)" }}>
            {[{key:"user",label:"👤 Patient"},{key:"doctor",label:"🩺 Doctor"}].map(r=>(
              <button key={r.key} onClick={()=>switchMode(r.key)} style={{ flex:1,padding:"9px 0",borderRadius:50,border:"none",background:mode===r.key?"linear-gradient(135deg,rgba(232,64,64,0.88),rgba(200,36,36,0.95))":"transparent",color:mode===r.key?"#fff":T.creamFaint,fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s" }}>{r.label}</button>
            ))}
          </div>

          <div style={{ display:"flex",marginBottom:24,borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
            {["login","register"].map(t=>(
              <button key={t} onClick={()=>{ setTab(t); setError(""); setDoctorStep(1); }} style={{ flex:1,padding:"8px 0",border:"none",background:"transparent",color:tab===t?T.cream:T.creamFaint,fontWeight:tab===t?700:400,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",borderBottom:tab===t?`2px solid ${T.red}`:"2px solid transparent",marginBottom:-1,transition:"all 0.2s",textTransform:"capitalize" }}>{t}</button>
            ))}
          </div>

          {isDR && (
            <div style={{ display:"flex",gap:6,marginBottom:20 }}>
              {[1,2].map(s=>(
                <div key={s} style={{ flex:1,height:3,borderRadius:2,background:s<=doctorStep?T.red:"rgba(255,255,255,0.08)",transition:"background 0.3s" }} />
              ))}
            </div>
          )}

          <div style={{ display:"flex",flexDirection:"column",gap:14 }}>

            {/* PATIENT REGISTER */}
            {tab==="register" && mode==="user" && (<>
              <div><label style={lbl}>Full Name</label><input placeholder="e.g. Jane Smith" value={fullName} onChange={e=>setFullName(e.target.value)} style={inp} /></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={lbl}>Email</label><input type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Phone</label><input placeholder="+1 555 000 0000" value={phone} onChange={e=>setPhone(e.target.value)} style={inp} /></div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={lbl}>Age</label><input type="number" min="18" max="100" placeholder="e.g. 45" value={age} onChange={e=>setAge(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Password</label><input type="password" placeholder="6+ characters" value={password} onChange={e=>setPassword(e.target.value)} style={inp} /></div>
              </div>
              <div>
                <label style={lbl}>Gender</label>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                  {["Male","Female","Non-binary","Prefer not to say"].map(g=>(
                    <button key={g} style={chip(gender===g)} onClick={()=>setGender(g)}>{g}</button>
                  ))}
                </div>
              </div>
            </>)}

            {/* DOCTOR REGISTER STEP 1 */}
            {isDR && doctorStep===1 && (<>
              <div><label style={lbl}>Full Name</label><input placeholder="Dr. Jane Smith" value={fullName} onChange={e=>setFullName(e.target.value)} style={inp} /></div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={lbl}>Email</label><input type="email" placeholder="you@hospital.com" value={email} onChange={e=>setEmail(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Password</label><input type="password" placeholder="6+ characters" value={password} onChange={e=>setPassword(e.target.value)} style={inp} /></div>
              </div>
              <div>
                <label style={lbl}>Specialization</label>
                <select value={specialization} onChange={e=>setSpecialization(e.target.value)} style={{ ...inp, background:'#1a1a1a', colorScheme:'dark' }}>
                  <option value="">Select specialization…</option>
                  {SPECIALIZATIONS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                <div><label style={lbl}>Years of Experience</label><input type="number" min="0" max="60" placeholder="e.g. 12" value={experience} onChange={e=>setExperience(e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Medical License No.</label><input placeholder="e.g. ML-123456" value={license} onChange={e=>setLicense(e.target.value)} style={inp} /></div>
              </div>
              <div><label style={lbl}>Hospital / Clinic Name</label><input placeholder="e.g. Memorial Neurological Center" value={hospital} onChange={e=>setHospital(e.target.value)} style={inp} /></div>
              <div><label style={lbl}>Location</label><input placeholder="e.g. Boston, MA" value={location} onChange={e=>setLocation(e.target.value)} style={inp} /></div>
            </>)}

            {/* DOCTOR REGISTER STEP 2 */}
            {isDR && doctorStep===2 && (<>
              <div>
                <label style={lbl}>Consultation Mode</label>
                <div style={{ display:"flex",gap:8 }}>
                  {CONSULTATION_MODES.map(m=>(
                    <button key={m} style={{ ...chip(consultMode===m),flex:1 }} onClick={()=>setConsultMode(m)}>{m}</button>
                  ))}
                </div>
              </div>
              <div style={{ background:"rgba(200,241,53,0.05)",border:"1px solid rgba(200,241,53,0.15)",borderRadius:10,padding:"12px 14px" }}>
                <div style={{ fontSize:11,color:"#C8F135",fontWeight:700,marginBottom:2 }}>🔒 Max Patient Capacity: 10</div>
                <div style={{ fontSize:11,color:T.creamFaint }}>Fixed at 10 patients per doctor to ensure quality of care.</div>
              </div>
              <div>
                <label style={lbl}>Availability Slots</label>
                <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                  {SLOTS.map(slot=>(
                    <button key={slot} style={chip(availableSlots.includes(slot))} onClick={()=>toggleSlot(slot)}>{slot}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Short Bio</label>
                <textarea placeholder="Brief description of your expertise and approach…" value={bio} onChange={e=>setBio(e.target.value)} rows={3}
                  style={{ ...inp,resize:"vertical",minHeight:72 }} />
              </div>
            </>)}

            {/* LOGIN */}
            {tab==="login" && (<>
              <div><label style={lbl}>Email</label><input type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={inp} autoComplete="email" /></div>
              <div><label style={lbl}>Password</label><input type="password" placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)} style={inp} autoComplete="current-password" /></div>
            </>)}

            {error && (
              <div style={{ color:"#ff6b6b",fontSize:13,textAlign:"center",padding:"10px 14px",background:"rgba(232,64,64,0.10)",borderRadius:10,border:"1px solid rgba(232,64,64,0.25)" }}>⚠️ {error}</div>
            )}

            {isDR ? (
              <div style={{ display:"flex",gap:10 }}>
                {doctorStep>1 && (
                  <button onClick={()=>setDoctorStep(1)} style={{ padding:"11px 22px",borderRadius:50,border:`1px solid ${T.cardBorder}`,background:"transparent",color:T.creamDim,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>← Back</button>
                )}
                {doctorStep===1 ? (
                  <Btn style={{ flex:1,justifyContent:"center" }} onClick={()=>{
                    if(!fullName.trim()) return setError("Full name required.");
                    if(!email.trim()) return setError("Email required.");
                    if(!password||password.length<6) return setError("Password must be 6+ characters.");
                    if(!specialization) return setError("Please select a specialization.");
                    if(!license.trim()) return setError("License number required.");
                    if(!hospital.trim()) return setError("Hospital name required.");
                    setError(""); setDoctorStep(2);
                  }}>Continue → Availability & Bio</Btn>
                ) : (
                  <Btn style={{ flex:1,justifyContent:"center",opacity:loading?0.7:1 }} onClick={handleSubmit}>
                    {loading?"Creating Account…":"Create Doctor Account →"}
                  </Btn>
                )}
              </div>
            ) : (
              <Btn onClick={handleSubmit} style={{ width:"100%",justifyContent:"center",marginTop:4,opacity:loading?0.7:1 }}>
                {loading?"Please wait…":tab==="login"?`Sign In as ${mode==="doctor"?"Doctor":"Patient"} →`:"Create Account →"}
              </Btn>
            )}
          </div>

          <div style={{ textAlign:"center",marginTop:20 }}>
            <button onClick={()=>setView("landing")} style={{ background:"none",border:"none",color:T.creamFaint,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>← Back to Home</button>
          </div>
        </DarkCard>
      </div>
    </div>
  );
}
