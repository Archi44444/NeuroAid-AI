from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse, DiseaseRiskLevels
from services.ai_service import (
    extract_speech_features, extract_memory_features,
    extract_reaction_features, extract_executive_features,
    extract_motor_features, compute_disease_risks,
    build_feature_vector, _prob_to_level,
    compute_composite_risk_score,
)
from utils.logger import log_info

router = APIRouter()

DISCLAIMER = (
    "⚠️ This is a behavioral screening tool only. "
    "It is NOT a medical diagnosis. Always consult a qualified "
    "neurologist or physician for clinical evaluation."
)

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest):
    log_info(
        f"[/api/analyze] speech={bool(payload.speech)} memory={bool(payload.memory)} "
        f"reaction={bool(payload.reaction)} stroop={bool(payload.stroop)} "
        f"tap={bool(payload.tap)} profile={bool(payload.profile)}"
    )
    try:
        speech_score,   sf = extract_speech_features(payload.speech_audio or None, payload.speech)
        memory_score,   mf = extract_memory_features(payload.memory_results, payload.memory)
        reaction_score, rf = extract_reaction_features(payload.reaction_times, payload.reaction)
        exec_score,     ef = extract_executive_features(payload.stroop)
        motor_score,    mof = extract_motor_features(payload.tap)

        fv = build_feature_vector(sf, mf, rf, ef, mof)

        risks = compute_disease_risks(fv, payload.profile)

        alz_risk  = risks["alzheimers_risk"]
        dem_risk  = risks["dementia_risk"]
        park_risk = risks["parkinsons_risk"]

        # Compute composite risk score (new)
        composite_data = compute_composite_risk_score(
            speech_score=speech_score,
            memory_score=memory_score,
            reaction_score=reaction_score,
            executive_score=exec_score,
            motor_score=motor_score,
            profile=payload.profile,
        )

        mean_rt = rf.get("mean_rt", 1)
        std_rt  = rf.get("std_rt", 0)
        avi     = round(std_rt / mean_rt, 4) if mean_rt > 0 else 0.0

    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Processing error: {exc}")

    return AnalyzeResponse(
        speech_score=speech_score,
        memory_score=memory_score,
        reaction_score=reaction_score,
        executive_score=exec_score,
        motor_score=motor_score,
        composite_risk_score=composite_data["composite_risk_score"],
        composite_risk_level=composite_data["risk_level"],
        confidence_lower=composite_data["confidence_lower"],
        confidence_upper=composite_data["confidence_upper"],
        model_uncertainty=composite_data["model_uncertainty"],
        alzheimers_risk=alz_risk,
        dementia_risk=dem_risk,
        parkinsons_risk=park_risk,
        risk_levels=DiseaseRiskLevels(
            alzheimers=_prob_to_level(alz_risk),
            dementia=_prob_to_level(dem_risk),
            parkinsons=_prob_to_level(park_risk),
        ),
        feature_vector=fv,
        attention_variability_index=avi,
        disclaimer=DISCLAIMER,
    )
