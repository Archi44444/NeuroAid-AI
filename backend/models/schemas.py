"""
schemas.py
──────────
Pydantic request / response models for the NeuroAid API.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    speech_audio: Optional[str] = Field(
        default=None,
        description="Base64-encoded audio blob from the frontend microphone capture.",
    )
    memory_results: Dict[str, float] = Field(
        default={"word_recall_accuracy": 50.0, "pattern_accuracy": 50.0},
        description="Accuracy scores (0–100) from in-app memory games.",
        example={"word_recall_accuracy": 80, "pattern_accuracy": 70},
    )
    reaction_times: List[float] = Field(
        default=[],
        description="List of reaction times in milliseconds from reflex tests.",
        example=[300, 280, 350, 310],
    )

    class Config:
        json_schema_extra = {
            "example": {
                "speech_audio": "<base64-audio>",
                "memory_results": {"word_recall_accuracy": 80, "pattern_accuracy": 70},
                "reaction_times": [300, 280, 350, 310],
            }
        }


class AnalyzeResponse(BaseModel):
    speech_score: float = Field(..., description="Speech health score (0–100, higher = healthier).")
    memory_score: float = Field(..., description="Memory performance score (0–100).")
    reaction_score: float = Field(..., description="Reaction speed score (0–100).")
    risk_score: float = Field(..., description="Composite weighted risk score (0–100).")
    risk_level: str = Field(..., description="Risk category: Low | Moderate | High.")

    class Config:
        json_schema_extra = {
            "example": {
                "speech_score": 78.5,
                "memory_score": 75.0,
                "reaction_score": 82.3,
                "risk_score": 77.66,
                "risk_level": "Low",
            }
        }
