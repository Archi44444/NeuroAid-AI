"""
NeuroAid AI Service - Configuration
======================================
Central configuration for scoring weights, risk thresholds,
and dummy model file paths.

Modify these values to retune the risk model without changing core logic.
"""

# ---------------------------------------------------------------------------
# Scoring weights
# Must sum to 1.0 for the composite score to remain in [0, 100].
# ---------------------------------------------------------------------------
WEIGHTS: dict = {
    "speech":   0.4,   # Speech impairment carries 40 % of the risk score
    "memory":   0.4,   # Memory impairment carries 40 %
    "reaction": 0.2,   # Reaction time carries 20 %
}

# ---------------------------------------------------------------------------
# Risk level thresholds  (applied to the 0–100 composite score)
# ---------------------------------------------------------------------------
THRESHOLDS: dict = {
    "low_max":      40,   # score ≤ 40  → Low
    "moderate_max": 70,   # score ≤ 70  → Moderate
                          # score >  70 → High
}

# ---------------------------------------------------------------------------
# Model paths  (dummy paths – replace with real paths when models are ready)
# ---------------------------------------------------------------------------
MODEL_PATHS: dict = {
    "speech_model":   "models/speech_classifier.pt",
    "memory_model":   "models/memory_classifier.pt",
    "reaction_model": "models/reaction_regressor.pt",
    "whisper_model":  "models/whisper_base",          # Whisper model directory
}

# ---------------------------------------------------------------------------
# Audio preprocessing settings
# ---------------------------------------------------------------------------
AUDIO_CONFIG: dict = {
    "sample_rate":   16000,   # Target sample rate in Hz
    "n_mfcc":        13,      # Number of MFCC coefficients
    "hop_length":    512,
    "n_fft":         2048,
}

# ---------------------------------------------------------------------------
# Reaction-time normalisation settings
# ---------------------------------------------------------------------------
REACTION_CONFIG: dict = {
    "min_rt_ms": 100,    # Physiological minimum (ms)
    "max_rt_ms": 1500,   # Clip outliers above this value
}
