"""
MediLens AI — Symptom Checker Service

Proxies requests to the external RAG-based AI service,
parses the response, and persists the check to MongoDB.
"""

from datetime import datetime, timezone
from typing import Optional, List

import httpx
from fastapi import HTTPException, status, BackgroundTasks

from app.config.database import get_database
from app.config.settings import settings
from app.core.logger import logger
from app.schemas.symptom_schema import AIHistoryPayload

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────
SYMPTOM_CHECKS = "symptom_checks"
AI_HISTORIES = "ai_histories"

# ──────────────────────────────────────────────
# Shared HTTP client (set from main.py on startup)
# ──────────────────────────────────────────────
_http_client: Optional[httpx.AsyncClient] = None


def set_http_client(client: httpx.AsyncClient) -> None:
    """Called once at app startup to inject the shared client."""
    global _http_client
    _http_client = client


def get_http_client() -> httpx.AsyncClient:
    """Return the shared client; raises if not initialised."""
    if _http_client is None:
        raise RuntimeError("HTTP client not initialised. Is the app started?")
    return _http_client


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _build_rag_payload(
    name: str,
    age: int,
    gender: str,
    symptoms: List[str],
    symptoms_name: str,
    pain_intensity: int,
    duration: str,
    symptom_duration: str,
    additional_notes: Optional[str],
) -> dict:
    """Build the request body expected by the RAG AI service."""
    # Convert list of symptoms to a single comma-separated string
    # because the RAG service expects a string, not a list.
    symptoms_str = ", ".join(symptoms) if symptoms else ""

    # Provide symptom_duration if frontend specified it, else fallback to duration
    final_duration = symptom_duration if symptom_duration else duration

    return {
        "name": name,
        "age": age,
        "gender": gender,
        "symptoms": symptoms_str,
        "symptoms_name": symptoms_name,
        "pain_intensity": pain_intensity,
        "symptom_duration": final_duration,
        "additional_notes": additional_notes or "",
    }


async def _save_check_to_db(
    user_email: Optional[str],
    request_data: dict,
    response_data: dict,
) -> str:
    """Persist the symptom check to MongoDB. Returns the inserted document ID."""
    db = get_database()
    doc = {
        "user_email": user_email,
        "request": request_data,
        "response": response_data,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db[SYMPTOM_CHECKS].insert_one(doc)
    logger.info("Symptom check saved — id=%s", result.inserted_id)
    return str(result.inserted_id)


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

async def check_symptoms(
    name: str,
    age: int,
    gender: str,
    symptoms: List[str],
    symptoms_name: str,
    pain_intensity: int,
    duration: str,
    symptom_duration: str,
    additional_notes: Optional[str] = None,
    user_email: Optional[str] = None,
    background_tasks: Optional[BackgroundTasks] = None,
) -> dict:
    """
    Main entry point for the symptom checker.

    1. Build payload
    2. POST to external RAG service
    3. Save result to DB (in background for speed)
    4. Return structured response
    """
    client = get_http_client()

    payload = _build_rag_payload(
        name=name,
        age=age,
        gender=gender,
        symptoms=symptoms,
        symptoms_name=symptoms_name,
        pain_intensity=pain_intensity,
        duration=duration,
        symptom_duration=symptom_duration,
        additional_notes=additional_notes,
    )

    # ── Call external RAG service ────────────
    try:
        logger.info("Calling RAG service at %s", settings.RAG_SERVICE_URL)
        response = await client.post(
            settings.RAG_SERVICE_URL,
            json=payload,
            timeout=settings.RAG_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        ai_result = response.json()
        logger.info("RAG service responded — triage_level=%s", ai_result.get("triage_level"))
        logger.info("RAG service full response: %s", ai_result)
    except httpx.TimeoutException:
        logger.error("RAG service timed out after %ds", settings.RAG_TIMEOUT_SECONDS)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The AI analysis service is taking too long. Please try again.",
        )
    except httpx.HTTPStatusError as exc:
        logger.error("RAG service returned %d: %s", exc.response.status_code, exc.response.text)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The AI analysis service returned an error. Please try again later.",
        )
    except httpx.ConnectError:
        logger.error("Cannot reach RAG service at %s", settings.RAG_SERVICE_URL)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI analysis service is currently unavailable. Please try again later.",
        )
    except Exception as exc:
        logger.error("Unexpected error calling RAG service: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while analysing symptoms.",
        )

    # ── Save to DB (in background for minimal latency) ─
    async def _bg_save():
        await _save_check_to_db(
            user_email=user_email,
            request_data=payload,
            response_data=ai_result,
        )

    check_id = "pending"
    if background_tasks:
        background_tasks.add_task(_bg_save)
    else:
        check_id = await _save_check_to_db(
            user_email=user_email,
            request_data=payload,
            response_data=ai_result,
        )

    # ── Build final response ────────────────
    now = datetime.now(timezone.utc)
    return {
        "check_id": check_id,
        "status": "success",
        "analysis": {
            "summary": ai_result.get("summary", ""),
            "potential_causes": ai_result.get("potential_causes", []),
            "alternative_conditions": ai_result.get("alternative_conditions", []),
            "risk_level": ai_result.get("risk_level", "UNKNOWN"),
            "triage_level": ai_result.get("triage_level", "Level 5"),
            "triage_advice": ai_result.get("triage_advice", ""),
            "severity_score": ai_result.get("severity_score", 0),
            "visual_findings": ai_result.get("visual_findings", ""),
            "suspected_condition": ai_result.get("suspected_condition", ""),
            "reasoning": ai_result.get("reasoning", "No detailed reasoning provided."),
            "first_aid": ai_result.get("first_aid", []),
            "watch_for": ai_result.get("watch_for", []),
            "specialist": ai_result.get("specialist", "General Practitioner"),
            "recommended_specialists": ai_result.get("recommended_specialists", []),
            "ai_confidence": ai_result.get("ai_confidence", "Unknown"),
            "sources": ai_result.get("sources", []),
            "note": ai_result.get("note", None)
        },
        "created_at": now.isoformat(),
    }


async def save_user_history(user_email: str, payload: AIHistoryPayload) -> dict:
    """Explicitly save an AI analysis result for a logged-in user."""
    db = get_database()
    
    doc = {
        "user_email": user_email,
        "result": payload.model_dump(),
        "created_at": datetime.now(timezone.utc),
    }
    
    result = await db[AI_HISTORIES].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    doc["id"] = doc["_id"]
    
    logger.info("Saved explicit AI history for user %s", user_email)
    return doc


async def get_user_history(user_email: str) -> List[dict]:
    """Retrieve all saved AI histories for a user, sorted newest first."""
    db = get_database()
    
    cursor = db[AI_HISTORIES].find({"user_email": user_email}).sort("created_at", -1)
    histories = []
    async for history in cursor:
        history["_id"] = str(history["_id"])
        history["id"] = history["_id"]
        histories.append(history)
        
    return histories
