"""
MediLens AI — Doctor Auth and Profile Pydantic Schemas

Request / response models for the doctor authentication and profile system.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


# ── Nested structures for Doctor Payload ───────────────────────

class AddressSchema(BaseModel):
    city: str
    state: str
    pincode: str
    full_address: str


class BasicDetailsSchema(BaseModel):
    name: str = Field(..., examples=["Dr. Rahul Sharma"])
    email: EmailStr = Field(..., examples=["rahul.sharma@gmail.com"])
    phone: str = Field(..., examples=["9876543210"])
    password: str = Field(..., min_length=8, max_length=128, examples=["Rahul@123"])
    gender: str = Field(..., examples=["Male"])
    dob: str = Field(..., examples=["1990-05-12"])
    profile_photo: Optional[str] = None
    address: AddressSchema


class QualificationSchema(BaseModel):
    degree: str
    higher_degree: Optional[str] = None
    university: str
    graduation_year: str


class ProfessionalDetailsSchema(BaseModel):
    license_number: str
    medical_council: str
    registration_year: str
    qualification: QualificationSchema
    specialization: str
    sub_specialization: Optional[str] = None
    experience_years: str


class WorkplaceDetailsSchema(BaseModel):
    workplace_type: str
    hospital_or_clinic_name: str
    department: Optional[str] = None
    work_address: AddressSchema


class ConsultationDetailsSchema(BaseModel):
    consultation_fee: str
    consultation_type: str
    available_days: List[str]
    available_time: str


class DocumentsSchema(BaseModel):
    license_certificate: str
    degree_certificate: str
    government_id: str


# ── Request schemas ──────────────────────────

class DoctorSignupRequest(BaseModel):
    """Payload for doctor email + password registration."""
    basic_details: BasicDetailsSchema
    professional_details: ProfessionalDetailsSchema
    workplace_details: WorkplaceDetailsSchema
    consultation_details: ConsultationDetailsSchema
    documents: DocumentsSchema
    account_status: str = "pending"


class DoctorLoginRequest(BaseModel):
    """Payload for email + password login."""
    email: EmailStr = Field(..., examples=["rahul.sharma@gmail.com"])
    password: str = Field(..., examples=["Rahul@123"])


# Reusing existing OTP structures but keeping it scoped for doctors if needed
class DoctorOTPVerifyRequest(BaseModel):
    """Payload for OTP verification."""
    email: EmailStr = Field(..., examples=["rahul.sharma@gmail.com"])
    otp: str = Field(..., min_length=6, max_length=6, examples=["123456"])


class DoctorResendOTPRequest(BaseModel):
    email: EmailStr


class DoctorGoogleLoginRequest(BaseModel):
    """Payload for Google OAuth login."""
    id_token: str = Field(..., description="Google ID token from client-side sign-in")


# ── Response schemas ─────────────────────────

class DoctorAuthResponse(BaseModel):
    """Standard auth response with token and doctor info."""
    access_token: str
    token_type: str = "bearer"
    user: dict  # Using dict here to accommodate the rich doctor structure with generic _public_user

