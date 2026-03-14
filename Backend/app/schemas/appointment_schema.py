"""
MediLens AI — Appointment and Matching Pydantic Schemas
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

class BookConsultationRequest(BaseModel):
    """Payload to book a consultation linking an AI assessment to a doctor."""
    doctor_id: str = Field(..., description="MongoDB ID of the chosen doctor")
    assessment_id: str = Field(..., description="MongoDB ID of the saved AI symptom check history")


class AppointmentResponse(BaseModel):
    """Response returned when an appointment is booked or fetched."""
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., alias="_id")
    user_email: str
    doctor_id: str
    assessment_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    # Optional populated fields for when the doctor views the appointment
    patient_details: Optional[dict] = None
    assessment_report: Optional[dict] = None

class DoctorMatchRequest(BaseModel):
    """Payload for finding matching doctors based on specialties."""
    specialties: list[str] = Field(..., description="List of medical specialties to match against")
