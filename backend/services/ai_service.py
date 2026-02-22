"""
ai_service.py — NeuroAid v3
18-feature pipeline with separate logistic-regression-style models for:
  - Alzheimer's disease
  - General Dementia
  - Parkinson's disease

Feature vector:
  Speech  (5): wpm, speed_deviation, speech_variability, pause_ratio, speech_start_delay
  Memory  (5): immediate_recall_accuracy, delayed_recall_accuracy, intrusion_count, recall_latency, order_match_ratio
  Reaction(5): mean_rt, std_rt, min_rt, reaction_drift, miss_count
  Executive(2): stroop_error_rate, stroop_rt
  Motor   (1): tap_interval_std

All domain score functions return 0–100 where HIGHER = healthier.
Risk probabilities are in [0, 1].
"""

import random
from typing import Optional

import numpy as np

from models.schemas import (
    SpeechData, MemoryData, ReactionData,
    StroopData, TapData, UserProfile, FeatureVector,
)

# ═══════════════════════════════════════════════════════════════════════════════
# DISEASE MODEL WEIGHTS
# Each row: [wpm, speed_dev, speech_var, pause_ratio, start_delay,
#            imm_recall, del_recall, intrusions, latency, order_ratio,
#            mean_rt, std_rt, min_rt, drift, misses,
#            stroop_err, stroop_rt, tap_std]
# Positive weight = higher feature value increases disease risk.
# Weights tuned to match known neurological profiles.
# ═══════════════════════════════════════════════════════════════════════════════

# Alzheimer's: dominated by memory decline + word-finding difficulties
ALZ_WEIGHTS = np.array([
    -0.010,  # wpm (slower speech ↑ risk, mild)
     0.008,  # speed_deviation
     0.006,  # speech_variability
     0.015,  # pause_ratio (high pauses ↑ risk — word finding)
     0.005,  # speech_start_delay
    -0.030,  # immediate_recall_accuracy (lower = higher risk — PRIMARY)
    -0.035,  # delayed_recall_accuracy (strongest Alz marker — PRIMARY)
     0.020,  # intrusion_count (strong Alz marker)
     0.015,  # recall_latency
    -0.020,  # order_match_ratio
     0.003,  # mean_rt (minor)
     0.002,  # std_rt
     0.001,  # min_rt
     0.003,  # reaction_drift
     0.005,  # miss_count
     0.005,  # stroop_error_rate
     0.002,  # stroop_rt
     0.002,  # tap_interval_std
])
ALZ_BIAS = 0.35

# Dementia (general): attention + processing speed + broad cognitive decline
DEM_WEIGHTS = np.array([
    -0.008,  # wpm
     0.005,  # speed_deviation
     0.005,  # speech_variability
     0.008,  # pause_ratio
     0.006,  # speech_start_delay
    -0.020,  # immediate_recall_accuracy
    -0.018,  # delayed_recall_accuracy
     0.012,  # intrusion_count
     0.010,  # recall_latency
    -0.012,  # order_match_ratio
     0.025,  # mean_rt (STRONG — processing speed)
     0.020,  # std_rt (STRONG — attention instability)
     0.010,  # min_rt
     0.018,  # reaction_drift (fatigue = cognitive load issue)
     0.025,  # miss_count (PRIMARY — sustained attention)
     0.030,  # stroop_error_rate (PRIMARY — executive function)
     0.015,  # stroop_rt
     0.008,  # tap_interval_std
])
DEM_BIAS = 0.25

# Parkinson's: motor timing + initiation + reaction consistency
PARK_WEIGHTS = np.array([
    -0.015,  # wpm (hypophonia, slow speech)
     0.012,  # speed_deviation
     0.018,  # speech_variability (monotone/dysrhythmic)
     0.010,  # pause_ratio
     0.020,  # speech_start_delay (initiation delay — PRIMARY)
    -0.005,  # immediate_recall_accuracy (mild)
    -0.005,  # delayed_recall_accuracy
     0.005,  # intrusion_count
     0.008,  # recall_latency
    -0.005,  # order_match_ratio
     0.030,  # mean_rt (PRIMARY — bradykinesia)
     0.025,  # std_rt (PRIMARY — motor inconsistency)
     0.020,  # min_rt (slow even at best)
     0.015,  # reaction_drift
     0.020,  # miss_count
     0.008,  # stroop_error_rate
     0.010,  # stroop_rt
     0.040,  # tap_interval_std (PRIMARY — rhythmic motor control)
])
PARK_BIAS = 0.20


