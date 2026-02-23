"""
NeuroAid AI Service - Scoring Engine
======================================
v2.0 — Medically-safe multi-layer scoring pipeline.

Architecture (per the medical safety upgrade spec):
  User Data
    → Age-adjusted z-score normalization        (Layer 1)
    → Education correction for memory           (Layer 2)
    → Medical condition risk multipliers        (Layer 3)
    → Fatigue/temporary factor confidence       (Layer 4)
    → Logistic risk probability                 (replaces raw weighted sum)
    → Confidence scoring
    → Risk category + safe output language

All probabilities are in [0, 1]. Risk levels use non-diagnostic phrasing.
"""

import logging
import math
from typing import Optional

from config import (
    WEIGHTS, THRESHOLDS,
    age_z_score, get_education_correction,
    apply_condition_multipliers, compute_confidence_score,
    FATIGUE_CONFIDENCE_THRESHOLD, SAFE_OUTPUT_LANGUAGE,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# ✅ LAYER 1 — Age-adjusted z-score normalization helpers
# ---------------------------------------------------------------------------

def normalize_score_age_adjusted(
    raw_value: float,
    metric: str,
    age: Optional[int],
    invert: bool = False,
) -> float:
    """
    Convert a raw metric to a 0–100 score using age-adjusted z-score normalization.

    Z = (X - μ_age) / σ_age
    Then mapped to [0, 100]:  score = 50 + Z * 15   (clamped)

    If invert=True, higher raw values = worse (e.g. reaction time in ms).

    Args:
        raw_value: The raw measurement.
        metric: One of the keys in AGE_NORMS (e.g. "reaction_time").
        age: Participant age. If None, uses population-wide baseline.
        invert: If True, negate Z before mapping (slower RT → higher concern).

    Returns:
        Score in [0, 100] where 100 = peer-average or better performance.
    """
    if age is None:
        age = 40  # neutral default

    z = age_z_score(raw_value, metric, age)
    if invert:
        z = -z  # flip: being slower than peers is a concern

    # Map z-score to 0–100.  z=0 → 50, z=2 → 80 (good), z=-2 → 20 (concern)
    score = 50.0 + z * 15.0
    score = max(0.0, min(100.0, score))
    logger.debug(f"normalize_score_age_adjusted: metric={metric} val={raw_value} age={age} z={z:.3f} → {score:.2f}")
    return round(score, 2)


# ---------------------------------------------------------------------------
# ✅ LAYER 2 — Education-adjusted memory score
# ---------------------------------------------------------------------------

def apply_education_adjustment(memory_score: float, education_level: Optional[int]) -> float:
    """
    Adjust memory score for cognitive reserve (education level).

    AdjustedMemory = MemoryScore + β_education * 100

    Args:
        memory_score: Raw memory score in [0, 100].
        education_level: 1–5 (1=no formal, 5=postgrad).

    Returns:
        Adjusted memory score in [0, 100].
    """
    if education_level is None:
        return memory_score
    beta = get_education_correction(education_level)
    adjusted = memory_score + (beta * 100)
    adjusted = max(0.0, min(100.0, adjusted))
    logger.debug(f"apply_education_adjustment: edu_level={education_level} β={beta} → {adjusted:.2f}")
    return round(adjusted, 2)


# ---------------------------------------------------------------------------
# ✅ Logistic Risk Probability (replaces raw weighted sum)
# ---------------------------------------------------------------------------

def compute_logistic_risk(
    speech_score: float,
    memory_score: float,
    reaction_score: float,
    beta0: float = -1.5,
) -> float:
    """
    Convert domain scores to a probability using logistic regression.

    P(cognitive_concern) = 1 / (1 + e^{-(β0 + β1·x1 + β2·x2 + β3·x3)})

    Input scores are in [0, 100] where HIGHER = healthier.
    We negate them so that low performance → high logit → high risk.

    Args:
        speech_score:   Speech domain score (0–100, higher = healthier).
        memory_score:   Memory domain score (0–100, higher = healthier).
        reaction_score: Reaction domain score (0–100, higher = healthier).
        beta0: Intercept (calibrated baseline).

    Returns:
        Probability in [0, 1] representing cognitive concern level.
    """
    w_speech   = WEIGHTS["speech"]
    w_memory   = WEIGHTS["memory"]
    w_reaction = WEIGHTS["reaction"]

    # Invert health scores → risk contributions (0–100, higher = riskier)
    risk_speech   = 100.0 - speech_score
    risk_memory   = 100.0 - memory_score
    risk_reaction = 100.0 - reaction_score

    # Normalize to [0, 1] for logit
    logit = (
        beta0
        + w_speech   * (risk_speech   / 100.0) * 4.0
        + w_memory   * (risk_memory   / 100.0) * 4.0
        + w_reaction * (risk_reaction / 100.0) * 4.0
    )
    prob = 1.0 / (1.0 + math.exp(-logit))
    logger.debug(f"compute_logistic_risk: logit={logit:.4f} → prob={prob:.4f}")
    return round(prob, 4)


# ---------------------------------------------------------------------------
# ✅ LAYER 3 — Medical condition multipliers (applied post-logistic)
# ---------------------------------------------------------------------------

def apply_medical_conditions(base_prob: float, conditions: dict) -> float:
    """
    Wrapper around config.apply_condition_multipliers with logging.

    Args:
        base_prob: Base probability from logistic model.
        conditions: Dict of condition flags e.g. {"diabetes": True, ...}.

    Returns:
        Adjusted probability, capped at MAX_RISK_CAP (0.95).
    """
    final = apply_condition_multipliers(base_prob, conditions)
    logger.debug(f"apply_medical_conditions: base={base_prob:.4f} conditions={conditions} → {final:.4f}")
    return final


# ---------------------------------------------------------------------------
# ✅ LAYER 4 — Fatigue / Temporary Factor Confidence
# ---------------------------------------------------------------------------

def evaluate_fatigue(fatigue_flags: dict, missing_data_ratio: float = 0.0) -> dict:
    """
    Compute confidence score and determine if retest is recommended.

    Args:
        fatigue_flags: Dict of fatigue indicators e.g. {"tired": True, ...}.
        missing_data_ratio: Fraction of expected data that was missing [0, 1].

    Returns:
        Dict with 'confidence', 'recommend_retest', 'retest_message'.
    """
    confidence = compute_confidence_score(missing_data_ratio, fatigue_flags)
    recommend_retest = confidence < FATIGUE_CONFIDENCE_THRESHOLD

    return {
        "confidence": confidence,
        "recommend_retest": recommend_retest,
        "retest_message": SAFE_OUTPUT_LANGUAGE["retest_recommendation"] if recommend_retest else None,
    }


# ---------------------------------------------------------------------------
# Main pipeline entry point
# ---------------------------------------------------------------------------

def compute_risk_score(
    speech_score: float,
    memory_score: float,
    reaction_score: float,
) -> float:
    """
    Legacy interface: compute weighted composite risk score.
    Kept for backward compatibility with existing callers.

    Returns score in [0, 100] (higher = riskier).
    """
    w_speech   = WEIGHTS["speech"]
    w_memory   = WEIGHTS["memory"]
    w_reaction = WEIGHTS["reaction"]

    risk = (
        w_speech   * (100 - speech_score)
        + w_memory   * (100 - memory_score)
        + w_reaction * (100 - reaction_score)
    )
    risk = max(0.0, min(100.0, risk))
    logger.debug(f"compute_risk_score (legacy): {risk:.2f}")
    return risk


def compute_full_risk_pipeline(
    speech_score: float,
    memory_score: float,
    reaction_score: float,
    age: Optional[int] = None,
    education_level: Optional[int] = None,
    conditions: Optional[dict] = None,
    fatigue_flags: Optional[dict] = None,
    missing_data_ratio: float = 0.0,
) -> dict:
    """
    Full medically-safe risk pipeline:
      1. Age-adjusted normalization (scores already pre-normalized by callers)
      2. Education correction on memory
      3. Logistic probability
      4. Medical condition multipliers
      5. Fatigue confidence
      6. Safe output language

    Args:
        speech_score, memory_score, reaction_score: Domain scores [0–100], higher = healthier.
        age: Participant age.
        education_level: 1–5.
        conditions: Medical condition flags dict.
        fatigue_flags: Fatigue indicator flags dict.
        missing_data_ratio: Fraction of missing data [0, 1].

    Returns:
        Dict with risk_probability, risk_level, confidence, disclaimer, retest_message.
    """
    conditions   = conditions   or {}
    fatigue_flags = fatigue_flags or {}

    # Layer 2: Education adjustment on memory
    adj_memory = apply_education_adjustment(memory_score, education_level)

    # Logistic probability
    prob = compute_logistic_risk(speech_score, adj_memory, reaction_score)

    # Layer 3: Medical condition multipliers
    prob = apply_medical_conditions(prob, conditions)

    # Layer 4: Fatigue confidence
    fatigue_result = evaluate_fatigue(fatigue_flags, missing_data_ratio)

    # Risk level using safe, non-diagnostic language
    level = map_risk_level_safe(prob)

    return {
        "risk_probability":   round(prob, 4),
        "risk_level":         level,
        "confidence":         fatigue_result["confidence"],
        "recommend_retest":   fatigue_result["recommend_retest"],
        "retest_message":     fatigue_result["retest_message"],
        "disclaimer":         SAFE_OUTPUT_LANGUAGE["disclaimer"],
        "adjusted_memory_score": adj_memory,
    }


# ---------------------------------------------------------------------------
# Risk Level Mapping (safe, non-diagnostic language)
# ---------------------------------------------------------------------------

def map_risk_level(risk_score: float) -> str:
    """Legacy: map 0–100 score to categorical label."""
    low_max      = THRESHOLDS["low_max"]
    moderate_max = THRESHOLDS["moderate_max"]
    if risk_score <= low_max:
        return "Low"
    elif risk_score <= moderate_max:
        return "Moderate"
    else:
        return "High"


def map_risk_level_safe(prob: float) -> str:
    """
    Map probability [0–1] to non-diagnostic risk level string.
    Uses safe language: never says 'You have X'.
    """
    if prob < 0.25:
        return "Within normal range for age group"
    elif prob < 0.50:
        return "Mild concern — monitoring recommended"
    elif prob < 0.70:
        return "Elevated cognitive risk indicators detected"
    else:
        return "Significant indicators present — clinical evaluation advised"
