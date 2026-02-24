"""
config.py — NeuroAid Backend
Weights, thresholds, and environment config.
"""

import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

# ── Composite risk score weights (must sum to 1.0) ─────────────────────────────
MEMORY_WEIGHT    = float(os.getenv("MEMORY_WEIGHT",    "0.30"))
SPEECH_WEIGHT    = float(os.getenv("SPEECH_WEIGHT",    "0.25"))
EXECUTIVE_WEIGHT = float(os.getenv("EXECUTIVE_WEIGHT", "0.20"))
REACTION_WEIGHT  = float(os.getenv("REACTION_WEIGHT",  "0.15"))
MOTOR_WEIGHT     = float(os.getenv("MOTOR_WEIGHT",     "0.10"))

assert abs(MEMORY_WEIGHT + SPEECH_WEIGHT + EXECUTIVE_WEIGHT + REACTION_WEIGHT + MOTOR_WEIGHT - 1.0) < 1e-6

# ── 4-tier risk thresholds ─────────────────────────────────────────────────────
THRESHOLD_MILD     = float(os.getenv("THRESHOLD_MILD",     "50"))
THRESHOLD_MODERATE = float(os.getenv("THRESHOLD_MODERATE", "70"))
THRESHOLD_HIGH     = float(os.getenv("THRESHOLD_HIGH",     "85"))

# ── Server ─────────────────────────────────────────────────────────────────────
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
DEBUG    = os.getenv("DEBUG", "true").lower() == "true"

# ── CORS ───────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173"
).split(",")

# ── AI Service ─────────────────────────────────────────────────────────────────
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8001")

# ── Disclaimer (always displayed in responses) ─────────────────────────────────
DISCLAIMER = (
    "⚠️ This tool does NOT provide medical diagnosis. "
    "It provides early cognitive risk signals for further evaluation by a qualified professional. "
    "Always consult a neurologist or physician for clinical decisions."
)
