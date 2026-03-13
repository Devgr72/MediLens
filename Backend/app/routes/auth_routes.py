"""
MediLens AI — Auth Routes

Authentication endpoints: signup, OTP verification, login, Google OAuth.
All business logic is delegated to auth_service.
"""

from fastapi import APIRouter, status

from app.schemas.auth_schema import (
    AuthResponse,
    GoogleLoginRequest,
    LoginRequest,
    MessageResponse,
    OTPVerifyRequest,
    ResendOTPRequest,
    SignupRequest,
)
from app.services.auth_service import (
    create_user,
    generate_otp,
    google_login,
    login_user,
    verify_otp,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    summary="Register with email + password",
)
async def signup(payload: SignupRequest):
    """Create a new user account. An OTP is sent to the provided email for verification."""
    user = await create_user(
        name=payload.name,
        email=payload.email,
        password=payload.password,
    )
    return {
        "message": "User registered successfully. Please verify your email with the OTP sent.",
        "user": user,
    }


@router.post(
    "/verify-otp",
    summary="Verify email with OTP",
)
async def verify_otp_route(payload: OTPVerifyRequest):
    """Validate a 6-digit OTP to verify the user's email address."""
    user = await verify_otp(email=payload.email, otp=payload.otp)
    return {
        "message": "Email verified successfully.",
        "user": user,
    }


@router.post(
    "/resend-otp",
    summary="Resend OTP to email",
)
async def resend_otp_route(payload: ResendOTPRequest):
    """Generate a new OTP and send it to the user's email."""
    from app.config.database import get_database

    db = get_database()
    user = await db["users"].find_one({"email": payload.email})
    if not user:
        # Return generic message to prevent email enumeration
        return {"message": "If an account exists with this email, a new OTP has been sent."}

    if user.get("is_verified"):
        return {"message": "This email is already verified."}

    otp = await generate_otp(email=payload.email)

    # Mock send — in production, call the real email service
    from app.core.logger import logger
    logger.info("📧 [MOCK] Resent OTP %s to %s", otp, payload.email)

    return {"message": "If an account exists with this email, a new OTP has been sent."}


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login with email + password",
)
async def login(payload: LoginRequest):
    """Authenticate with email and password. Returns a JWT bearer token."""
    return await login_user(email=payload.email, password=payload.password)


@router.post(
    "/google-login",
    response_model=AuthResponse,
    summary="Login with Google OAuth",
)
async def google_login_route(payload: GoogleLoginRequest):
    """Authenticate with a Google ID token. Creates a new user if one doesn't exist."""
    return await google_login(id_token=payload.id_token)
