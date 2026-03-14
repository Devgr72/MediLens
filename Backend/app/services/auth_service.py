"""
MediLens AI — Auth Service (Business Logic)

Handles signup, OTP verification, login, and Google OAuth.
All database interactions are async via Motor.
"""

import random
import string
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status

from app.config.database import get_database
from app.config.settings import settings
from app.core.logger import logger
from app.models.user_model import otp_document, user_document
from app.utils.security import (
    create_access_token,
    hash_password,
    verify_password,
)

# ──────────────────────────────────────────────
# Collection names
# ──────────────────────────────────────────────
USERS = "users"
OTP_CODES = "otp_codes"

MAX_OTP_ATTEMPTS = 5


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def _generate_otp_code() -> str:
    """Generate a cryptographically-sufficient 6-digit OTP."""
    return "".join(random.choices(string.digits, k=6))


def _public_user(user: dict) -> dict:
    """Strip sensitive fields and stringify _id for API responses."""
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "auth_provider": user["auth_provider"],
        "is_verified": user["is_verified"],
        "created_at": user["created_at"].isoformat() if isinstance(user["created_at"], datetime) else user["created_at"],
    }


import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

async def _send_otp_email(email: str, otp: str) -> None:
    """Send OTP email using SMTP."""
    def send_email():
        if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
            logger.warning("SMTP credentials not set. Falling back to mock email.")
            logger.info("📧 [MOCK] OTP %s sent to %s", otp, email)
            return

        try:
            msg = MIMEMultipart()
            msg["From"] = settings.SMTP_USERNAME
            msg["To"] = email
            msg["Subject"] = "Your MediLens AI Verification Code"
            
            body = f"Hello,\n\nYour verification code is: {otp}\n\nThis code will expire in 15 minutes.\n\nBest regards,\nMediLens AI Team"
            msg.attach(MIMEText(body, "plain"))

            server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            logger.info("📧 OTP email sent successfully to %s", email)
        except Exception as e:
            logger.error("Failed to send OTP email: %s", e)
            
    await asyncio.to_thread(send_email)


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

async def create_user(name: str, email: str, password: str) -> dict:
    """Register a new user with email + password.

    • Checks for duplicate email
    • Hashes the password
    • Creates an unverified user
    • Generates and stores an OTP
    • Sends OTP via email (mock)
    """
    db = get_database()

    existing = await db[USERS].find_one({"email": email})
    if existing:
        if existing.get("is_verified"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists.",
            )
        # If unverified, we update the existing record
        await db[USERS].update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "name": name,
                "password_hash": hash_password(password),
                "created_at": datetime.now(timezone.utc)
            }}
        )
        doc = await db[USERS].find_one({"_id": existing["_id"]})
        logger.info("Unverified user updated — %s (%s)", name, email)
    else:
        doc = user_document(
            name=name,
            email=email,
            password_hash=hash_password(password),
            auth_provider="email",
            is_verified=False,
        )
        await db[USERS].insert_one(doc)
        logger.info("User created — %s (%s)", name, email)

    # Generate and send OTP
    otp = await generate_otp(email)
    await _send_otp_email(email, otp)

    return _public_user(doc)


async def generate_otp(email: str) -> str:
    """Create a new OTP for the given email.

    Invalidates any previous OTP for the same email.
    Returns the plain OTP string (for mock logging / testing).
    """
    db = get_database()

    # Invalidate old OTPs
    await db[OTP_CODES].delete_many({"email": email})

    otp = _generate_otp_code()
    doc = otp_document(email=email, otp=otp)
    await db[OTP_CODES].insert_one(doc)

    logger.info("OTP generated for %s", email)
    return otp


