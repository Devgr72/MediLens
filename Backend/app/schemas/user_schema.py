"""
MediLens AI — User Pydantic Schemas

Request / response models used for validation and serialisation.
"""

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


# ── Request schemas ──────────────────────────

class UserCreate(BaseModel):
    """Payload for user registration."""
    full_name: str = Field(..., min_length=2, max_length=100, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@medilens.ai"])
    password: str = Field(..., min_length=8, max_length=128, examples=["S3cur3P@ss!"])


class UserLogin(BaseModel):
    """Payload for user login."""
    email: EmailStr = Field(..., examples=["jane@medilens.ai"])
    password: str = Field(..., examples=["S3cur3P@ss!"])


# ── Response schemas ─────────────────────────

class UserResponse(BaseModel):
    """Public-facing user representation (no password)."""
    id: str = Field(..., alias="_id")
    full_name: str
    email: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"populate_by_name": True}


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
