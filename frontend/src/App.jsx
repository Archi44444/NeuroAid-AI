import { useState } from "react";
import { injectStyles } from "./utils/theme";
import { Shell } from "./components/RiskDashboard";
import { AssessmentProvider } from "./context/AssessmentContext";

import LandingPage     from "./pages/LandingPage";
import AboutPage       from "./pages/AboutPage";
import LoginPage       from "./pages/Login";
import ProfileSetup    from "./pages/ProfileSetup";
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
  const [user, setUser]       = useState(null);

  function handleView(v) {
    setView(v);
    if (v === "dashboard")        setPage("dashboard");
    if (v === "doctor-dashboard") setPage("doctor-dashboard");
  }

  function handleLogin({ name, email, uid, role: r, isNew }) {
    setUser({ name, email, uid, profileComplete: !isNew });
    setRole(r || "user");
    if (r === "doctor") {
      handleView("doctor-dashboard");
    } else if (isNew) {
      setView("profile-setup");
    } else {
      handleView("dashboard");
    }
  }

  function handleProfileComplete(profileData) {
    setUser(u => ({ ...u, ...profileData, profileComplete: true }));
    handleView("dashboard");
  }

  if (view === "landing")       return <LandingPage setView={handleView} />;
  if (view === "about")         return <AboutPage   setView={handleView} />;
  if (view === "login")         return <LoginPage   setView={handleView} setRole={setRole} onLogin={handleLogin} />;
  if (view === "profile-setup") return <ProfileSetup onComplete={handleProfileComplete} user={user} />;

  const userPages = {
    "dashboard":   <UserDashboard  setPage={setPage} user={user} />,
    "assessments": <AssessmentHub  setPage={setPage} />,
    "speech":      <SpeechTest     setPage={setPage} />,
    "memory":      <MemoryTest     setPage={setPage} />,
    "reaction":    <ReactionTest   setPage={setPage} />,
    "stroop":      <StroopTest     setPage={setPage} />,
    "tap":         <TapTest        setPage={setPage} />,
    "results":     <ResultsPage    setPage={setPage} user={user} />,
    "progress":    <ProgressPage   user={user} />,
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
      <Shell role={role} page={page} setPage={setPage} setView={handleView} user={user}>
        {content}
      </Shell>
    </AssessmentProvider>
  );
}
