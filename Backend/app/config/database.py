"""
MediLens AI — Async MongoDB Connection (Motor)

Provides lifecycle helpers for connecting / disconnecting the Motor async client,
and a dependency-injection–friendly getter for the database instance.
"""

import certifi
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config.settings import settings
from app.core.logger import logger

# ──────────────────────────────────────────────
# Module-level state
# ──────────────────────────────────────────────
_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongo() -> None:
    """Open the Motor client with connection pooling and select the database."""
    global _client, _database

    logger.info("Connecting to MongoDB at %s …", settings.MONGODB_URL)

    _client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        maxPoolSize=50,
        minPoolSize=10,
        serverSelectionTimeoutMS=5000,
        tlsCAFile=certifi.where(),
    )
    _database = _client[settings.DATABASE_NAME]

    # Quick connectivity check
    await _client.admin.command("ping")
    logger.info("✅ MongoDB connection established — DB: %s", settings.DATABASE_NAME)


async def close_mongo_connection() -> None:
    """Gracefully close the Motor client."""
    global _client, _database

    if _client is not None:
        _client.close()
        _client = None
        _database = None
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """Return the current database instance.

    Intended for use as a FastAPI dependency or direct import.
    Raises RuntimeError if called before `connect_to_mongo`.
    """
    if _database is None:
        raise RuntimeError(
            "Database is not initialised. "
            "Ensure connect_to_mongo() has been awaited during application startup."
        )
    return _database
