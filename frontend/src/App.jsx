import { useState } from "react";
import { injectStyles } from "./utils/theme";
import { Shell } from "./components/RiskDashboard";
import { AssessmentProvider } from "./context/AssessmentContext";
import { getUser, isLoggedIn, logout } from "./services/api";

import LandingPage     from "./pages/LandingPage";
import AboutPage       from "./pages/AboutPage";
import LoginPage       from "./pages/Login";
import UserDashboard   from "./pages/UserDashboard";
import AssessmentHub   from "./pages/AssessmentHub";
import ResultsPage     from "./pages/ResultsPage";
import ProgressPage    from "./pages/ProgressPage";
import DoctorDashboard from "./pages/DoctorDashboard";
import MessagesPage    from "./pages/MessagesPage";
import DoctorHome      from "./pages/DoctorHome";
import PatientDetail   from "./pages/PatientDetail";
import ContentManager  from "./pages/ContentManager";

import SpeechTest   from "./components/SpeechTest";
import MemoryTest   from "./components/MemoryTest";
import ReactionTest from "./components/ReactionTest";
import StroopTest   from "./components/StroopTest";
import TapTest      from "./components/TapTest";

injectStyles();

function getInitialState() {
  // On tab load, restore role and view from sessionStorage (per-tab, supports multiple users)
  const user = getUser();
  if (user && isLoggedIn()) {
    const role     = user.role === "doctor" ? "doctor" : "user";
    const view     = role === "doctor" ? "doctor-dashboard" : "dashboard";
    const page     = role === "doctor" ? "doctor-dashboard" : "dashboard";
    return { view, role, page, user };
  }
  return { view: "landing", role: "user", page: "dashboard", user: null };
}

export default function App() {
  const init = getInitialState();

  const [view,        setViewState]   = useState(init.view);
  const [role,        setRole]        = useState(init.role);
  const [page,        setPage]        = useState(init.page);
  const [patient,     setPatient]     = useState(null);
  const [currentUser, setCurrentUser] = useState(init.user);

  async function handleLogout() {
    await logout();
    setCurrentUser(null);
    setRole("user");
    setPage("dashboard");
    setViewState("landing");
  }

  function setView(v) {
    if (v === "logout") { handleLogout(); return; }
    if (v === "dashboard")        { setPage("dashboard");        }
    if (v === "doctor-dashboard") { setPage("doctor-dashboard"); }
    setViewState(v);
  }

  // Show landing / about / login if not in app shell
  if (view === "landing") return <LandingPage setView={setView} currentUser={currentUser} />;
  if (view === "about")   return <AboutPage   setView={setView} />;
  if (view === "login")   return (
    <LoginPage
      setView={setView}
      setRole={r => {
        // Map "user"→"user", "doctor"→"doctor"
        setRole(r === "doctor" ? "doctor" : "user");
      }}
      setCurrentUser={setCurrentUser}
    />
  );

  // ── Patient pages ──────────────────────────────────────────────────────────
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
    "messages":    <MessagesPage />,
  };

  // ── Doctor pages ───────────────────────────────────────────────────────────
  const doctorPages = {
    "doctor-dashboard": <DoctorHome      setPage={setPage} setSelectedPatient={setPatient} />,
    "patients":         <DoctorDashboard setPage={setPage} setSelectedPatient={setPatient} />,
    "patient-detail":   <PatientDetail   setPage={setPage} patient={patient} />,
    "messages":         <MessagesPage />,
    "content":          <ContentManager />,
  };

  const isDoctor = role === "doctor";
  const content  = isDoctor
    ? (doctorPages[page] ?? doctorPages["doctor-dashboard"])
    : (userPages[page]   ?? userPages["dashboard"]);

  return (
    <AssessmentProvider>
      <Shell role={role} page={page} setPage={setPage} setView={setView} currentUser={currentUser} onLogout={handleLogout}>
        {content}
      </Shell>
    </AssessmentProvider>
  );
}