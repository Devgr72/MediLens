"""
MediLens AI — Health Check Route

A lightweight endpoint to verify the API is running.
"""

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check():
    """Return a simple status message confirming the API is alive."""
    return {
        "status": "ok",
        "message": "MediLens AI Backend Running",
    }
