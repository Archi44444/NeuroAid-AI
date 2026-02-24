"""
schemas.py — NeuroAid v3.2
Pydantic models for request/response validation.
"""
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


# ── Test sub-payloads ──────────────────────────────────────────────────────────

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

class DigitSpanData(BaseModel):
    max_forward_span: int = 0
    total_trials: int = 0
    accuracy: Optional[float] = None

# ── Profile & flags ────────────────────────────────────────────────────────────

class MedicalConditions(BaseModel):
    """Medical condition flags — each triggers a γ risk multiplier."""
    diabetes: bool = False
    hypertension: bool = False
    stroke_history: bool = False
    family_alzheimers: bool = False
    parkinsons_dx: bool = False
    depression: bool = False
    thyroid_disorder: bool = False

class FatigueFlags(BaseModel):
    """Temporary factors that lower confidence in results."""
    tired: bool = False
    sleep_deprived: bool = False
    sick: bool = False
    anxious: bool = False

class UserProfile(BaseModel):
    age: Optional[int] = None
    education_level: Optional[int] = None       # 1–5
    sleep_hours: Optional[float] = None
    family_history: Optional[bool] = False
    existing_diagnosis: Optional[bool] = False
    sleep_quality: Optional[str] = "normal"
    medical_conditions: Optional[MedicalConditions] = None
    fatigue_flags: Optional[FatigueFlags] = None

# ── Request ────────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    speech_audio: Optional[str] = None
    memory_results: Dict[str, float] = {"word_recall_accuracy": 50.0, "pattern_accuracy": 50.0}
    reaction_times: List[float] = []
    speech: Optional[SpeechData] = None
    memory: Optional[MemoryData] = None
    reaction: Optional[ReactionData] = None
    stroop: Optional[StroopData] = None
    tap: Optional[TapData] = None
    fluency: Optional[FluencyData] = None
    digit_span: Optional[DigitSpanData] = None
    profile: Optional[UserProfile] = None

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

# ── Response ───────────────────────────────────────────────────────────────────

class DiseaseRiskLevels(BaseModel):
    alzheimers: str
    dementia: str
    parkinsons: str

class RiskDrivers(BaseModel):
    """Explainability — top contributors to the overall risk indicator."""
    memory_recall_contribution_pct: float
    speech_delay_contribution_pct: float
    reaction_time_contribution_pct: float
    executive_function_contribution_pct: float
    motor_consistency_contribution_pct: float

class ModelValidation(BaseModel):
    """Simulated validation metrics (synthetic dataset — see docs/SCORING_ENGINE.md)."""
    sensitivity: float = 0.82
    specificity: float = 0.78
    auc: float = 0.85
    note: str = "Simulated validation due to absence of clinical dataset."

class AnalyzeResponse(BaseModel):
    # Domain scores (0–100, higher = healthier)
    speech_score: float
    memory_score: float
    reaction_score: float
    executive_score: float
    motor_score: float
    adjusted_memory_score: Optional[float] = None

    # Composite risk indicator
    composite_risk_score: Optional[float] = None
    composite_risk_level: Optional[str] = None
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None
    confidence_interval_label: Optional[str] = None   # e.g. "0.72 (±0.06)"
    model_uncertainty: Optional[float] = None

    # Logistic probability
    logistic_risk_probability: Optional[float] = None
    logistic_risk_level: Optional[str] = None         # non-diagnostic language

    # Confidence / retest
    confidence_score: Optional[float] = None
    recommend_retest: Optional[bool] = None
    retest_message: Optional[str] = None

    # Disease-specific indicators
    alzheimers_risk: float
    dementia_risk: float
    parkinsons_risk: float
    risk_levels: DiseaseRiskLevels

    # ✅ NEW: Explainability
    risk_drivers: Optional[RiskDrivers] = None

    # ✅ NEW: Simulated validation metrics
    model_validation: Optional[ModelValidation] = None

    # Feature transparency
    feature_vector: Optional[FeatureVector] = None
    attention_variability_index: Optional[float] = None

    # Disclaimer — always present
    disclaimer: str = (
        "⚠️ This tool does NOT provide medical diagnosis. "
        "It provides early cognitive risk signals for further evaluation. "
        "Always consult a qualified neurologist or physician."
    )
    screening_reference: str = (
        "Screening approach inspired by principles used in the Mini-Mental State Examination (MMSE) "
        "and Montreal Cognitive Assessment (MoCA) across domains: Memory, Language, Attention, and Executive Function."
    )
