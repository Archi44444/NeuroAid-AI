"""
NeuroAid AI Service - Main FastAPI Application
================================================
v2.0 — Medically-safe 4-layer scoring pipeline.

New fields in request:
  - age, education_level           (Layer 1 & 2)
  - medical_conditions             (Layer 3)
  - fatigue_flags                  (Layer 4)

New fields in response:
  - risk_probability (logistic)
  - confidence_score
  - recommend_retest / retest_message
  - disclaimer (always present)

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
from scoring_engine import (
    compute_risk_score,
    compute_full_risk_pipeline,
    map_risk_level,
)

# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="NeuroAid AI Service",
    description=(
        "Cognitive risk assessment API using speech, memory, and reaction analysis. "
        "v2.0 adds age-normalization, education correction, medical condition multipliers, "
        "fatigue confidence scoring, and logistic risk probability."
    ),
    version="2.0.0",
)


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class MedicalConditions(BaseModel):
    """✅ LAYER 3 — Medical condition flags for risk multipliers."""
    diabetes: bool = False
    hypertension: bool = False
    stroke_history: bool = False
    family_alzheimers: bool = False
    parkinsons_dx: bool = False
    depression: bool = False
    thyroid_disorder: bool = False

class FatigueFlags(BaseModel):
    """✅ LAYER 4 — Temporary factors that reduce result confidence."""
    tired: bool = False
    sleep_deprived: bool = False   # < 5 hours sleep
    sick: bool = False
    anxious: bool = False

class AnalyzeRequest(BaseModel):
    """Incoming payload for the /analyze endpoint."""
    # Core test data
    speech_audio: str = ""
    memory_results: Dict[str, float] = {"word_recall_accuracy": 50.0, "pattern_accuracy": 50.0}
    reaction_times: List[float] = []
    # ✅ LAYER 1 — Age (for z-score normalization)
    age: Optional[int] = None
    # ✅ LAYER 2 — Education level (cognitive reserve correction)
    education_level: Optional[int] = None   # 1=No formal … 5=Postgrad
    # ✅ LAYER 3 — Medical conditions
    medical_conditions: Optional[MedicalConditions] = None
    # ✅ LAYER 4 — Fatigue / temporary factors
    fatigue_flags: Optional[FatigueFlags] = None

class AnalyzeResponse(BaseModel):
    """Outgoing analysis result with full medical safety metadata."""
    # Domain scores (0–100, higher = healthier)
    speech_score: float
    memory_score: float
    reaction_score: float
    # Legacy weighted risk score [0–100]
    risk_score: float
    risk_level: str
    # ✅ NEW: Logistic probability [0–1]
    risk_probability: float
    risk_level_safe: str   # non-diagnostic language
    # ✅ NEW: Education-adjusted memory
    adjusted_memory_score: float
    # ✅ NEW: Confidence scoring
    confidence_score: float
    recommend_retest: bool
    retest_message: Optional[str]
    # ✅ NEW: Disclaimer (always present)
    disclaimer: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "NeuroAid AI Service", "version": "2.0.0"}


@app.post("/analyze", response_model=AnalyzeResponse, tags=["Analysis"])
def analyze(payload: AnalyzeRequest):
    """
    Analyze cognitive data through the 4-layer medically-safe pipeline:
      1. Age-adjusted normalization
      2. Education correction
      3. Medical condition multipliers
      4. Fatigue confidence scoring
      → Logistic risk probability
      → Safe output language
    """
    try:
        logger.info(f"Received /analyze request. age={payload.age} edu={payload.education_level}")

        # Step 1 – Feature extraction
        speech_score   = extract_speech_features(payload.speech_audio)
        memory_score   = extract_memory_features(payload.memory_results)
        reaction_score = extract_reaction_features(payload.reaction_times)

        logger.info(f"Raw scores → speech={speech_score}, memory={memory_score}, reaction={reaction_score}")

        # Step 2 – Legacy risk score (kept for backward compat)
        risk_score = compute_risk_score(speech_score, memory_score, reaction_score)
        risk_level = map_risk_level(risk_score)

        # Step 3 – Full 4-layer medically-safe pipeline
        conditions   = payload.medical_conditions.dict() if payload.medical_conditions else {}
        fatigue_dict = payload.fatigue_flags.dict()      if payload.fatigue_flags      else {}

        # Compute missing data ratio (simple heuristic)
        provided_fields = sum([
            bool(payload.speech_audio),
            bool(payload.memory_results),
            bool(payload.reaction_times),
        ])
        missing_ratio = 1.0 - (provided_fields / 3.0)

        pipeline_result = compute_full_risk_pipeline(
            speech_score=speech_score,
            memory_score=memory_score,
            reaction_score=reaction_score,
            age=payload.age,
            education_level=payload.education_level,
            conditions=conditions,
            fatigue_flags=fatigue_dict,
            missing_data_ratio=missing_ratio,
        )

        logger.info(
            f"Pipeline result → prob={pipeline_result['risk_probability']} "
            f"level={pipeline_result['risk_level']} "
            f"confidence={pipeline_result['confidence']}"
        )

        return AnalyzeResponse(
            speech_score=round(speech_score, 2),
            memory_score=round(memory_score, 2),
            reaction_score=round(reaction_score, 2),
            risk_score=round(risk_score, 2),
            risk_level=risk_level,
            risk_probability=pipeline_result["risk_probability"],
            risk_level_safe=pipeline_result["risk_level"],
            adjusted_memory_score=pipeline_result["adjusted_memory_score"],
            confidence_score=pipeline_result["confidence"],
            recommend_retest=pipeline_result["recommend_retest"],
            retest_message=pipeline_result["retest_message"],
            disclaimer=pipeline_result["disclaimer"],
        )

    except Exception as e:
        logger.error(f"Error during analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# ✅ NEW: RAG Educational Chatbot Endpoint
# ---------------------------------------------------------------------------
from rag_service import answer_educational_question

class RagRequest(BaseModel):
    question: str
    user_context: Optional[dict] = None

class RagResponse(BaseModel):
    answer: str
    sources: list = []
    guardrail_triggered: bool = False
    disclaimer: str


@app.post("/rag/ask", response_model=RagResponse, tags=["Education / RAG"])
def rag_ask(payload: RagRequest):
    """
    Educational Q&A endpoint backed by the RAG knowledge base.

    - Explains cognitive risk indicators in plain language
    - Retrieves from curated NIH / WHO / Alzheimer's Assoc sources only
    - Refuses diagnosis or medication questions (guardrails)
    - Always appends disclaimer
    """
    result = answer_educational_question(payload.question, payload.user_context)
    return RagResponse(
        answer=result["answer"],
        sources=result.get("sources", []),
        guardrail_triggered=result.get("guardrail_triggered", False),
        disclaimer=result.get("disclaimer", ""),
    )
