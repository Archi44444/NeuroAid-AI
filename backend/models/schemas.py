"""
schemas.py — NeuroAid v3.1
18-feature pipeline with disease-specific multi-model output.

v3.1 additions:
  - UserProfile: medical_conditions, fatigue_flags, full condition set
  - AnalyzeResponse: confidence_score, recommend_retest, retest_message
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ── Sub-payloads from frontend ─────────────────────────────────────────────────

class SpeechData(BaseModel):
    audio_b64: Optional[str] = None
    wpm: Optional[float] = None
    speed_deviation: Optional[float] = None
    speech_speed_variability: Optional[float] = None
    pause_ratio: Optional[float] = None
    completion_ratio: Optional[float] = None
    restart_count: Optional[int] = 0
    speech_start_delay: Optional[float] = None

class MemoryData(BaseModel):
    word_recall_accuracy: float = Field(default=50.0, ge=0, le=100)
    pattern_accuracy: float = Field(default=50.0, ge=0, le=100)
    delayed_recall_accuracy: Optional[float] = Field(default=None, ge=0, le=100)
    recall_latency_seconds: Optional[float] = None
    order_match_ratio: Optional[float] = None
    intrusion_count: Optional[int] = 0

class ReactionData(BaseModel):
    times: List[float] = []
    miss_count: Optional[int] = 0
    initiation_delay: Optional[float] = None

class StroopData(BaseModel):
    total_trials: int = 0
    error_count: int = 0
    mean_rt: Optional[float] = None
    incongruent_rt: Optional[float] = None

class TapData(BaseModel):
    intervals: List[float] = []
    tap_count: int = 0

class FluencyData(BaseModel):
    word_count: int = 0
    repetitions: int = 0
    avg_pause_seconds: Optional[float] = None
    total_words: int = 0

class DigitSpanData(BaseModel):
    max_forward_span: int = 0
    total_trials: int = 0
    accuracy: Optional[float] = None

# ✅ LAYER 3 — Medical conditions for risk multipliers
class MedicalConditions(BaseModel):
    """Medical condition flags. Each flag triggers a γ risk multiplier."""
    diabetes: bool = False
    hypertension: bool = False
    stroke_history: bool = False
    family_alzheimers: bool = False
    parkinsons_dx: bool = False
    depression: bool = False
    thyroid_disorder: bool = False

# ✅ LAYER 4 — Fatigue/temporary factors
class FatigueFlags(BaseModel):
    """Temporary factors that lower confidence in results."""
    tired: bool = False
    sleep_deprived: bool = False   # < 5 hours sleep last night
    sick: bool = False
    anxious: bool = False

class UserProfile(BaseModel):
    age: Optional[int] = None
    education_level: Optional[int] = None       # 1–5 (1=no formal, 5=postgrad)
    sleep_hours: Optional[float] = None
    family_history: Optional[bool] = False
    existing_diagnosis: Optional[bool] = False
    sleep_quality: Optional[str] = "normal"     # poor/fair/normal/good/excellent
    # ✅ NEW v3.1
    medical_conditions: Optional[MedicalConditions] = None
    fatigue_flags: Optional[FatigueFlags] = None

# ── Main request ───────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    speech_audio: Optional[str] = None
    memory_results: Dict[str, float] = {"word_recall_accuracy": 50.0, "pattern_accuracy": 50.0}
    reaction_times: List[float] = []
    speech: Optional[SpeechData] = None
    memory: Optional[MemoryData] = None
    reaction: Optional[ReactionData] = None
    stroop: Optional[StroopData] = None
    tap: Optional[TapData] = None
    profile: Optional[UserProfile] = None
    fluency: Optional[FluencyData] = None
    digit_span: Optional[DigitSpanData] = None

# ── Feature vector (18 features) ──────────────────────────────────────────────

class FeatureVector(BaseModel):
    wpm: float
    speed_deviation: float
    speech_variability: float
    pause_ratio: float
    speech_start_delay: float
    immediate_recall_accuracy: float
    delayed_recall_accuracy: float
    intrusion_count: float
    recall_latency: float
    order_match_ratio: float
    mean_rt: float
    std_rt: float
    min_rt: float
    reaction_drift: float
    miss_count: float
    stroop_error_rate: float
    stroop_rt: float
    tap_interval_std: float

# ── Disease risk levels ────────────────────────────────────────────────────────

class DiseaseRiskLevels(BaseModel):
    alzheimers: str
    dementia: str
    parkinsons: str

# ── Response ───────────────────────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    # Domain scores (0–100, higher = healthier)
    speech_score: float
    memory_score: float
    reaction_score: float
    executive_score: float
    motor_score: float
    # ✅ Education-adjusted memory score (Layer 2)
    adjusted_memory_score: Optional[float] = None
    # Composite cognitive risk (0–100, higher = riskier)
    composite_risk_score: Optional[float] = None
    composite_risk_level: Optional[str] = None
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None
    model_uncertainty: Optional[float] = None
    # ✅ NEW: Logistic risk probability (Layer 1-4 pipeline)
    logistic_risk_probability: Optional[float] = None
    logistic_risk_level: Optional[str] = None    # non-diagnostic safe language
    # ✅ NEW: Confidence scoring (Layer 4)
    confidence_score: Optional[float] = None
    recommend_retest: Optional[bool] = None
    retest_message: Optional[str] = None
    # Disease-specific probabilities (0–1)
    alzheimers_risk: float
    dementia_risk: float
    parkinsons_risk: float
    risk_levels: DiseaseRiskLevels
    # Feature transparency
    feature_vector: Optional[FeatureVector] = None
    attention_variability_index: Optional[float] = None
    # ✅ Disclaimer always present
    disclaimer: str = (
        "⚠️ This is NOT a diagnosis. This tool identifies cognitive risk indicators only. "
        "Always consult a qualified neurologist or physician for clinical evaluation."
    )
