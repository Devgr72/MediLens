"""
MediLens AI — Symptom Checker Pydantic Schemas

Request / response models for the AI symptom checker system.
"""

from datetime import datetime
from typing import List, Optional, Any, Dict

from pydantic import BaseModel, Field


# ── Request schemas ──────────────────────────

class SymptomCheckRequest(BaseModel):
    """Payload from the frontend symptom checker form."""
    name: str = Field(..., min_length=2, max_length=100, examples=["Jane Doe"])
    age: int = Field(..., ge=1, le=120, examples=[25])
    gender: str = Field(
        ...,
        pattern="(?i)^(male|female|other)$",
        examples=["female"],
        description="One of: male, female, other (case-insensitive)",
    )
    symptoms: List[str] = Field(
        default_factory=list,
        examples=[["headache", "fever", "fatigue"]],
        description="List of symptom names",
    )
    symptoms_name: str = Field(default="", description="Name/text of symptoms from frontend")
    pain_intensity: int = Field(
        ...,
        ge=1,
        le=10,
        examples=[7],
        description="Pain level from 1 (low) to 10 (high)",
    )
    duration: str = Field(
        default="",
        max_length=200,
        examples=["3 days"],
        description="How long the symptoms have persisted",
    )
    symptom_duration: str = Field(
        default="",
        max_length=200,
        description="How long the symptom has persisted",
    )
    additional_notes: Optional[str] = Field(
        None,
        max_length=500,
        examples=["Started after travel"],
        description="Optional notes from the user",
    )


# ── Response schemas ─────────────────────────

class SymptomCheckResponse(BaseModel):
    """Structured AI diagnosis response returned to the frontend."""
    assessment_id: str = Field(alias="check_id", description="MongoDB document ID for this check")
    status: str = "success"
    analysis: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)
