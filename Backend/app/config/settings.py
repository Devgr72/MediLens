"""
MediLens AI — Application Settings

Centralised configuration loaded from environment variables via python-dotenv.
Uses Pydantic BaseSettings for type-safe validation and auto-casting.
"""

from pathlib import Path

from pydantic_settings import BaseSettings

# ──────────────────────────────────────────────
# Locate .env relative to project root
# ──────────────────────────────────────────────
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    """Application-wide settings, populated from .env file."""

    # ── Application ──────────────────────────
    PROJECT_NAME: str = "MediLens AI"
    DEBUG: bool = False

    # ── MongoDB ──────────────────────────────
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "medilens_db"

    # ── JWT / Auth ───────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Google OAuth ─────────────────────────
    GOOGLE_CLIENT_ID: str = ""

    # ── SMTP / Email ─────────────────────────
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""

    # ── RAG AI Service ───────────────────────
    RAG_SERVICE_URL: str = "http://localhost:9000/analyze"
    RAG_TIMEOUT_SECONDS: int = 30


    class Config:
        env_file = str(ENV_FILE)
        env_file_encoding = "utf-8"
        case_sensitive = True


# ──────────────────────────────────────────────
# Global settings instance — import this anywhere
# ──────────────────────────────────────────────
settings = Settings()