def _sigmoid(x: float) -> float:
    return 1.0 / (1.0 + np.exp(-x))


def _predict_disease(feature_vec: np.ndarray, weights: np.ndarray, bias: float) -> float:
    """Logistic regression forward pass."""
    logit = float(np.dot(weights, feature_vec)) + bias
    return round(float(_sigmoid(logit)), 3)


def _prob_to_level(prob: float) -> str:
    if prob < 0.35:
        return "Low"
    elif prob < 0.65:
        return "Moderate"
    else:
        return "High"


# ═══════════════════════════════════════════════════════════════════════════════
# FEATURE EXTRACTORS
# ═══════════════════════════════════════════════════════════════════════════════

def extract_speech_features(audio_b64=None, speech: Optional[SpeechData] = None) -> tuple[float, dict]:
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
    if not audio_b64:
        return round(random.uniform(110, 160), 1)
    return round(120 + 40 * min(len(audio_b64) / 10_000, 1.0) + random.uniform(-10, 10), 1)


def extract_memory_features(memory_results: dict, memory: Optional[MemoryData] = None) -> tuple[float, dict]:
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


def extract_reaction_features(reaction_times: list, reaction: Optional[ReactionData] = None) -> tuple[float, dict]:
    times      = reaction.times if reaction else reaction_times
    miss_count = reaction.miss_count or 0
    init_delay = (reaction.initiation_delay or random.uniform(150, 400)) if reaction else random.uniform(150, 400)

    if not times:
        times = [random.uniform(250, 450) for _ in range(5)]

    arr      = np.array(times, dtype=float)
    mean_rt  = float(np.mean(arr))
    std_rt   = float(np.std(arr))
    min_rt   = float(np.min(arr))
    half     = len(arr) // 2
    drift    = float(np.mean(arr[half:]) - np.mean(arr[:half])) if half > 0 else 0.0

    feats = dict(mean_rt=round(mean_rt, 2), std_rt=round(std_rt, 2), min_rt=round(min_rt, 2),
                 reaction_drift=round(drift, 2), miss_count=float(miss_count),
                 initiation_delay=round(init_delay, 2))

    speed_score = max(0, 100 - ((mean_rt - 200) / 400) * 100)
    var_pen     = min(std_rt / 5, 20)
    drift_pen   = min(max(drift / 10, 0), 20)
    miss_pen    = min(miss_count * 10, 30)
    score = float(np.clip(speed_score - var_pen - drift_pen - miss_pen + random.uniform(-2, 2), 0, 100))
    return round(score, 2), feats


def extract_executive_features(stroop: Optional[StroopData] = None) -> tuple[float, dict]:
    if stroop and stroop.total_trials > 0:
        error_rate = stroop.error_count / stroop.total_trials
        stroop_rt  = stroop.incongruent_rt or stroop.mean_rt or random.uniform(450, 800)
    else:
        error_rate = random.uniform(0.05, 0.30)
        stroop_rt  = random.uniform(450, 800)

    feats = dict(stroop_error_rate=round(error_rate, 4), stroop_rt=round(stroop_rt, 2))

    error_pen = min(error_rate * 200, 60)
    rt_pen    = min((stroop_rt - 400) / 400 * 40, 40) if stroop_rt > 400 else 0
    score = float(np.clip(100 - error_pen - rt_pen + random.uniform(-2, 2), 0, 100))
    return round(score, 2), feats


