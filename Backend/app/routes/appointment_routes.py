"""
MediLens AI — Appointment Routes
"""

from fastapi import APIRouter, Depends
from typing import List

from app.schemas.appointment_schema import BookConsultationRequest, AppointmentResponse
from app.services.appointment_service import book_consultation, get_doctor_appointments

# Need standard user email for booking
from app.core.deps import get_current_user_email
# Need doctor email to fetch doctor appointments
from app.core.deps import oauth2_scheme

router = APIRouter(prefix="/api/v1/appointments", tags=["Appointments"])

@router.post(
    "/book",
    summary="Book a consultation with a matched doctor",
    response_model=AppointmentResponse
)
async def book_appointment(
    payload: BookConsultationRequest, 
    user_email: str = Depends(get_current_user_email)
):
    """Creates a new consultation booking linked to a specific AI assessment report."""
    appointment = await book_consultation(user_email, payload.model_dump())
    return appointment

@router.get(
    "/doctor",
    summary="Get all appointments for the logged-in doctor",
    response_model=List[AppointmentResponse]
)
async def fetch_doctor_appointments(
    doctor_email: str = Depends(get_current_user_email)
):
    """Returns a list of consultations for the doctor, including patient details and AI reports where applicable.
       A Doctor token is required. (Currently relies on standard Email extraction).
    """
    appointments = await get_doctor_appointments(doctor_email)
    return appointments
