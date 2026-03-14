"""
MediLens AI — User Routes

Registration, login, and database test endpoints.
Business logic is delegated entirely to the user service.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status

from app.config.database import get_database
from app.core.deps import get_current_user_email
from app.schemas.user_schema import (
    FamilyMemberCreate,
    FamilyMemberResponse,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserProfileResponse,
    UserResponse,
)
from app.services.user_service import (
    add_family_member,
    authenticate_user,
    create_user,
    get_user_profile,
)

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


@router.post(
    "/users/family-member",
    response_model=FamilyMemberResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a family member to the current user profile",
)
async def create_family_member(
    payload: FamilyMemberCreate,
    current_user_email: str = Depends(get_current_user_email)
):
    """Create a new family member linked to the currently authenticated user."""
    return await add_family_member(user_email=current_user_email, payload=payload)


@router.get(
    "/users/profile",
    response_model=UserProfileResponse,
    summary="Get current user profile and family members",
)
async def read_user_profile(current_user_email: str = Depends(get_current_user_email)):
    """Fetch the authenticated user's profile and all linked family members."""
    return await get_user_profile(user_email=current_user_email)


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
