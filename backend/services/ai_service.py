"""
ai_service.py
─────────────
Feature extraction + risk scoring engine for NeuroAid.

All functions currently use **dummy logic** so the backend returns
meaningful mock data immediately.  Replace each function body with
real model inference when the ML pipeline is ready.
"""

import random
from typing import Dict, List, Optional

from config import SPEECH_WEIGHT, MEMORY_WEIGHT, REACTION_WEIGHT
from config import THRESHOLD_LOW, THRESHOLD_HIGH


# ── Feature extractors ────────────────────────────────────────────────────────

def extract_speech_features(audio_b64: Optional[str]) -> float:
    """
    Analyse base64-encoded audio for speech biomarkers.

    Dummy behaviour: returns a deterministic-ish score based on audio length,
    or a random value when no audio is provided.

    Returns a float in [0, 100] where HIGHER = healthier speech.
    """
    if not audio_b64:
        return round(random.uniform(55, 95), 2)

    # Proxy: longer audio → slightly better score (dummy heuristic)
    length_factor = min(len(audio_b64) / 10_000, 1.0)
    base_score = 60 + 30 * length_factor
    noise = random.uniform(-5, 5)
    return round(max(0.0, min(100.0, base_score + noise)), 2)


def extract_memory_features(memory_results: Dict[str, float]) -> float:
    """
    Compute a memory score from game results.

    Expected keys: word_recall_accuracy, pattern_accuracy (both 0–100).
    Missing keys default to 50.

    Returns a float in [0, 100] where HIGHER = better memory.
    """
    word_recall = memory_results.get("word_recall_accuracy", 50.0)
    pattern     = memory_results.get("pattern_accuracy", 50.0)

    # Simple average with a tiny random jitter (simulates model variance)
    score = (word_recall + pattern) / 2 + random.uniform(-3, 3)
    return round(max(0.0, min(100.0, score)), 2)


def extract_reaction_features(reaction_times: List[float]) -> float:
    """
    Convert a list of reaction times (ms) to a 0–100 performance score.

    Lower reaction time → higher score.
    Baseline: 200 ms = 100 pts, 600 ms = 0 pts.

    Returns a float in [0, 100] where HIGHER = faster reactions.
    """
    if not reaction_times:
        return round(random.uniform(50, 80), 2)

    import numpy as np
    mean_rt  = float(np.mean(reaction_times))
    # Linear mapping: [200, 600] ms → [100, 0]
    score = 100 - ((mean_rt - 200) / 400) * 100
    score += random.uniform(-3, 3)          # jitter
    return round(max(0.0, min(100.0, score)), 2)


# ── Risk computation ──────────────────────────────────────────────────────────

def compute_risk_score(
    speech_score: float,
    memory_score: float,
    reaction_score: float,
) -> float:
    """
    Weighted combination of sub-scores.

    Formula: 0.4*speech + 0.4*memory + 0.2*reaction

    Returns a float in [0, 100] where HIGHER = healthier (lower risk).
    """
    weighted = (
        SPEECH_WEIGHT   * speech_score
        + MEMORY_WEIGHT   * memory_score
        + REACTION_WEIGHT * reaction_score
    )
    return round(max(0.0, min(100.0, weighted)), 2)


def map_risk_level(risk_score: float) -> str:
    """
    Convert a composite score to a human-readable risk level.

    Score range  | Risk level
    ─────────────────────────
    >= THRESHOLD_LOW (70) → Low
    >= THRESHOLD_HIGH(40) → Moderate
    <  THRESHOLD_HIGH     → High
    """
    if risk_score >= THRESHOLD_LOW:
        return "Low"
    elif risk_score >= THRESHOLD_HIGH:
        return "Moderate"
    else:
        return "High"
