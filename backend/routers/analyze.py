import json, os
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models.schemas import AnalyzeRequest, AnalyzeResponse, DiseaseRiskLevels
from services.ai_service import (
    extract_speech_features, extract_memory_features,
    extract_reaction_features, extract_executive_features,
    extract_motor_features, compute_disease_risks,
    build_feature_vector, _prob_to_level,
)
from utils.logger import log_info

router = APIRouter()

DISCLAIMER = (
    "⚠️ This is a behavioral screening tool only. "
    "It is NOT a medical diagnosis. Always consult a qualified "
    "neurologist or physician for clinical evaluation."
)

# ── Local storage ─────────────────────────────────────────────────────────────
DATA_DIR     = os.path.join(os.path.dirname(__file__), "..", "data")
RESULTS_FILE = os.path.join(DATA_DIR, "results.json")
SESSIONS_FILE= os.path.join(DATA_DIR, "sessions.json")
USERS_FILE   = os.path.join(DATA_DIR, "users.json")
os.makedirs(DATA_DIR, exist_ok=True)

def _load(path):
    if not os.path.exists(path): return {}
    with open(path) as f:
        try: return json.load(f)
        except: return {}

def _save(path, data):
    with open(path, "w") as f: json.dump(data, f, indent=2)

def _user_from_token(token: str) -> Optional[dict]:
    sessions = _load(SESSIONS_FILE)
    session  = sessions.get(token)
    if not session: return None
    users = _load(USERS_FILE)
    return users.get(session["user_id"])

# ── Analyze ───────────────────────────────────────────────────────────────────
@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(payload: AnalyzeRequest, authorization: Optional[str] = Header(default=None)):
    log_info(
        f"[/api/analyze] speech={bool(payload.speech)} memory={bool(payload.memory)} "
        f"reaction={bool(payload.reaction)} stroop={bool(payload.stroop)} tap={bool(payload.tap)}"
    )
    try:
        speech_score,  sf  = extract_speech_features(payload.speech_audio or None, payload.speech)
        memory_score,  mf  = extract_memory_features(payload.memory_results, payload.memory)
        reaction_score,rf  = extract_reaction_features(payload.reaction_times, payload.reaction)
        exec_score,    ef  = extract_executive_features(payload.stroop)
        motor_score,   mof = extract_motor_features(payload.tap)
        fv    = build_feature_vector(sf, mf, rf, ef, mof)
        risks = compute_disease_risks(fv, payload.profile)
        alz_risk  = risks["alzheimers_risk"]
        dem_risk  = risks["dementia_risk"]
        park_risk = risks["parkinsons_risk"]
        mean_rt = rf.get("mean_rt", 1)
        std_rt  = rf.get("std_rt", 0)
        avi     = round(std_rt / mean_rt, 4) if mean_rt > 0 else 0.0
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Processing error: {exc}")

    result_data = {
        "timestamp":        datetime.utcnow().isoformat(),
        "speech_score":     speech_score,
        "memory_score":     memory_score,
        "reaction_score":   reaction_score,
        "executive_score":  exec_score,
        "motor_score":      motor_score,
        "alzheimers_risk":  alz_risk,
        "dementia_risk":    dem_risk,
        "parkinsons_risk":  park_risk,
        "risk_levels": {
            "alzheimers": _prob_to_level(alz_risk),
            "dementia":   _prob_to_level(dem_risk),
            "parkinsons": _prob_to_level(park_risk),
        },
        "attention_variability_index": avi,
        "disclaimer": DISCLAIMER,
    }

    # ── Save result linked to user ────────────────────────────────────────────
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        user  = _user_from_token(token)
        if user:
            results = _load(RESULTS_FILE)
            uid = user["id"]
            if uid not in results:
                results[uid] = []
            results[uid].append(result_data)
            # Keep last 20 results per user
            results[uid] = results[uid][-20:]
            _save(RESULTS_FILE, results)

    return AnalyzeResponse(
        speech_score=speech_score,
        memory_score=memory_score,
        reaction_score=reaction_score,
        executive_score=exec_score,
        motor_score=motor_score,
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

# ── Get my results (patient) ──────────────────────────────────────────────────
@router.get("/results/my")
def get_my_results(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "").strip()
    user  = _user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized.")
    results = _load(RESULTS_FILE)
    return {"results": results.get(user["id"], [])}

# ── Get specific patient results (doctor only) ────────────────────────────────
@router.get("/results/patient/{patient_id}")
def get_patient_results(patient_id: str, authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "").strip()
    user  = _user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized.")
    if user.get("role", "patient") != "doctor":
        raise HTTPException(status_code=403, detail="Doctors only.")
    results = _load(RESULTS_FILE)
    return {"results": results.get(patient_id, [])}