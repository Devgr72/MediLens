"""
MediLens AI — Doctor Auth Service (Business Logic)

Handles signup, OTP verification, login, and Google OAuth specifically for Doctors.
All database interactions are async via Motor.
"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status, BackgroundTasks

from app.config.database import get_database
from app.config.settings import settings
from app.core.logger import logger
from app.models.doctor_model import doctor_document
from app.utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)

# Reusing OTP functions from regular auth
from app.services.auth_service import (
    _send_otp_email,
    generate_otp,
    MAX_OTP_ATTEMPTS,
)

# ──────────────────────────────────────────────
# Collection names
# ──────────────────────────────────────────────
DOCTORS = "doctors"
OTP_CODES = "otp_codes"


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _public_doctor(doctor: dict) -> dict:
    """Format doctor object for API responses. Strip password hash."""
    
    # Base safe dict
    safe_doctor = {
        "id": str(doctor.get("_id", "")),
        "email": doctor.get("email"),
        "name": doctor.get("name"),
        "auth_provider": doctor.get("auth_provider"),
        "is_verified": doctor.get("is_verified"),
        "account_status": doctor.get("account_status"),
        "created_at": doctor.get("created_at").isoformat() if isinstance(doctor.get("created_at"), datetime) else doctor.get("created_at"),
        
        # Include the rich sub-documents
        "basic_details": doctor.get("basic_details", {}),
        "professional_details": doctor.get("professional_details", {}),
        "workplace_details": doctor.get("workplace_details", {}),
        "consultation_details": doctor.get("consultation_details", {}),
        "documents": doctor.get("documents", {}),
    }
    
    return safe_doctor


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

async def create_doctor(payload_dict: dict, background_tasks: Optional[BackgroundTasks] = None) -> dict:
    """Register a new doctor with email + password."""
    db = get_database()
    
    email = payload_dict.get("basic_details", {}).get("email")
    password = payload_dict.get("basic_details", {}).get("password")
    name = payload_dict.get("basic_details", {}).get("name")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required in basic_details.",
        )

    existing = await db[DOCTORS].find_one({"email": email})
    
    if existing:
        if existing.get("is_verified"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A doctor with this email already exists and is verified.",
            )
        
        doc = doctor_document(
            payload=payload_dict,
            password_hash=hash_password(password),
            auth_provider="email",
            is_verified=False,
        )
        doc["_id"] = existing["_id"]
        await db[DOCTORS].replace_one({"_id": existing["_id"]}, doc)
        logger.info("Unverified doctor overwritten — %s (%s)", name, email)
    else:
        doc = doctor_document(
            payload=payload_dict,
            password_hash=hash_password(password),
            auth_provider="email",
            is_verified=False,
        )
        await db[DOCTORS].insert_one(doc)
        logger.info("Doctor created — %s (%s)", name, email)

    # Generate and send OTP
    otp = await generate_otp(email)
    if background_tasks:
        background_tasks.add_task(_send_otp_email, email, otp)
    else:
        await _send_otp_email(email, otp)

    return _public_doctor(doc)


async def verify_doctor_otp(email: str, otp: str) -> dict:
    """Validate an OTP and mark the doctor as verified."""
    db = get_database()

    otp_record = await db[OTP_CODES].find_one({"email": email})
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found for this email. Please request a new one.",
        )

    # Check max attempts
    if otp_record["attempts"] >= MAX_OTP_ATTEMPTS:
        await db[OTP_CODES].delete_one({"_id": otp_record["_id"]})
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP attempts. Please request a new OTP.",
        )

    # Increment attempts
    await db[OTP_CODES].update_one(
        {"_id": otp_record["_id"]},
        {"$inc": {"attempts": 1}},
    )

    # Check expiration
    now = datetime.now(timezone.utc)
    expires_at = otp_record["expires_at"].replace(tzinfo=timezone.utc)
    if now > expires_at:
        await db[OTP_CODES].delete_one({"_id": otp_record["_id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one.",
        )

    # Check OTP match
    if otp_record["otp"] != otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    # Mark doctor as verified
    result = await db[DOCTORS].find_one_and_update(
        {"email": email},
        {"$set": {"is_verified": True}},
        return_document=True,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found.",
        )

    # Clean up used OTP
    await db[OTP_CODES].delete_many({"email": email})

    logger.info("Doctor verified — %s", email)
    return _public_doctor(result)


async def login_doctor(email: str, password: str) -> dict:
    """Authenticate via email + password."""
    db = get_database()

    doctor = await db[DOCTORS].find_one({"email": email})
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if doctor.get("auth_provider") == "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google login. Please sign in with Google.",
        )

    if not verify_password(password, doctor["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not doctor.get("is_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please verify your email with OTP.",
        )

    # Update last_login
    await db[DOCTORS].update_one(
        {"_id": doctor["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}},
    )

    token = create_access_token(data={"sub": doctor["email"], "name": doctor.get("name", "Doctor"), "role": "doctor"})
    logger.info("Doctor logged in — %s", email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _public_doctor(doctor),
    }


async def google_login_doctor(id_token: str) -> dict:
    """Authenticate via Google OAuth specifically for doctors."""
    try:
        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as google_requests

        idinfo = google_id_token.verify_oauth2_token(
            id_token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception as exc:
        logger.warning("Google token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token.",
        )

    email = idinfo.get("email")
    name = idinfo.get("name", "Google Doctor")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token missing email claim.",
        )

    db = get_database()
    doctor = await db[DOCTORS].find_one({"email": email})

    if not doctor:
        # Create new Google-authenticated doctor
        # We enforce a minimal payload since it's via Google. The frontend might need a different flow 
        # to complete the doctor profile if logging in via Google for the first time.
        # For uniformity, we mock the basic_details structure.
        mock_payload = {
            "basic_details": {
                "name": name,
                "email": email
            }
        }
        
        doc = doctor_document(
            payload=mock_payload,
            password_hash="",
            auth_provider="google",
            is_verified=True,
        )
        await db[DOCTORS].insert_one(doc)
        doctor = doc
        logger.info("Google doctor created — %s (%s)", name, email)
    else:
        # Update last_login
        await db[DOCTORS].update_one(
            {"_id": doctor["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}},
        )

    token = create_access_token(data={"sub": email, "name": name, "role": "doctor"})
    logger.info("Google doctor logged in — %s", email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _public_doctor(doctor),
    }

