/**
 * AssessmentContext v3
 * Holds raw data from all 5 test modules + API response.
 */
import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

export function AssessmentProvider({ children }) {
  const [speechData,    setSpeechData]    = useState(null);
  const [memoryData,    setMemoryData]    = useState(null);
  const [reactionData,  setReactionData]  = useState(null);
  const [stroopData,    setStroopData]    = useState(null);
  const [tapData,       setTapData]       = useState(null);
  const [fluencyData,   setFluencyData]   = useState(null);
  const [digitSpanData, setDigitSpanData] = useState(null);
  const [profile,      setProfile]      = useState(() => {
    // Try to load from localStorage for persistence
    const stored = localStorage.getItem('neuroaid_profile');
    return stored ? JSON.parse(stored) : null;
  });
  const [apiResult,    setApiResult]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  // Persist profile to localStorage
  function updateProfile(newProfile) {
    setProfile(newProfile);
    localStorage.setItem('neuroaid_profile', JSON.stringify(newProfile));
  }

  const completedCount = [speechData, memoryData, reactionData, stroopData, tapData, fluencyData, digitSpanData].filter(Boolean).length;

  function reset() {
    setSpeechData(null); setMemoryData(null); setReactionData(null);
    setStroopData(null); setTapData(null); setFluencyData(null); setDigitSpanData(null);
    setApiResult(null);  setError(null);
    setProfile(null); localStorage.removeItem('neuroaid_profile');
  }

  return (
    <Ctx.Provider value={{
      speechData,   setSpeechData,
      memoryData,   setMemoryData,
      reactionData, setReactionData,
      stroopData,   setStroopData,
      tapData,      setTapData,
      fluencyData,  setFluencyData,
      digitSpanData, setDigitSpanData,
      profile,      setProfile: updateProfile,
      apiResult,    setApiResult,
      loading,      setLoading,
      error,        setError,
      completedCount,
      reset,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAssessment = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAssessment must be inside AssessmentProvider");
  return ctx;
};
