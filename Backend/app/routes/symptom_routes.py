"""
MediLens AI — Symptom Checker Routes

Endpoint for the AI-powered symptom analysis.
"""

from fastapi import APIRouter, Depends, status, BackgroundTasks

from app.core.deps import get_current_user_email
from app.schemas.symptom_schema import (
    AIHistoryPayload,
    AIHistoryResponse,
    SymptomCheckRequest,
    SymptomCheckResponse,
)
from app.services.symptom_service import check_symptoms, get_user_history, save_user_history

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


@router.post(
    "/history",
    response_model=AIHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save explicitly verified AI symptom diagnosis",
)
async def save_history(
    payload: AIHistoryPayload,
    current_user_email: str = Depends(get_current_user_email)
):
    """Save the AI diagnosis to the authenticated user's history."""
    return await save_user_history(user_email=current_user_email, payload=payload)


@router.get(
    "/history",
    response_model=list[dict],
    summary="Retrieve AI symptom diagnosis history",
)
async def retrieve_history(current_user_email: str = Depends(get_current_user_email)):
    """Fetch all saved explicit AI diagnosis histories for the authenticated user."""
    return await get_user_history(user_email=current_user_email)
