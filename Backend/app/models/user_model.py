"""
MediLens AI — Document Model Helpers

Builders for MongoDB-ready documents (users, otp_codes).
These are plain dictionaries — no ODM — keeping the data layer lightweight.
"""

from datetime import datetime, timedelta, timezone


def user_document(
    name: str,
    email: str,
    password_hash: str,
    auth_provider: str = "email",
    is_verified: bool = False,
) -> dict:
    """Return a dict ready for insertion into the `users` collection."""
    now = datetime.now(timezone.utc)
    return {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "auth_provider": auth_provider,
        "is_verified": is_verified,
        "created_at": now,
        "last_login": now,
    }


def otp_document(
    email: str,
    otp: str,
    expires_minutes: int = 5,
) -> dict:
    """Return a dict ready for insertion into the `otp_codes` collection."""
    now = datetime.now(timezone.utc)
    return {
        "email": email,
        "otp": otp,
        "expires_at": now + timedelta(minutes=expires_minutes),
        "attempts": 0,
        "created_at": now,
    }


def family_member_document(
    user_id: str,
    name: str,
    age: int,
    gender: str,
    relationship: str,
) -> dict:
    """Return a dict ready for insertion into the `family_members` collection."""
    return {
        "user_id": user_id,
        "name": name,
        "age": age,
        "gender": gender,
        "relationship": relationship,
        "created_at": datetime.now(timezone.utc),
    }
