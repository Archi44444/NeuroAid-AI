"""
auth.py — NeuroAid Authentication Router
Handles register, login, logout with local JSON file storage.
Role-separated: patients cannot login to doctor panel and vice versa.
"""

import json
import os
import re
import hashlib
import secrets
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field
from typing import Optional, List

router = APIRouter(prefix="/auth", tags=["auth"])

_EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")

# ── Local storage path ────────────────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")
SESSIONS_FILE = os.path.join(DATA_DIR, "sessions.json")

os.makedirs(DATA_DIR, exist_ok=True)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _load_json(path: str) -> dict:
    if not os.path.exists(path):
        return {}
    with open(path, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}


def _save_json(path: str, data: dict):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def _hash_password(password: str) -> str:
    salted = f"neuroaid_salt_{password}"
    return hashlib.sha256(salted.encode()).hexdigest()


def _get_users() -> dict:
    return _load_json(USERS_FILE)


def _save_users(users: dict):
    _save_json(USERS_FILE, users)


def _get_sessions() -> dict:
    return _load_json(SESSIONS_FILE)


def _save_sessions(sessions: dict):
    _save_json(SESSIONS_FILE, sessions)


def _create_session(user_id: str) -> str:
    token = secrets.token_hex(32)
    sessions = _get_sessions()
    sessions[token] = {
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat(),
    }
    _save_sessions(sessions)
    return token


def _get_user_from_token(token: str) -> Optional[dict]:
    sessions = _get_sessions()
    session = sessions.get(token)
    if not session:
        return None
    users = _get_users()
    return users.get(session["user_id"])


def _safe_user(user: dict) -> dict:
    return {k: v for k, v in user.items() if k != "password_hash"}


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6, max_length=128)
    role: str = Field(default="patient")          # "patient" or "doctor"
    age: Optional[int] = Field(default=None, ge=1, le=120)
    gender: Optional[str] = None
    license_number: Optional[str] = None          # for doctors


class LoginRequest(BaseModel):
    email: str
    password: str
    role: str = Field(default="patient")          # "patient" or "doctor"


class AuthResponse(BaseModel):
    message: str
    token: str
    user: dict


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    """Register a new user (patient or doctor)."""
    # Validate email format
    if not _EMAIL_RE.match(body.email.strip()):
        raise HTTPException(status_code=400, detail="Please enter a valid email address (e.g. name@example.com).")

    # Validate role
    if body.role not in ("patient", "doctor"):
        raise HTTPException(status_code=400, detail="Role must be 'patient' or 'doctor'.")

    users = _get_users()

    # Check duplicate email within the same role
    for uid, user in users.items():
        if user["email"].lower() == body.email.lower() and user.get("role", "patient") == body.role:
            raise HTTPException(status_code=400, detail="Email already registered for this role.")

    user_id = str(uuid.uuid4())
    new_user = {
        "id": user_id,
        "full_name": body.full_name,
        "email": body.email.lower(),
        "password_hash": _hash_password(body.password),
        "role": body.role,
        "age": body.age,
        "gender": body.gender,
        "license_number": body.license_number if body.role == "doctor" else None,
        "created_at": datetime.utcnow().isoformat(),
        "last_login": datetime.utcnow().isoformat(),
    }

    users[user_id] = new_user
    _save_users(users)

    token = _create_session(user_id)
    return AuthResponse(message="Registration successful!", token=token, user=_safe_user(new_user))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    """Login — role must match the panel the user is trying to access."""
    if body.role not in ("patient", "doctor"):
        raise HTTPException(status_code=400, detail="Role must be 'patient' or 'doctor'.")

    users = _get_users()

    matched_user = None
    matched_id = None
    for uid, user in users.items():
        if user["email"].lower() == body.email.lower():
            matched_user = user
            matched_id = uid
            break

    if not matched_user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if matched_user["password_hash"] != _hash_password(body.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # ── Role guard: block cross-panel login ───────────────────────────────────
    if matched_user.get("role", "patient") != body.role:
        if body.role == "doctor":
            raise HTTPException(
                status_code=403,
                detail="This account is registered as a Patient. Please use the Patient panel."
            )
        else:
            raise HTTPException(
                status_code=403,
                detail="This account is registered as a Doctor. Please use the Doctor panel."
            )

    # Update last login
    users[matched_id]["last_login"] = datetime.utcnow().isoformat()
    _save_users(users)

    token = _create_session(matched_id)
    return AuthResponse(message="Login successful!", token=token, user=_safe_user(matched_user))


@router.post("/logout")
def logout(authorization: str = Header(...)):
    """Logout — invalidates the session token."""
    token = authorization.replace("Bearer ", "").strip()
    sessions = _get_sessions()

    if token not in sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")

    del sessions[token]
    _save_sessions(sessions)
    return {"message": "Logged out successfully."}


@router.get("/me")
def get_current_user(authorization: str = Header(...)):
    """Get the currently logged-in user's profile."""
    token = authorization.replace("Bearer ", "").strip()
    user = _get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized. Please log in.")
    return {"user": _safe_user(user)}


@router.get("/patients")
def get_patients(authorization: str = Header(...)):
    """Doctors only — get all registered patients with their latest assessment result."""
    token = authorization.replace("Bearer ", "").strip()
    user = _get_user_from_token(token)

    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized. Please log in.")
    if user.get("role", "patient") != "doctor":
        raise HTTPException(status_code=403, detail="Access denied. Doctors only.")

    # Load results file
    results_path = os.path.join(DATA_DIR, "results.json")
    all_results = {}
    if os.path.exists(results_path):
        with open(results_path) as f:
            try: all_results = json.load(f)
            except: all_results = {}

    users = _get_users()
    patients = []
    for u in users.values():
        if u.get("role", "patient") != "patient":
            continue
        p = _safe_user(u)
        uid = u["id"]
        user_results = all_results.get(uid, [])
        p["sessionCount"] = len(user_results)
        p["lastResult"]   = user_results[-1] if user_results else None
        patients.append(p)

    # Sort by last_login descending
    patients.sort(key=lambda p: p.get("last_login", ""), reverse=True)
    return {"patients": patients}


@router.put("/me")
def update_profile(body: UserProfileUpdate, authorization: str = Header(...)):
    """Update the logged-in user's profile."""
    token = authorization.replace("Bearer ", "").strip()
    sessions = _get_sessions()
    session = sessions.get(token)

    if not session:
        raise HTTPException(status_code=401, detail="Unauthorized. Please log in.")

    users = _get_users()
    user_id = session["user_id"]

    if body.full_name is not None:
        users[user_id]["full_name"] = body.full_name
    if body.age is not None:
        users[user_id]["age"] = body.age
    if body.gender is not None:
        users[user_id]["gender"] = body.gender

    _save_users(users)
    return {"message": "Profile updated.", "user": _safe_user(users[user_id])}


@router.get("/doctors")
def get_doctors(authorization: str = Header(...)):
    """Patients — get all registered doctors to start a conversation."""
    token = authorization.replace("Bearer ", "").strip()
    user  = _get_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized.")
    users = _get_users()
    doctors = [_safe_user(u) for u in users.values() if u.get("role") == "doctor"]
    return {"doctors": doctors}