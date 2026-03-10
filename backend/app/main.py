from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import init_db
from app.routers import auth, persona, chat, voice, livekit, memory


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    if settings.ENVIRONMENT == "development":
        await init_db()
    yield


app = FastAPI(
    title="EmpathAI API",
    description="Backend API for the EmpathAI Companion Platform — real-time chat, persona generation, voice, and video.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(persona.router, prefix="/api/persona", tags=["Persona Engine"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(livekit.router, tags=["LiveKit"])
app.include_router(memory.router, tags=["Memory & Relationship"])


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "name": "EmpathAI API",
        "docs": "/docs",
        "health": "/health",
    }
