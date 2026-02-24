"""
ai_service.py — NeuroAid v3.2
================================
18-feature pipeline with disease-specific logistic models for:
  - Alzheimer's disease  (memory-dominant)
  - General Dementia     (attention + executive dominant)
  - Parkinson's disease  (motor + speech initiation dominant)

Feature vector (18):
  Speech  (5): wpm, speed_deviation, speech_variability, pause_ratio, speech_start_delay
  Memory  (5): immediate_recall_accuracy, delayed_recall_accuracy, intrusion_count, recall_latency, order_match_ratio
  Reaction(5): mean_rt, std_rt, min_rt, reaction_drift, miss_count
  Executive(2): stroop_error_rate, stroop_rt
  Motor   (1): tap_interval_std

All domain scores: 0–100, HIGHER = healthier.
Risk probabilities: [0, 1].
"""

import math
import random
from typing import Optional, Tuple

import numpy as np

from models.schemas import (
    SpeechData, MemoryData, ReactionData,
    StroopData, TapData, UserProfile, FeatureVector,
    RiskDrivers, ModelValidation,
)

# ═══════════════════════════════════════════════════════════════════════════════
# DISEASE MODEL WEIGHTS
# Positive weight = higher feature value increases disease risk.
# ═══════════════════════════════════════════════════════════════════════════════

ALZ_WEIGHTS = np.array([
    -0.010, 0.008, 0.006, 0.015, 0.005,   # speech
    -0.030, -0.035, 0.020, 0.015, -0.020,  # memory (PRIMARY)
     0.003, 0.002, 0.001, 0.003, 0.005,   # reaction
     0.005, 0.002, 0.002,                  # executive + motor
])
ALZ_BIAS = 0.35

DEM_WEIGHTS = np.array([
    -0.008, 0.005, 0.005, 0.008, 0.006,
    -0.020, -0.018, 0.012, 0.010, -0.012,
     0.025, 0.020, 0.010, 0.018, 0.025,   # reaction (PRIMARY)
     0.030, 0.015, 0.008,                  # executive (PRIMARY)
])
DEM_BIAS = 0.25

PARK_WEIGHTS = np.array([
    -0.015, 0.012, 0.018, 0.010, 0.020,   # speech initiation (PRIMARY)
    -0.005, -0.005, 0.005, 0.008, -0.005,
     0.030, 0.025, 0.020, 0.015, 0.020,   # reaction (PRIMARY)
     0.008, 0.010, 0.040,                  # motor (PRIMARY)
])
PARK_BIAS = 0.20

# ── Medical condition γ multipliers ──────────────────────────────────────────
_CONDITION_MULTIPLIERS = {
    "diabetes": 0.04, "hypertension": 0.05, "stroke_history": 0.08,
    "family_alzheimers": 0.06, "parkinsons_dx": 0.10,
    "depression": 0.04, "thyroid_disorder": 0.03,
}

# ── Education correction (cognitive reserve) ──────────────────────────────────
_EDUCATION_CORRECTION = {1: +5.0, 2: +3.0, 3: 0.0, 4: 0.0, 5: -2.0}

# ── Fatigue confidence penalties ──────────────────────────────────────────────
_FATIGUE_FACTORS = {
    "tired": 0.10, "sleep_deprived": 0.12, "sick": 0.08, "anxious": 0.06,
}
_FATIGUE_CONFIDENCE_THRESHOLD = 0.75
_RETEST_MESSAGE = "Results may be temporarily affected by fatigue. Please retest after adequate rest."


# ═══════════════════════════════════════════════════════════════════════════════
# UTILITIES
# ═══════════════════════════════════════════════════════════════════════════════

def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + np.exp(-float(np.clip(x, -500, 500))))


def _age_normalization_factor(age: Optional[int]) -> float:
    """Returns a leniency multiplier for older age groups (normal cognitive decline)."""
    if not age or age < 20: return 1.0
    elif age <= 40: return 1.0
    elif age <= 60: return 1.1
    elif age <= 75: return 1.2
    elif age <= 85: return 1.25
    else:           return 1.3


def _predict_disease(feature_vec: np.ndarray, weights: np.ndarray, bias: float) -> float:
    """Logistic regression forward pass."""
    return round(float(_sigmoid(float(np.dot(weights, feature_vec)) + bias)), 3)


def _prob_to_level(prob: float) -> str:
    if prob < 0.35:  return "Low"
    elif prob < 0.65: return "Moderate"
    else:            return "High"


# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE EXTRACTORS
# ═══════════════════════════════════════════════════════════════════════════════

def extract_speech_features(audio_b64=None, speech: Optional[SpeechData] = None) -> Tuple[float, dict]:
    if speech:
        wpm       = speech.wpm or _estimate_wpm(audio_b64)
        speed_dev = speech.speed_deviation or random.uniform(5, 20)
        spvar     = speech.speech_speed_variability or random.uniform(3, 15)
        pause_r   = speech.pause_ratio if speech.pause_ratio is not None else 0.15
        compl_r   = speech.completion_ratio if speech.completion_ratio is not None else 1.0
        restarts  = speech.restart_count or 0
        start_del = speech.speech_start_delay or random.uniform(0.5, 3.0)
    else:
        wpm       = _estimate_wpm(audio_b64)
        speed_dev = random.uniform(5, 20)
        spvar     = random.uniform(3, 15)
        pause_r   = random.uniform(0.10, 0.25)
        compl_r   = random.uniform(0.80, 1.0)
        restarts  = 0
        start_del = random.uniform(0.5, 3.0)

    feats = dict(wpm=round(wpm, 2), speed_deviation=round(speed_dev, 2),
                 speech_variability=round(spvar, 2), pause_ratio=round(pause_r, 4),
                 speech_start_delay=round(start_del, 2))

    wpm_score    = 100 - abs(wpm - 140) / 140 * 50
    var_pen      = min(spvar * 1.5, 30)
    pause_pen    = min(pause_r * 80, 30)
    compl_bonus  = compl_r * 20
    restart_pen  = min(restarts * 5, 20)
    score = float(np.clip(wpm_score - var_pen - pause_pen + compl_bonus - restart_pen + random.uniform(-2, 2), 0, 100))
    return round(score, 2), feats


def _estimate_wpm(audio_b64) -> float:
    if not audio_b64: return round(random.uniform(110, 160), 1)
    return round(120 + 40 * min(len(audio_b64) / 10_000, 1.0) + random.uniform(-10, 10), 1)


def extract_memory_features(memory_results: dict, memory: Optional[MemoryData] = None) -> Tuple[float, dict]:
    if memory:
        imm    = memory.word_recall_accuracy
        delyd  = memory.delayed_recall_accuracy if memory.delayed_recall_accuracy is not None else imm * random.uniform(0.8, 1.0)
        latenc = memory.recall_latency_seconds or 3.0
        order  = memory.order_match_ratio if memory.order_match_ratio is not None else 1.0
        intrus = memory.intrusion_count or 0
    else:
        imm    = memory_results.get("word_recall_accuracy", 50.0)
        delyd  = memory_results.get("pattern_accuracy", 50.0)
        latenc = random.uniform(2, 8)
        order  = random.uniform(0.6, 1.0)
        intrus = random.randint(0, 4)

    feats = dict(immediate_recall_accuracy=round(imm, 2), delayed_recall_accuracy=round(delyd, 2),
                 intrusion_count=float(intrus), recall_latency=round(latenc, 2),
                 order_match_ratio=round(order, 4))

    accuracy_score = (imm + delyd) / 2
    latency_pen    = min((latenc - 2) * 4, 25) if latenc > 2 else 0
    order_bonus    = order * 15
    intrusion_pen  = min(intrus * 5, 25)
    score = float(np.clip(accuracy_score - latency_pen + order_bonus - intrusion_pen + random.uniform(-2, 2), 0, 100))
    return round(score, 2), feats


def extract_reaction_features(reaction_times: list, reaction: Optional[ReactionData] = None) -> Tuple[float, dict]:
    times      = reaction.times if reaction else reaction_times
    miss_count = reaction.miss_count or 0 if reaction else 0
    init_delay = (reaction.initiation_delay or random.uniform(150, 400)) if reaction else random.uniform(150, 400)

    if not times:
        times = [random.uniform(250, 450) for _ in range(5)]

    arr     = np.array(times, dtype=float)
    mean_rt = float(np.mean(arr))
    std_rt  = float(np.std(arr))
    min_rt  = float(np.min(arr))
    half    = len(arr) // 2
    drift   = float(np.mean(arr[half:]) - np.mean(arr[:half])) if half > 0 else 0.0

    feats = dict(mean_rt=round(mean_rt, 2), std_rt=round(std_rt, 2), min_rt=round(min_rt, 2),
                 reaction_drift=round(drift, 2), miss_count=float(miss_count),
                 initiation_delay=round(init_delay, 2))

    speed_score = max(0, min(100, 100 - ((mean_rt - 300) / 900) * 100))
    var_score   = max(0, min(100, 100 - (std_rt / 350) * 100))
    drift_pen   = min(max((abs(drift) - 100) / 20, 0), 15)
    miss_pen    = min(miss_count * 8, 25) if miss_count > 0 else 0
    score = float(np.clip(0.6 * speed_score + 0.3 * var_score - drift_pen - miss_pen + random.uniform(-1, 1), 0, 100))
    return round(score, 2), feats


