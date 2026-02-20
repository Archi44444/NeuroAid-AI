"""
NeuroAid AI Service - Scoring Engine
======================================
Computes a weighted composite risk score from individual feature scores
and maps the numeric result to a human-readable risk level.

Weights and thresholds are loaded from config.py so they can be tuned
without touching this file.
"""

import logging
from config import WEIGHTS, THRESHOLDS

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Risk Score Computation
# ---------------------------------------------------------------------------
def compute_risk_score(
    speech_score: float,
    memory_score: float,
    reaction_score: float,
) -> float:
    """
    Compute a weighted composite risk score.

    Formula:
        risk_score = (w_speech  × speech_score)
                   + (w_memory  × memory_score)
                   + (w_reaction × reaction_score)

    All input scores should be in [0, 100]; output is also in [0, 100].

    Args:
        speech_score:   Cognitive speech impairment score (0–100).
        memory_score:   Memory impairment score (0–100).
        reaction_score: Reaction-time impairment score (0–100).

    Returns:
        Weighted composite risk score in [0, 100].
    """
    w_speech   = WEIGHTS["speech"]
    w_memory   = WEIGHTS["memory"]
    w_reaction = WEIGHTS["reaction"]

    risk = (w_speech * speech_score) + (w_memory * memory_score) + (w_reaction * reaction_score)

    # Clamp to valid range (floating-point arithmetic can drift slightly)
    risk = max(0.0, min(100.0, risk))

    logger.debug(
        f"compute_risk_score: speech={speech_score} × {w_speech} + "
        f"memory={memory_score} × {w_memory} + "
        f"reaction={reaction_score} × {w_reaction} → {risk:.2f}"
    )
    return risk


# ---------------------------------------------------------------------------
# Risk Level Mapping
# ---------------------------------------------------------------------------
def map_risk_level(risk_score: float) -> str:
    """
    Map a numeric risk score to a categorical risk level.

    Thresholds (from config.py):
        0  – 40  → "Low"
        41 – 70  → "Moderate"
        71 – 100 → "High"

    Args:
        risk_score: Composite risk score in [0, 100].

    Returns:
        One of "Low", "Moderate", or "High".
    """
    low_max      = THRESHOLDS["low_max"]       # e.g. 40
    moderate_max = THRESHOLDS["moderate_max"]  # e.g. 70

    if risk_score <= low_max:
        level = "Low"
    elif risk_score <= moderate_max:
        level = "Moderate"
    else:
        level = "High"

    logger.debug(f"map_risk_level: score={risk_score:.2f} → {level}")
    return level
