"""
MediLens AI — Symptom Checker Routes

Endpoint for the AI-powered symptom analysis.
"""

from fastapi import APIRouter, status, BackgroundTasks

from app.schemas.symptom_schema import SymptomCheckRequest, SymptomCheckResponse
from app.services.symptom_service import check_symptoms

router = APIRouter(prefix="/api/v1/symptoms", tags=["Symptom Checker"])


@router.post(
    "/check",
    response_model=SymptomCheckResponse,
    status_code=status.HTTP_200_OK,
    summary="Run AI symptom analysis",
)
async def symptom_check(payload: SymptomCheckRequest, background_tasks: BackgroundTasks):
    """
    Accept patient details and symptoms, forward them to the RAG-based AI
    diagnosis service, and return the structured analysis result.
    """
    result = await check_symptoms(
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        symptoms=payload.symptoms,
        symptoms_name=payload.symptoms_name,
        pain_intensity=payload.pain_intensity,
        duration=payload.duration,
        symptom_duration=payload.symptom_duration,
        additional_notes=payload.additional_notes,
        background_tasks=background_tasks,
    )
    return result
