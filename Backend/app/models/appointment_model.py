"""
MediLens AI — Appointment Model Helpers

Builders for MongoDB-ready documents (appointments).
"""

from datetime import datetime, timezone

def appointment_document(
    user_email: str,
    doctor_id: str,
    assessment_id: str,
    status: str = "pending",
) -> dict:
    """Return a dict ready for insertion into the `appointments` collection."""
    now = datetime.now(timezone.utc)
    
    return {
        "user_email": user_email,
        "doctor_id": doctor_id,
        "assessment_id": assessment_id,
        "status": status,
        "created_at": now,
        "updated_at": now,
    }
