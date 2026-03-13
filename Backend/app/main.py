"""
MediLens AI — FastAPI Application

Creates and configures the FastAPI application instance:
  • CORS middleware (origins = ["*"])
  • Database lifecycle via on_event
  • Router registration
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import close_mongo_connection, connect_to_mongo
from app.config.settings import settings
from app.routes.auth_routes import router as auth_router
from app.routes.health import router as health_router
from app.routes.user_routes import router as user_router

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


# ── Startup / Shutdown Events ────────────────
@app.on_event("startup")
async def startup_event():
    """Connect to MongoDB when the application starts."""
    await connect_to_mongo()


@app.on_event("shutdown")
async def shutdown_event():
    """Close MongoDB connection when the application shuts down."""
    await close_mongo_connection()
