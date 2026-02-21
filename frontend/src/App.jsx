import { useState } from "react";
import { injectStyles } from "./utils/theme";
import { Shell } from "./components/RiskDashboard";
import { AssessmentProvider } from "./context/AssessmentContext";

import LandingPage     from "./pages/LandingPage";
import AboutPage       from "./pages/AboutPage";
import LoginPage       from "./pages/Login";
import UserDashboard   from "./pages/UserDashboard";
import AssessmentHub   from "./pages/AssessmentHub";
import ResultsPage     from "./pages/ResultsPage";
import ProgressPage    from "./pages/ProgressPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDetail   from "./pages/PatientDetail";

import SpeechTest   from "./components/SpeechTest";
import MemoryTest   from "./components/MemoryTest";
import ReactionTest from "./components/ReactionTest";
import StroopTest   from "./components/StroopTest";
import TapTest      from "./components/TapTest";

injectStyles();

export default function App() {
  const [view, setView]       = useState("landing");
  const [role, setRole]       = useState("user");
  const [page, setPage]       = useState("dashboard");
  const [patient, setPatient] = useState(null);

  function handleView(v) {
    setView(v);
    if (v === "dashboard")        setPage("dashboard");
    if (v === "doctor-dashboard") setPage("doctor-dashboard");
  }

  if (view === "landing") return <LandingPage setView={handleView} />;
  if (view === "about")   return <AboutPage   setView={handleView} />;
  if (view === "login")   return <LoginPage   setView={handleView} setRole={setRole} />;

  const userPages = {
    "dashboard":   <UserDashboard  setPage={setPage} />,
    "assessments": <AssessmentHub  setPage={setPage} />,
    "speech":      <SpeechTest     setPage={setPage} />,
    "memory":      <MemoryTest     setPage={setPage} />,
    "reaction":    <ReactionTest   setPage={setPage} />,
    "stroop":      <StroopTest     setPage={setPage} />,
    "tap":         <TapTest        setPage={setPage} />,
    "results":     <ResultsPage    setPage={setPage} />,
    "progress":    <ProgressPage />,
  };

  const doctorPages = {
    "doctor-dashboard": <DoctorDashboard setPage={setPage} setSelectedPatient={setPatient} />,
    "patients":         <DoctorDashboard setPage={setPage} setSelectedPatient={setPatient} />,
    "patient-detail":   <PatientDetail   setPage={setPage} patient={patient} />,
  };

  const content = role === "doctor"
    ? (doctorPages[page] ?? doctorPages["doctor-dashboard"])
    : (userPages[page]   ?? userPages["dashboard"]);

  return (
    <AssessmentProvider>
      <Shell role={role} page={page} setPage={setPage} setView={handleView}>
        {content}
      </Shell>
    </AssessmentProvider>
  );
}
