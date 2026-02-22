"""
schemas.py — NeuroAid v4
Age-normalized scoring, 4-tier thresholds, composite risk score.
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

class UserProfile(BaseModel):
    age: Optional[int] = None
    education_level: Optional[int] = None   # 1–5
    sleep_hours: Optional[float] = None
    handedness: Optional[str] = None
    gender: Optional[str] = None

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

# ── Feature vector (18 features) ──────────────────────────────────────────────

class FeatureVector(BaseModel):
    # Speech (5)
    wpm: float
    speed_deviation: float
    speech_variability: float
    pause_ratio: float
    speech_start_delay: float
    # Memory (5)
    immediate_recall_accuracy: float
    delayed_recall_accuracy: float
    intrusion_count: float
    recall_latency: float
    order_match_ratio: float
    # Reaction (5)
    mean_rt: float
    std_rt: float
    min_rt: float
    reaction_drift: float
    miss_count: float
    # Executive (2)
    stroop_error_rate: float
    stroop_rt: float
    # Motor (1)
    tap_interval_std: float

# ── Disease risk levels ────────────────────────────────────────────────────────

class DiseaseRiskLevels(BaseModel):
    alzheimers: str
    dementia: str
    parkinsons: str

# ── Response ───────────────────────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    # Domain scores (0–100, higher = healthier, age-normalized)
    speech_score: float
    memory_score: float
    reaction_score: float
    executive_score: float
    motor_score: float

    # Composite risk score (0–100, higher = MORE risk)
    # Weights: Memory 30%, Speech 25%, Executive 20%, Reaction 15%, Motor 10%
    composite_risk_score: float = 0.0
    composite_risk_tier: str = "Low"     # Low | Mild Concern | Moderate Risk | High Risk

    # Disease-specific probabilities (0–1)
    alzheimers_risk: float
    dementia_risk: float
    parkinsons_risk: float

    # Risk level labels (4-tier)
    risk_levels: DiseaseRiskLevels

    # Feature transparency
    feature_vector: Optional[FeatureVector] = None
    attention_variability_index: Optional[float] = None

    # Flags
    age_normalized: bool = False   # True when a valid age was provided

    disclaimer: str = (
        "⚠️ This is a behavioral screening tool only. "
        "It is NOT a medical diagnosis. Always consult a qualified "
        "neurologist or physician for clinical evaluation."
    )
