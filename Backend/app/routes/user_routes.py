"""
MediLens AI — User Routes

Registration, login, and database test endpoints.
Business logic is delegated entirely to the user service.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, status

from app.config.database import get_database
from app.schemas.user_schema import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.user_service import authenticate_user, create_user

router = APIRouter(prefix="/api/v1", tags=["Users"])


@router.post(
    "/users/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(payload: UserCreate):
    """Create a new user account and return the public profile."""
    user = await create_user(payload)
    return user


@router.post(
    "/users/login",
    response_model=TokenResponse,
    summary="Authenticate and receive a JWT",
)
async def login(payload: UserLogin):
    """Validate credentials and return a bearer token."""
    return await authenticate_user(payload)


@router.get(
    "/test-db",
    summary="Test MongoDB connection",
    tags=["Database"],
)
async def test_db():
    """Insert a sample document into MongoDB and return success."""
    db = get_database()
    doc = {
        "test": "mongodb connection working",
        "timestamp": datetime.now(timezone.utc),
    }
    result = await db["test_collection"].insert_one(doc)
    return {
        "status": "success",
        "message": "MongoDB is connected and working",
        "inserted_id": str(result.inserted_id),
    }
