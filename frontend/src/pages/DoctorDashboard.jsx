import { useState } from "react";
import { T } from "../utils/theme";
import { DarkCard, Btn, Badge } from "../components/RiskDashboard";

const PATIENTS = [
  { id: 1, name: "Sarah Chen",     age: 68, risk: "High",     score: 42, last: "Feb 18" },
  { id: 2, name: "Robert Maia",    age: 72, risk: "Moderate", score: 61, last: "Feb 17" },
  { id: 3, name: "Eleanor Walsh",  age: 65, risk: "Low",      score: 78, last: "Feb 16" },
  { id: 4, name: "James Okafor",   age: 70, risk: "Moderate", score: 58, last: "Feb 15" },
  { id: 5, name: "Patricia Liu",   age: 63, risk: "Low",      score: 83, last: "Feb 14" },
  { id: 6, name: "Thomas Bell",    age: 75, risk: "High",     score: 38, last: "Feb 13" },
];

export default function DoctorDashboard({ setPage, setSelectedPatient }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = PATIENTS.filter(p =>
    (filter === "All" || p.risk === filter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const riskColor = r => r === "High" ? T.red : r === "Moderate" ? T.amber : T.green;

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, letterSpacing: -1, marginBottom: 6 }}>Doctor Dashboard</h1>
        <p style={{ color: T.creamFaint, fontSize: 14 }}>Patient cognitive screening overview</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Total",     val: 6, icon: "👥", c: T.cream },
          { label: "High Risk", val: 2, icon: "●",  c: T.red   },
          { label: "Moderate",  val: 2, icon: "●",  c: T.amber  },
          { label: "Low Risk",  val: 2, icon: "●",  c: T.green  },
        ].map(s => (
          <DarkCard key={s.label} style={{ padding: 20 }}>
            <div style={{ fontSize: 20, color: s.c, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, color: T.cream, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: T.creamFaint, marginTop: 4 }}>{s.label}</div>
          </DarkCard>
        ))}
      </div>
      <DarkCard style={{ padding: 16, marginBottom: 14 }} hover={false}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.cardBorder}`, background: T.bg3, fontSize: 13, color: T.cream, outline: "none", fontFamily: "'DM Sans',sans-serif" }} />
          {["All","High","Moderate","Low"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 50, border: `1px solid ${filter === f ? T.red : T.cardBorder}`, background: filter === f ? "rgba(232,64,64,0.15)" : "transparent", color: filter === f ? T.red : T.creamFaint, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>{f}</button>
          ))}
        </div>
      </DarkCard>
      <DarkCard style={{ padding: 0, overflow: "hidden" }} hover={false}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.cardBorder}` }}>
              {["Patient","Age","Risk","Score","Last Session",""].map(h => (
                <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.creamFaint, letterSpacing: 1, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.cardBorder}` : "none", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${riskColor(p.risk)}18`, border: `1px solid ${riskColor(p.risk)}44`, display: "flex", alignItems: "center", justifyContent: "center", color: T.cream, fontWeight: 700, fontSize: 13 }}>{p.name[0]}</div>
                    <span style={{ fontWeight: 600, color: T.cream, fontSize: 14 }}>{p.name}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 20px", color: T.creamFaint, fontSize: 14 }}>{p.age}</td>
                <td style={{ padding: "16px 20px" }}><Badge level={p.risk} /></td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 700, color: T.cream, fontSize: 16 }}>{p.score}</span>
                    <div style={{ width: 56, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${p.score}%`, background: p.score >= 70 ? T.green : p.score >= 50 ? T.amber : T.red, borderRadius: 2 }} />
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 20px", color: T.creamFaint, fontSize: 14 }}>{p.last}</td>
                <td style={{ padding: "16px 20px" }}>
                  <Btn small variant="ghost" onClick={() => { setSelectedPatient(p); setPage("patient-detail"); }}>View →</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DarkCard>
    </div>
  );
}
