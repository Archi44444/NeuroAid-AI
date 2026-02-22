"""
config.py — NeuroAid v4
Biologically defensible weights + 4-tier nonlinear thresholds.
Loads from .env via python-dotenv.
"""

import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass

# ── Composite risk score weights (must sum to 1.0) ─────────────────────────────
# Memory strongest predictor; Motor supportive indicator
MEMORY_WEIGHT    = float(os.getenv("MEMORY_WEIGHT",    "0.30"))
SPEECH_WEIGHT    = float(os.getenv("SPEECH_WEIGHT",    "0.25"))
EXECUTIVE_WEIGHT = float(os.getenv("EXECUTIVE_WEIGHT", "0.20"))
REACTION_WEIGHT  = float(os.getenv("REACTION_WEIGHT",  "0.15"))
MOTOR_WEIGHT     = float(os.getenv("MOTOR_WEIGHT",     "0.10"))

assert abs(MEMORY_WEIGHT + SPEECH_WEIGHT + EXECUTIVE_WEIGHT + REACTION_WEIGHT + MOTOR_WEIGHT - 1.0) < 1e-6, \
    "Scoring weights must sum to 1.0"

# ── 4-tier nonlinear risk thresholds (composite risk score, 0–100) ─────────────
#   0–49  → Low
#  50–69  → Mild Concern
#  70–84  → Moderate Risk
#  85–100 → High Risk
THRESHOLD_MILD     = float(os.getenv("THRESHOLD_MILD",     "50"))
THRESHOLD_MODERATE = float(os.getenv("THRESHOLD_MODERATE", "70"))
THRESHOLD_HIGH     = float(os.getenv("THRESHOLD_HIGH",     "85"))

# ── Server ────────────────────────────────────────────────────────────────────
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))
DEBUG    = os.getenv("DEBUG", "true").lower() == "true"

# ── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

# ── AI Service URL ────────────────────────────────────────────────────────────
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://localhost:8001")