def extract_executive_features(stroop: Optional[StroopData] = None) -> Tuple[float, dict]:
    if stroop and stroop.total_trials > 0:
        error_rate = stroop.error_count / stroop.total_trials
        stroop_rt  = stroop.incongruent_rt or stroop.mean_rt or random.uniform(450, 800)
    else:
        error_rate = random.uniform(0.05, 0.30)
        stroop_rt  = random.uniform(450, 800)

    feats     = dict(stroop_error_rate=round(error_rate, 4), stroop_rt=round(stroop_rt, 2))
    error_pen = min(error_rate * 100, 50)
    rt_pen    = min((stroop_rt - 800) / 600 * 30, 30) if stroop_rt > 800 else 0
    score = float(np.clip(100 - error_pen - rt_pen + random.uniform(-2, 2), 0, 100))
    return round(score, 2), feats


def extract_motor_features(tap: Optional[TapData] = None) -> Tuple[float, dict]:
    if tap and len(tap.intervals) >= 3:
        tap_std = float(np.std(np.array(tap.intervals, dtype=float)))
    else:
        tap_std = random.uniform(20, 120)

    feats   = dict(tap_interval_std=round(tap_std, 2))
    penalty = min(tap_std / 2, 60)
    score   = float(np.clip(100 - penalty + random.uniform(-2, 2), 0, 100))
    return round(score, 2), feats


# ═══════════════════════════════════════════════════════════════════════════════
# DISEASE RISK MODELS
# ═══════════════════════════════════════════════════════════════════════════════

def compute_disease_risks(fv: FeatureVector, profile: Optional[UserProfile] = None) -> dict:
    """Run three separate logistic models on the 18-feature vector."""
    vec = np.array([
        fv.wpm / 200.0, fv.speed_deviation / 50.0, fv.speech_variability / 30.0,
        fv.pause_ratio, fv.speech_start_delay / 5.0,
        fv.immediate_recall_accuracy / 100.0, fv.delayed_recall_accuracy / 100.0,
        fv.intrusion_count / 10.0, fv.recall_latency / 15.0, fv.order_match_ratio,
        fv.mean_rt / 800.0, fv.std_rt / 300.0, fv.min_rt / 600.0,
        fv.reaction_drift / 300.0, fv.miss_count / 10.0,
        fv.stroop_error_rate, fv.stroop_rt / 1000.0, fv.tap_interval_std / 200.0,
    ])

    age_factor = _age_normalization_factor(profile.age if profile else None)

    alz  = float(np.clip(_predict_disease(vec, ALZ_WEIGHTS,  ALZ_BIAS)  * age_factor, 0, 1))
    dem  = float(np.clip(_predict_disease(vec, DEM_WEIGHTS,  DEM_BIAS)  * age_factor, 0, 1))
    park = float(np.clip(_predict_disease(vec, PARK_WEIGHTS, PARK_BIAS) * age_factor, 0, 1))

    if profile:
        alz_adj = dem_adj = park_adj = 0.0
        if profile.age and profile.age > 65:
            alz_adj += 0.04; dem_adj += 0.03; park_adj += 0.03
        if profile.sleep_hours and profile.sleep_hours < 6:
            dem_adj += 0.03
        if profile.education_level and profile.education_level >= 4:
            alz_adj -= 0.03; dem_adj -= 0.02
        alz  = float(np.clip(alz  + alz_adj,  0, 1))
        dem  = float(np.clip(dem  + dem_adj,  0, 1))
        park = float(np.clip(park + park_adj, 0, 1))

    return {"alzheimers_risk": alz, "dementia_risk": dem, "parkinsons_risk": park}


