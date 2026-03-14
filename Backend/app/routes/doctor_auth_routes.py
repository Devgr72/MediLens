"""
MediLens AI — Doctor Auth Routes

Authentication endpoints tailored for doctors: 
signup (with detailed payload), OTP verification, login, Google OAuth.
"""

from fastapi import APIRouter, status, BackgroundTasks

from app.schemas.doctor_schema import (
    DoctorAuthResponse,
    DoctorGoogleLoginRequest,
    DoctorLoginRequest,
    DoctorOTPVerifyRequest,
    DoctorResendOTPRequest,
    DoctorSignupRequest,
)

# Reusing MessageResponse from standard auth
from app.schemas.auth_schema import MessageResponse

from app.services.doctor_auth_service import (
    create_doctor,
    google_login_doctor,
    login_doctor,
    verify_doctor_otp,
)
from app.services.auth_service import _send_otp_email, generate_otp

router = APIRouter(prefix="/api/v1/doctor-auth", tags=["Doctor Authentication"])


@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    summary="Register a doctor with detailed payload",
)
async def signup(payload: DoctorSignupRequest, background_tasks: BackgroundTasks):
    """Create a new doctor account with full credentials and professional details."""
    payload_dict = payload.model_dump()
    doctor = await create_doctor(
        payload_dict=payload_dict,
        background_tasks=background_tasks,
    )
    return {
        "message": "Doctor registered successfully. Please verify your email with the OTP sent.",
        "doctor": doctor,
    }


@router.post(
    "/verify-otp",
    summary="Verify doctor email with OTP",
)
async def verify_otp_route(payload: DoctorOTPVerifyRequest):
    """Validate a 6-digit OTP to verify the doctor's email address."""
    doctor = await verify_doctor_otp(email=payload.email, otp=payload.otp)
    return {
        "message": "Doctor email verified successfully.",
        "doctor": doctor,
    }


@router.post(
    "/resend-otp",
    summary="Resend OTP to doctor email",
)
async def resend_otp_route(payload: DoctorResendOTPRequest, background_tasks: BackgroundTasks):
    """Generate a new OTP and send it to the doctor's email."""
    from app.config.database import get_database

    db = get_database()
    doctor = await db["doctors"].find_one({"email": payload.email})
    if not doctor:
        return {"message": "If an account exists with this email, a new OTP has been sent."}

    if doctor.get("is_verified"):
        return {"message": "This email is already verified."}

    otp = await generate_otp(email=payload.email)
    background_tasks.add_task(_send_otp_email, payload.email, otp)

    return {"message": "If an account exists with this email, a new OTP has been sent."}


@router.post(
    "/login",
    response_model=DoctorAuthResponse,
    summary="Login doctor with email + password",
)
async def login(payload: DoctorLoginRequest):
    """Authenticate with email and password. Returns a JWT bearer token."""
    return await login_doctor(email=payload.email, password=payload.password)


@router.post(
    "/google-login",
    response_model=DoctorAuthResponse,
    summary="Login doctor with Google OAuth",
)
async def google_login_route_doctor(payload: DoctorGoogleLoginRequest):
    """Authenticate with a Google ID token. Creates a shell doctor if one doesn't exist."""
    return await google_login_doctor(id_token=payload.id_token)

