"""
routers/analyze.py — NeuroAid v3.2
POST /api/analyze — Main cognitive risk indicator endpoint.
"""

from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalyzeResponse, DiseaseRiskLevels
from services.ai_service import (
    extract_speech_features, extract_memory_features,
    extract_reaction_features, extract_executive_features,
    extract_motor_features, compute_disease_risks,
    build_feature_vector, _prob_to_level,
    compute_composite_risk_score,
    apply_education_memory_adjustment,
    apply_medical_condition_multipliers,
    compute_fatigue_confidence,
    compute_logistic_risk_probability,
    compute_risk_drivers,
    get_model_validation,
)
from config import DISCLAIMER
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest):
    """
    Cognitive Early Risk Indicator endpoint.

    This tool does NOT provide medical diagnosis.
    It provides early cognitive risk signals for further evaluation,
    inspired by principles from the MMSE and MoCA screening instruments.

    Pipeline:
      1. Feature extraction (18 features across 5 domains)
      2. Age-adjusted normalization
      3. Education correction (cognitive reserve)
      4. Medical condition risk multipliers
      5. Fatigue confidence scoring
      6. Logistic risk probability
      7. Risk drivers (explainability)
      8. Simulated validation metrics
    """
    logger.info(
        f"[/api/analyze] age={payload.profile.age if payload.profile else None} "
        f"edu={payload.profile.education_level if payload.profile else None}"
    )

    try:
        # ── Feature extraction ────────────────────────────────────────────────
        speech_score,   sf  = extract_speech_features(payload.speech_audio or None, payload.speech)
        memory_score,   mf  = extract_memory_features(payload.memory_results, payload.memory)
        reaction_score, rf  = extract_reaction_features(payload.reaction_times, payload.reaction)
        exec_score,     ef  = extract_executive_features(payload.stroop)
        motor_score,    mof = extract_motor_features(payload.tap)

        # ── Optional test blending ────────────────────────────────────────────
        if payload.digit_span and payload.digit_span.max_forward_span > 0:
            span = payload.digit_span.max_forward_span
            span_score = {4: 40, 5: 60, 6: 75, 7: 85, 8: 92, 9: 100}.get(min(span, 9), 20)
            memory_score = memory_score * 0.80 + span_score * 0.20

        if payload.fluency and payload.fluency.word_count > 0:
            fluency_score = min(100, max(0, (payload.fluency.word_count - 8) * 8 + 50))
            memory_score  = memory_score * 0.85 + fluency_score * 0.15

        # ── Education-adjusted memory (Layer 2) ───────────────────────────────
        education_level      = payload.profile.education_level if payload.profile else None
        adjusted_memory_score = apply_education_memory_adjustment(memory_score, education_level)

        # ── Legacy risk multiplier ────────────────────────────────────────────
        risk_multiplier = 1.0
        if payload.profile:
            if payload.profile.family_history:     risk_multiplier += 0.08
            if payload.profile.existing_diagnosis: risk_multiplier += 0.05
            if payload.profile.sleep_quality in ("poor", "fair"): risk_multiplier += 0.04

        # ── Disease risk models ───────────────────────────────────────────────
        fv    = build_feature_vector(sf, mf, rf, ef, mof)
        risks = compute_disease_risks(fv, payload.profile)

        alz_risk  = min(1.0, risks["alzheimers_risk"] * risk_multiplier)
        dem_risk  = min(1.0, risks["dementia_risk"]   * risk_multiplier)
        park_risk = min(1.0, risks["parkinsons_risk"] * risk_multiplier)

        # ── Medical condition multipliers (Layer 3) ───────────────────────────
        conditions = {}
        if payload.profile and payload.profile.medical_conditions:
            conditions = payload.profile.medical_conditions.dict()
        alz_risk  = apply_medical_condition_multipliers(alz_risk,  conditions)
        dem_risk  = apply_medical_condition_multipliers(dem_risk,  conditions)
        park_risk = apply_medical_condition_multipliers(park_risk, conditions)

        # ── Logistic risk probability (Layers 1+2+Logistic) ──────────────────
        age = payload.profile.age if payload.profile else None
        logistic_prob, logistic_level = compute_logistic_risk_probability(
            speech_score=speech_score,
            memory_score=adjusted_memory_score,
            reaction_score=reaction_score,
            age=age,
        )

        # ── Fatigue confidence (Layer 4) ──────────────────────────────────────
        fatigue_flags = {}
        if payload.profile and payload.profile.fatigue_flags:
            fatigue_flags = payload.profile.fatigue_flags.dict()
        provided      = sum([bool(payload.speech), bool(payload.memory), bool(payload.reaction)])
        missing_ratio = 1.0 - (provided / 3.0)
        confidence_result = compute_fatigue_confidence(fatigue_flags, missing_ratio)

        # ── Composite risk score ──────────────────────────────────────────────
        composite_data = compute_composite_risk_score(
            speech_score=speech_score, memory_score=adjusted_memory_score,
            reaction_score=reaction_score, executive_score=exec_score,
            motor_score=motor_score, profile=payload.profile,
        )

        # ── Explainability ────────────────────────────────────────────────────
        risk_drivers = compute_risk_drivers(
            speech_score=speech_score, memory_score=adjusted_memory_score,
            reaction_score=reaction_score, executive_score=exec_score,
            motor_score=motor_score,
        )

        # ── Simulated validation ──────────────────────────────────────────────
        model_validation = get_model_validation()

        mean_rt = rf.get("mean_rt", 1)
        std_rt  = rf.get("std_rt", 0)
        avi     = round(std_rt / mean_rt, 4) if mean_rt > 0 else 0.0

    except Exception as exc:
        logger.error(f"[/api/analyze] Processing error: {exc}")
        raise HTTPException(status_code=422, detail=f"Processing error: {exc}")

    return AnalyzeResponse(
        speech_score=speech_score,
        memory_score=memory_score,
        reaction_score=reaction_score,
        executive_score=exec_score,
        motor_score=motor_score,
        adjusted_memory_score=adjusted_memory_score,
        composite_risk_score=composite_data["composite_risk_score"],
        composite_risk_level=composite_data["risk_level"],
        confidence_lower=composite_data["confidence_lower"],
        confidence_upper=composite_data["confidence_upper"],
        confidence_interval_label=composite_data["confidence_interval_label"],
        model_uncertainty=composite_data["model_uncertainty"],
        logistic_risk_probability=logistic_prob,
        logistic_risk_level=logistic_level,
        confidence_score=confidence_result["confidence"],
        recommend_retest=confidence_result["recommend_retest"],
        retest_message=confidence_result["retest_message"],
        alzheimers_risk=alz_risk,
        dementia_risk=dem_risk,
        parkinsons_risk=park_risk,
        risk_levels=DiseaseRiskLevels(
            alzheimers=_prob_to_level(alz_risk),
            dementia=_prob_to_level(dem_risk),
            parkinsons=_prob_to_level(park_risk),
        ),
        risk_drivers=risk_drivers,
        model_validation=model_validation,
        feature_vector=fv,
        attention_variability_index=avi,
        disclaimer=DISCLAIMER,
    )
