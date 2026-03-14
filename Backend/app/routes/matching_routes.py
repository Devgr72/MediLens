"""
MediLens AI — Matching Routes
"""

from fastapi import APIRouter, Depends
from typing import List

from app.schemas.appointment_schema import DoctorMatchRequest
from app.services.matching_service import find_matching_doctors

router = APIRouter(prefix="/api/v1/matching", tags=["Doctor Matching"])

@router.post(
    "/doctors",
    summary="Find doctors matching an AI specialty recommendation",
)
async def match_doctors(payload: DoctorMatchRequest):
    """Returns a list of approved doctors whose specialization matches the requested array."""
    # We don't necessarily require auth to see matched doctors (anyone can use symptom checker)
    # But it could be protected if desired.
    doctors = await find_matching_doctors(specialties=payload.specialties)
    return doctors
