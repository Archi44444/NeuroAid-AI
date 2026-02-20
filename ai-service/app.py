"""
NeuroAid AI Service - Main FastAPI Application
================================================
Entry point for the NeuroAid AI microservice. Exposes a REST API for
analyzing speech, memory, and reaction data to compute cognitive risk scores.

Run with:
    uvicorn app:app --reload
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import logging

from feature_extractor import (
    extract_speech_features,
    extract_memory_features,
    extract_reaction_features,
)
from scoring_engine import compute_risk_score, map_risk_level

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="NeuroAid AI Service",
    description="Cognitive risk assessment API using speech, memory, and reaction analysis.",
    version="0.1.0",
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    """Incoming payload for the /analyze endpoint."""
    speech_audio: str  # Base64-encoded audio string
    memory_results: Dict[str, float]  # e.g. {"word_recall_accuracy": 80, "pattern_accuracy": 70}
    reaction_times: List[float]       # List of reaction times in milliseconds


class AnalyzeResponse(BaseModel):
    """Outgoing analysis result."""
    speech_score: float
    memory_score: float
    reaction_score: float
    risk_score: float
    risk_level: str  # "Low" | "Moderate" | "High"


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"])
def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "NeuroAid AI Service"}


@app.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
def analyze(payload: AnalyzeRequest):
    """
    Analyze cognitive data and return a risk assessment.

    Steps:
      1. Extract feature scores from each modality.
      2. Compute weighted risk score via the scoring engine.
      3. Map the numeric score to a human-readable risk level.
    """
    try:
        logger.info("Received /analyze request.")

        # Step 1 – Feature extraction
        speech_score   = extract_speech_features(payload.speech_audio)
        memory_score   = extract_memory_features(payload.memory_results)
        reaction_score = extract_reaction_features(payload.reaction_times)

        logger.info(
            f"Scores → speech={speech_score}, memory={memory_score}, reaction={reaction_score}"
        )

        # Step 2 – Risk scoring
        risk_score = compute_risk_score(speech_score, memory_score, reaction_score)

        # Step 3 – Risk level mapping
        risk_level = map_risk_level(risk_score)

        logger.info(f"Risk score={risk_score:.2f}, level={risk_level}")

        return AnalyzeResponse(
            speech_score=round(speech_score, 2),
            memory_score=round(memory_score, 2),
            reaction_score=round(reaction_score, 2),
            risk_score=round(risk_score, 2),
            risk_level=risk_level,
        )

    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))
