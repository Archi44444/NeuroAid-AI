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
        f"tap={bool(payload.tap)} fluency={bool(payload.fluency)} "
        f"digit_span={bool(payload.digit_span)} profile={bool(payload.profile)}"
    )
    try:
        speech_score,   sf = extract_speech_features(payload.speech_audio or None, payload.speech)
        memory_score,   mf = extract_memory_features(payload.memory_results, payload.memory)
        reaction_score, rf = extract_reaction_features(payload.reaction_times, payload.reaction)
        exec_score,     ef = extract_executive_features(payload.stroop)
        motor_score,    mof = extract_motor_features(payload.tap)

        # ── Boost memory score with digit span if available ────────────────
        if payload.digit_span and payload.digit_span.max_forward_span > 0:
            span = payload.digit_span.max_forward_span
            # Normal span is 7±2 (5–9). Score: <4=0, 4=40, 5=60, 6=75, 7=85, 8=92, 9+=100
            span_scores = {4: 40, 5: 60, 6: 75, 7: 85, 8: 92, 9: 100}
            span_score = span_scores.get(min(span, 9), 100 if span >= 9 else 20)
            # Blend 80% existing memory, 20% digit span
            memory_score = memory_score * 0.80 + span_score * 0.20

        # ── Adjust memory score with verbal fluency if available ───────────
        if payload.fluency and payload.fluency.word_count > 0:
            wc = payload.fluency.word_count
            # <8 poor, 8-11 below avg, 12-14 avg, 15-17 good, 18+ excellent
            fluency_score = min(100, max(0, (wc - 8) * 8 + 50))
            # Blend 85% existing memory, 15% fluency
            memory_score = memory_score * 0.85 + fluency_score * 0.15

        # ── Family history / existing diagnosis risk boost ─────────────────
        risk_multiplier = 1.0
        if payload.profile:
            if payload.profile.family_history:
                risk_multiplier += 0.08  # 8% boost to risk signals
            if payload.profile.existing_diagnosis:
                risk_multiplier += 0.05
            if payload.profile.sleep_quality in ("poor", "fair"):
                risk_multiplier += 0.04

        fv = build_feature_vector(sf, mf, rf, ef, mof)

        risks = compute_disease_risks(fv, payload.profile)

        alz_risk  = min(1.0, risks["alzheimers_risk"] * risk_multiplier)
        dem_risk  = min(1.0, risks["dementia_risk"]   * risk_multiplier)
        park_risk = min(1.0, risks["parkinsons_risk"] * risk_multiplier)

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