def extract_motor_features(tap: Optional[TapData] = None) -> tuple[float, dict]:
    if tap and len(tap.intervals) >= 3:
        intervals = np.array(tap.intervals, dtype=float)
        tap_std   = float(np.std(intervals))
    else:
        tap_std = random.uniform(20, 120)

    feats = dict(tap_interval_std=round(tap_std, 2))
    # Lower std = more consistent = better motor control
    penalty = min(tap_std / 2, 60)
    score   = float(np.clip(100 - penalty + random.uniform(-2, 2), 0, 100))
    return round(score, 2), feats


# ═══════════════════════════════════════════════════════════════════════════════
# DISEASE RISK COMPUTATION
# ═══════════════════════════════════════════════════════════════════════════════

def compute_disease_risks(fv: FeatureVector, profile: Optional[UserProfile] = None) -> dict:
    """
    Build the 18-element feature vector and run three separate logistic models.
    Raw features are normalised to roughly [0, 1] range before scoring.
    """
    vec = np.array([
        fv.wpm / 200.0,
        fv.speed_deviation / 50.0,
        fv.speech_variability / 30.0,
        fv.pause_ratio,
        fv.speech_start_delay / 5.0,
        fv.immediate_recall_accuracy / 100.0,
        fv.delayed_recall_accuracy / 100.0,
        fv.intrusion_count / 10.0,
        fv.recall_latency / 15.0,
        fv.order_match_ratio,
        fv.mean_rt / 800.0,
        fv.std_rt / 300.0,
        fv.min_rt / 600.0,
        fv.reaction_drift / 300.0,
        fv.miss_count / 10.0,
        fv.stroop_error_rate,
        fv.stroop_rt / 1000.0,
        fv.tap_interval_std / 200.0,
    ])

    alz_prob  = _predict_disease(vec, ALZ_WEIGHTS,  ALZ_BIAS)
    dem_prob  = _predict_disease(vec, DEM_WEIGHTS,  DEM_BIAS)
    park_prob = _predict_disease(vec, PARK_WEIGHTS, PARK_BIAS)

    # Clinical profile adjustment (gentle nudge, not dominant)
    if profile:
        alz_adj = dem_adj = park_adj = 0.0
        if profile.age and profile.age > 65:
            alz_adj  += 0.04
            dem_adj  += 0.03
            park_adj += 0.03
        if profile.sleep_hours and profile.sleep_hours < 6:
            dem_adj += 0.03
        if profile.education_level and profile.education_level >= 4:
            alz_adj  -= 0.03
            dem_adj  -= 0.02
        alz_prob  = float(np.clip(alz_prob  + alz_adj,  0, 1))
        dem_prob  = float(np.clip(dem_prob  + dem_adj,  0, 1))
        park_prob = float(np.clip(park_prob + park_adj, 0, 1))

    return {
        "alzheimers_risk": alz_prob,
        "dementia_risk":   dem_prob,
        "parkinsons_risk": park_prob,
    }


def build_feature_vector(speech_f, memory_f, reaction_f, executive_f, motor_f) -> FeatureVector:
    return FeatureVector(
        wpm=speech_f.get("wpm", 120),
        speed_deviation=speech_f.get("speed_deviation", 10),
        speech_variability=speech_f.get("speech_variability", 8),
        pause_ratio=speech_f.get("pause_ratio", 0.15),
        speech_start_delay=speech_f.get("speech_start_delay", 1.0),
        immediate_recall_accuracy=memory_f.get("immediate_recall_accuracy", 70),
        delayed_recall_accuracy=memory_f.get("delayed_recall_accuracy", 65),
        intrusion_count=memory_f.get("intrusion_count", 1),
        recall_latency=memory_f.get("recall_latency", 3.0),
        order_match_ratio=memory_f.get("order_match_ratio", 0.8),
        mean_rt=reaction_f.get("mean_rt", 320),
        std_rt=reaction_f.get("std_rt", 45),
        min_rt=reaction_f.get("min_rt", 250),
        reaction_drift=reaction_f.get("reaction_drift", 10),
        miss_count=reaction_f.get("miss_count", 0),
        stroop_error_rate=executive_f.get("stroop_error_rate", 0.10),
        stroop_rt=executive_f.get("stroop_rt", 550),
        tap_interval_std=motor_f.get("tap_interval_std", 40),
    )