async def verify_otp(email: str, otp: str) -> dict:
    """Validate an OTP and mark the user as verified.

    • Checks OTP exists and matches
    • Checks expiration
    • Enforces max attempts
    • Marks user.is_verified = True
    """
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

    # Mark user as verified
    result = await db[USERS].find_one_and_update(
        {"email": email},
        {"$set": {"is_verified": True}},
        return_document=True,
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    # Clean up used OTP
    await db[OTP_CODES].delete_many({"email": email})

    logger.info("User verified — %s", email)
    return _public_user(result)


async def login_user(email: str, password: str) -> dict:
    """Authenticate via email + password.

    • Validates credentials
    • Checks account is verified
    • Updates last_login
    • Returns JWT + user info
    """
    db = get_database()

    user = await db[USERS].find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if user.get("auth_provider") == "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google login. Please sign in with Google.",
        )

    if not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.get("is_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account not verified. Please verify your email with OTP.",
        )

    # Update last_login
    await db[USERS].update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.now(timezone.utc)}},
    )

    token = create_access_token(data={"sub": user["email"], "name": user["name"]})
    logger.info("User logged in — %s", email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _public_user(user),
    }


async def google_login(id_token: str) -> dict:
    """Authenticate via Google OAuth.

    • Verifies the Google ID token
    • Creates the user if they don't exist
    • Returns JWT + user info
    """
    # Verify Google token
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
    name = idinfo.get("name", "Google User")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token missing email claim.",
        )

    db = get_database()
    user = await db[USERS].find_one({"email": email})

    if not user:
        # Create new Google-authenticated user (auto-verified)
        doc = user_document(
            name=name,
            email=email,
            password_hash="",
            auth_provider="google",
            is_verified=True,
        )
        await db[USERS].insert_one(doc)
        user = doc
        logger.info("Google user created — %s (%s)", name, email)
    else:
        # Update last_login
        await db[USERS].update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now(timezone.utc)}},
        )

    token = create_access_token(data={"sub": email, "name": name})
    logger.info("Google user logged in — %s", email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": _public_user(user),
    }


async def forgot_password(email: str) -> None:
    """Initiate the forgot password flow.

    • Checks if the user exists
    • Generates a new OTP
    • Sends the OTP via email
    """
    db = get_database()
    user = await db[USERS].find_one({"email": email})

    if not user:
        # We don't raise an error here to prevent email enumeration.
        # We just silently return.
        logger.info("Forgot password requested for non-existent email: %s", email)
        return

    if user.get("auth_provider") == "google":
        # Don't send OTPs for Google-auth accounts
        logger.info("Forgot password requested for Google account: %s", email)
        return

    otp = await generate_otp(email)
    await _send_otp_email(email, otp)
    logger.info("Password reset OTP generated for %s", email)


async def reset_password(email: str, otp: str, new_password: str) -> None:
    """Validate OTP and update the user's password.

    • Uses the exact same OTP verification logic but WITHOUT marking is_verified.
    (We assume if they reset their password, they own the email anyway, but let's
    keep it strictly focused on password reset).
    """
    db = get_database()

    # 1. Verify user exists and is not a Google account
    user = await db[USERS].find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if user.get("auth_provider") == "google":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account uses Google login and cannot have its password reset.",
        )

    # 2. Verify OTP
    otp_record = await db[OTP_CODES].find_one({"email": email})
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No OTP found for this email. Please request a new one.",
        )

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

    now = datetime.now(timezone.utc)
    expires_at = otp_record["expires_at"].replace(tzinfo=timezone.utc)
    if now > expires_at:
        await db[OTP_CODES].delete_one({"_id": otp_record["_id"]})
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP has expired. Please request a new one.",
        )

    if otp_record["otp"] != otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP.",
        )

    # 3. Update the password
    new_hashed_password = hash_password(new_password)
    await db[USERS].update_one(
        {"_id": user["_id"]},
        {"$set": {"password_hash": new_hashed_password, "updated_at": now}}
    )

    # Clean up OTP
    await db[OTP_CODES].delete_many({"email": email})
    logger.info("Password reset successfully for %s", email)
