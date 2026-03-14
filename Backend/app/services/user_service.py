"""
MediLens AI — User Service (Business Logic)

All user-related operations live here so the route layer stays thin.
"""

from typing import Optional

from fastapi import HTTPException, status

from app.config.database import get_database
from app.core.logger import logger
from app.models.user_model import family_member_document, user_document
from app.schemas.user_schema import FamilyMemberCreate, UserCreate, UserLogin
from app.utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)

# ──────────────────────────────────────────────
# Collection name
# ──────────────────────────────────────────────
USERS_COLLECTION = "users"
FAMILY_MEMBERS_COLLECTION = "family_members"


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
    db = get_database()
    
    doc = user_document(
        name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )

    if existing:
        if existing.get("is_verified"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )
        doc["_id"] = existing["_id"]
        await db[USERS_COLLECTION].replace_one({"_id": existing["_id"]}, doc)
        doc["_id"] = str(existing["_id"])
        logger.info("Unverified user overwritten — %s (%s)", payload.full_name, payload.email)
    else:
        result = await db[USERS_COLLECTION].insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        logger.info("User created — %s (%s)", payload.full_name, payload.email)

    # Map back legacy schema fields for the response model
    doc["full_name"] = doc["name"]
    doc["is_active"] = doc["is_verified"]
    doc["updated_at"] = doc["last_login"]

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


async def add_family_member(user_email: str, payload: FamilyMemberCreate) -> dict:
    """Add a new family member linked to the current user."""
    db = get_database()
    
    # 1. Look up user by email to get their _id
    user = await get_user_by_email(user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user_id_str = str(user["_id"])
    
    # 2. Build the family member document
    doc = family_member_document(
        user_id=user_id_str,
        name=payload.name,
        age=payload.age,
        gender=payload.gender,
        relationship=payload.relationship,
    )
    
    # 3. Insert into database
    result = await db[FAMILY_MEMBERS_COLLECTION].insert_one(doc)
    
    # 4. Map _id for response
    doc["_id"] = str(result.inserted_id)
    doc["id"] = doc["_id"]
    
    logger.info("Family member %s added for user %s", payload.name, user_email)
    return doc


async def get_user_profile(user_email: str) -> dict:
    """Retrieve the user's profile along with all their linked family members."""
    db = get_database()
    
    # 1. Get the user
    user = await get_user_by_email(user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    
    user_id_str = str(user["_id"])
    
    # 2. Get all family members linked to this user
    cursor = db[FAMILY_MEMBERS_COLLECTION].find({"user_id": user_id_str})
    family_members = []
    async for member in cursor:
        member["_id"] = str(member["_id"])
        member["id"] = member["_id"]
        family_members.append(member)
        
    # 3. Map legacy schema fields for the response model
    user["_id"] = user_id_str
    user["id"] = user_id_str
    user["full_name"] = user["name"]
    user["is_active"] = user.get("is_verified", False)
    user["updated_at"] = user.get("last_login", user.get("created_at"))
    user["family_members"] = family_members
    
    return user