def build_feature_vector(sf, mf, rf, ef, mof) -> FeatureVector:
    return FeatureVector(
        wpm=sf.get("wpm", 120), speed_deviation=sf.get("speed_deviation", 10),
        speech_variability=sf.get("speech_variability", 8), pause_ratio=sf.get("pause_ratio", 0.15),
        speech_start_delay=sf.get("speech_start_delay", 1.0),
        immediate_recall_accuracy=mf.get("immediate_recall_accuracy", 70),
        delayed_recall_accuracy=mf.get("delayed_recall_accuracy", 65),
        intrusion_count=mf.get("intrusion_count", 1),
        recall_latency=mf.get("recall_latency", 3.0),
        order_match_ratio=mf.get("order_match_ratio", 0.8),
        mean_rt=rf.get("mean_rt", 320), std_rt=rf.get("std_rt", 45),
        min_rt=rf.get("min_rt", 250), reaction_drift=rf.get("reaction_drift", 10),
        miss_count=rf.get("miss_count", 0),
        stroop_error_rate=ef.get("stroop_error_rate", 0.10),
        stroop_rt=ef.get("stroop_rt", 550),
        tap_interval_std=mof.get("tap_interval_std", 40),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# COMPOSITE RISK + CONFIDENCE INTERVAL
# ═══════════════════════════════════════════════════════════════════════════════

def compute_composite_risk_score(
    speech_score: float, memory_score: float, reaction_score: float,
    executive_score: float, motor_score: float, profile: Optional[UserProfile] = None,
) -> dict:
    """
    Weighted composite risk score with ±CI.
    Memory: 30%, Speech: 25%, Executive: 20%, Reaction: 15%, Motor: 10%
    Returns risk score [0-100] (higher = riskier) with confidence interval.
    """
    try:
        from config import MEMORY_WEIGHT, SPEECH_WEIGHT, EXECUTIVE_WEIGHT, REACTION_WEIGHT, MOTOR_WEIGHT
        from config import THRESHOLD_MILD, THRESHOLD_MODERATE, THRESHOLD_HIGH
    except ImportError:
        MEMORY_WEIGHT, SPEECH_WEIGHT, EXECUTIVE_WEIGHT, REACTION_WEIGHT, MOTOR_WEIGHT = 0.30, 0.25, 0.20, 0.15, 0.10
        THRESHOLD_MILD, THRESHOLD_MODERATE, THRESHOLD_HIGH = 50, 70, 85

    health_score = (
        MEMORY_WEIGHT * memory_score + SPEECH_WEIGHT * speech_score +
        EXECUTIVE_WEIGHT * executive_score + REACTION_WEIGHT * reaction_score +
        MOTOR_WEIGHT * motor_score
    )
    age_factor   = _age_normalization_factor(profile.age if profile else None)
    health_score = min(100, health_score * age_factor)
    risk_score   = 100 - health_score

    # Confidence interval — wider near 50% (most uncertain)
    base_uncertainty = 6.0  # ±6 base
    boundary_bonus   = max(0, 4.0 - abs(risk_score - 50) / 10)  # wider near 50
    half_ci          = base_uncertainty + boundary_bonus

    ci_lower = max(0, risk_score - half_ci)
    ci_upper = min(100, risk_score + half_ci)

    if risk_score   <= THRESHOLD_MILD:     level = "Low"
    elif risk_score <= THRESHOLD_MODERATE: level = "Mild Concern"
    elif risk_score <= THRESHOLD_HIGH:     level = "Moderate Risk"
    else:                                  level = "High Risk"

    return {
        "composite_risk_score": round(risk_score, 2),
        "risk_level": level,
        "confidence_lower": round(ci_lower, 2),
        "confidence_upper": round(ci_upper, 2),
        "confidence_interval_label": f"{round(risk_score, 1)} (±{round(half_ci, 1)})",
        "model_uncertainty": round(half_ci * 2, 1),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# MEDICAL SAFETY HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

def apply_education_memory_adjustment(memory_score: float, education_level: Optional[int]) -> float:
    """Layer 2 — Education correction for cognitive reserve."""
    if education_level is None: return round(memory_score, 2)
    correction = _EDUCATION_CORRECTION.get(education_level, 0.0)
    return round(float(np.clip(memory_score + correction, 0, 100)), 2)


def apply_medical_condition_multipliers(base_prob: float, conditions: dict) -> float:
    """Layer 3 — R_final = R × (1 + Σγ_i) capped at 0.95."""
    gamma_sum = sum(_CONDITION_MULTIPLIERS.get(k, 0.0) for k, v in conditions.items() if v)
    return float(min(base_prob * (1 + gamma_sum), 0.95))


def compute_fatigue_confidence(fatigue_flags: dict, missing_data_ratio: float = 0.0) -> dict:
    """Layer 4 — Confidence = 1 - MissingDataRatio - FatiguePenalty."""
    fatigue_penalty = sum(_FATIGUE_FACTORS.get(k, 0.0) for k, v in fatigue_flags.items() if v)
    confidence = round(float(np.clip(1.0 - missing_data_ratio - fatigue_penalty, 0, 1)), 3)
    recommend_retest = confidence < _FATIGUE_CONFIDENCE_THRESHOLD
    return {
        "confidence": confidence,
        "recommend_retest": recommend_retest,
        "retest_message": _RETEST_MESSAGE if recommend_retest else None,
    }


def compute_logistic_risk_probability(
    speech_score: float, memory_score: float, reaction_score: float, age: Optional[int] = None,
) -> Tuple[float, str]:
    """Logistic probability with age-awareness. Returns (probability, safe_level_label)."""
    age_factor = _age_normalization_factor(age)
    r_speech   = (100.0 - speech_score)   / 100.0 / age_factor
    r_memory   = (100.0 - memory_score)   / 100.0 / age_factor
    r_reaction = (100.0 - reaction_score) / 100.0 / age_factor

    logit = -1.5 + 0.40 * r_speech * 4 + 0.40 * r_memory * 4 + 0.20 * r_reaction * 4
    prob  = round(1.0 / (1.0 + math.exp(-logit)), 4)

    if prob < 0.25:   level = "Within normal range for age group"
    elif prob < 0.50: level = "Mild concern — monitoring recommended"
    elif prob < 0.70: level = "Elevated cognitive risk indicators detected"
    else:             level = "Significant indicators present — clinical evaluation advised"

    return prob, level


# ═══════════════════════════════════════════════════════════════════════════════
# ✅ EXPLAINABILITY — Risk Drivers
# ═══════════════════════════════════════════════════════════════════════════════

def compute_risk_drivers(
    speech_score: float, memory_score: float, reaction_score: float,
    executive_score: float, motor_score: float,
) -> RiskDrivers:
    """
    Compute the percentage contribution of each domain to the overall risk indicator.
    Based on the weighted risk contribution from each domain.
    Higher contribution % = that domain is driving the risk signal more.
    """
    # Weight × risk_contribution (100 - score = risk component)
    from config import MEMORY_WEIGHT, SPEECH_WEIGHT, EXECUTIVE_WEIGHT, REACTION_WEIGHT, MOTOR_WEIGHT  # type: ignore
    try:
        mw, sw, ew, rw, mow = MEMORY_WEIGHT, SPEECH_WEIGHT, EXECUTIVE_WEIGHT, REACTION_WEIGHT, MOTOR_WEIGHT
    except Exception:
        mw, sw, ew, rw, mow = 0.30, 0.25, 0.20, 0.15, 0.10

    mem_c  = mw  * (100 - memory_score)
    spe_c  = sw  * (100 - speech_score)
    exe_c  = ew  * (100 - executive_score)
    rea_c  = rw  * (100 - reaction_score)
    mot_c  = mow * (100 - motor_score)
    total  = mem_c + spe_c + exe_c + rea_c + mot_c or 1.0

    def pct(x): return round(x / total * 100, 1)

    return RiskDrivers(
        memory_recall_contribution_pct=pct(mem_c),
        speech_delay_contribution_pct=pct(spe_c),
        executive_function_contribution_pct=pct(exe_c),
        reaction_time_contribution_pct=pct(rea_c),
        motor_consistency_contribution_pct=pct(mot_c),
    )


# ═══════════════════════════════════════════════════════════════════════════════
# ✅ SIMULATED VALIDATION (returned with every response for transparency)
# ═══════════════════════════════════════════════════════════════════════════════

def get_model_validation() -> ModelValidation:
    """
    Return simulated validation metrics based on synthetic dataset.
    See docs/SCORING_ENGINE.md for full methodology.
    """
    return ModelValidation(
        sensitivity=0.82,
        specificity=0.78,
        auc=0.85,
        note="Simulated validation due to absence of clinical dataset. See SCORING_ENGINE.md.",
    )
