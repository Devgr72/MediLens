"""
MediLens AI — FastAPI Application

Creates and configures the FastAPI application instance:
  • CORS middleware (origins = ["*"])
  • Database lifecycle via on_event
  • Router registration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

from app.config.database import close_mongo_connection, connect_to_mongo
from app.config.settings import settings
from app.routes.auth_routes import router as auth_router
from app.routes.health import router as health_router
from app.routes.user_routes import router as user_router
from app.routes.symptom_routes import router as symptom_router
from app.routes.doctor_auth_routes import router as doctor_auth_router
from app.services.symptom_service import set_http_client

# ──────────────────────────────────────────────
# App instance
# ──────────────────────────────────────────────
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="0.1.0",
    description="AI-powered healthcare assistant API",
)

# ── CORS ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────
app.include_router(health_router)
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(symptom_router)
app.include_router(doctor_auth_router)


# ── Startup / Shutdown Events ────────────────
@app.on_event("startup")
async def startup_event():
    """Connect to MongoDB and initialise shared HTTP client."""
    await connect_to_mongo()
    client = httpx.AsyncClient(timeout=settings.RAG_TIMEOUT_SECONDS)
    set_http_client(client)


@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection and HTTP client."""
    from app.services.symptom_service import get_http_client
    try:
        client = get_http_client()
        await client.aclose()
    except RuntimeError:
        pass
    await close_mongo_connection()
