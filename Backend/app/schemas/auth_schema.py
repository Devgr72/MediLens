"""
MediLens AI — Auth Pydantic Schemas

Request / response models for the authentication system.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ── Request schemas ──────────────────────────

class SignupRequest(BaseModel):
    """Payload for email + password registration."""
    name: str = Field(..., min_length=2, max_length=100, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@medilens.ai"])
    password: str = Field(..., min_length=8, max_length=128, examples=["S3cur3P@ss!"])


class LoginRequest(BaseModel):
    """Payload for email + password login."""
    email: EmailStr = Field(..., examples=["jane@medilens.ai"])
    password: str = Field(..., examples=["S3cur3P@ss!"])


class OTPVerifyRequest(BaseModel):
    """Payload for OTP verification."""
    email: EmailStr = Field(..., examples=["jane@medilens.ai"])
    otp: str = Field(..., min_length=6, max_length=6, examples=["123456"])


class ResendOTPRequest(BaseModel):
    """Payload for resending OTP."""
    email: EmailStr = Field(..., examples=["jane@medilens.ai"])


class GoogleLoginRequest(BaseModel):
    """Payload for Google OAuth login."""
    id_token: str = Field(..., description="Google ID token from client-side sign-in")


class ForgotPasswordRequest(BaseModel):
    """Payload to request a password reset OTP."""
    email: EmailStr = Field(..., examples=["jane@medilens.ai"])


class ResetPasswordRequest(BaseModel):
    """Payload to reset password using an OTP."""
    email: EmailStr = Field(..., examples=["jane@medilens.ai"])
    otp: str = Field(..., min_length=6, max_length=6, examples=["123456"])
    new_password: str = Field(..., min_length=8, max_length=128, examples=["N3wP@ssw0rd!"])


# ── Response schemas ─────────────────────────

class AuthResponse(BaseModel):
    """Standard auth response with token and user info."""
    access_token: str
    token_type: str = "bearer"
    user: dict


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    detail: Optional[str] = None
