from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse
from services.ai_service import (
    extract_speech_features,
    extract_memory_features,
    extract_reaction_features,
    compute_risk_score,
    map_risk_level,
)
from utils.logger import log_info

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest):
    """
    Accepts multimodal cognitive data and returns a risk assessment.
    """
    log_info(
        f"[/api/analyze] memory={payload.memory_results} "
        f"reaction_times={payload.reaction_times} "
        f"audio_present={bool(payload.speech_audio)}"
    )

    try:
        speech_score   = extract_speech_features(payload.speech_audio)
        memory_score   = extract_memory_features(payload.memory_results)
        reaction_score = extract_reaction_features(payload.reaction_times)
        risk_score     = compute_risk_score(speech_score, memory_score, reaction_score)
        risk_level     = map_risk_level(risk_score)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Processing error: {exc}")

    return AnalyzeResponse(
        speech_score=round(speech_score, 2),
        memory_score=round(memory_score, 2),
        reaction_score=round(reaction_score, 2),
        risk_score=round(risk_score, 2),
        risk_level=risk_level,
    )
