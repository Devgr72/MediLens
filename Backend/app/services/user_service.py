"""
MediLens AI — User Service (Business Logic)

All user-related operations live here so the route layer stays thin.
"""

from typing import Optional

from fastapi import HTTPException, status

from app.config.database import get_database
from app.core.logger import logger
from app.models.user_model import user_document
from app.schemas.user_schema import UserCreate, UserLogin
from app.utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)

# ──────────────────────────────────────────────
# Collection name
# ──────────────────────────────────────────────
USERS_COLLECTION = "users"


async def get_user_by_email(email: str) -> Optional[dict]:
    """Look up a user by email. Returns the raw document or None."""
    db = get_database()
    return await db[USERS_COLLECTION].find_one({"email": email})


async def create_user(payload: UserCreate) -> dict:
    """Register a new user.

    Raises 409 if the email is already taken.
    Returns the inserted document with its ``_id`` stringified.
    """
    existing = await get_user_by_email(payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists.",
        )

    doc = user_document(
        name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    db = get_database()
    result = await db[USERS_COLLECTION].insert_one(doc)
    doc["_id"] = str(result.inserted_id)
    # Map back legacy schema fields for the response model
    doc["full_name"] = doc["name"]
    doc["is_active"] = doc["is_verified"]
    doc["updated_at"] = doc["last_login"]

    logger.info("User created — %s (%s)", payload.full_name, payload.email)
    return doc


async def authenticate_user(payload: UserLogin) -> dict:
    """Verify credentials and return a JWT token payload.

    Raises 401 on invalid email or password.
    """
    user = await get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user.get("password_hash", user.get("hashed_password", ""))):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user["email"]})
    logger.info("User authenticated — %s", user["email"])
    return {"access_token": token, "token_type": "bearer"}
