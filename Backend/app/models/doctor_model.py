"""
MediLens AI — Doctor Model Helpers

Builders for MongoDB-ready documents (doctors).
"""

from datetime import datetime, timezone


def doctor_document(
    payload: dict,
    password_hash: str,
    auth_provider: str = "email",
    is_verified: bool = False,
) -> dict:
    """Return a dict ready for insertion into the `doctors` collection."""
    now = datetime.now(timezone.utc)
    
    # We extract the basic details needed for core auth and index fields
    basic_details = payload.get("basic_details", {})
    
    return {
        "email": basic_details.get("email"),
        "name": basic_details.get("name"),
        "password_hash": password_hash,
        "auth_provider": auth_provider,
        "is_verified": is_verified,
        "account_status": "pending",  # As per payload default
        "created_at": now,
        "last_login": now,
        
        # Store the rest of the rich payload exactly as it came in, ensuring structure
        "basic_details": basic_details,
        "professional_details": payload.get("professional_details", {}),
        "workplace_details": payload.get("workplace_details", {}),
        "consultation_details": payload.get("consultation_details", {}),
        "documents": payload.get("documents", {}),
    }

