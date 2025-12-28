from __future__ import annotations

import shutil
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints.compile import router as compile_router
from app.api.endpoints.generate import router as generate_router
from app.api.endpoints.ai_tools import router as ai_tools_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events."""
    # Startup validation
    print("🚀 Starting FUNDI Backend...", file=sys.stderr)
    print(f"📊 Environment: {settings.ENVIRONMENT}", file=sys.stderr)
    
    # Validate API key
    if not settings.validate_api_key():
        print(f"⚠️  {settings.get_api_key_error_message()}", file=sys.stderr)
        print("⚠️  AI features will not work until a valid API key is configured.", file=sys.stderr)
    else:
        print("✅ Gemini API key configured", file=sys.stderr)
    
    # Validate Arduino CLI availability
    arduino_cli_path = shutil.which("arduino-cli")
    if arduino_cli_path:
        print(f"✅ Arduino CLI found at: {arduino_cli_path}", file=sys.stderr)
    else:
        print("⚠️  Arduino CLI not found in PATH. Compilation features may not work.", file=sys.stderr)
    
    print("✅ Backend startup complete ✨", file=sys.stderr)
    
    yield
    
    # Shutdown
    print("👋 Shutting down FUNDI Backend...", file=sys.stderr)


app = FastAPI(
    title="FUNDI Brain",
    description="Backend API for FUNDI IoT Development Workbench",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router)
app.include_router(compile_router)
app.include_router(ai_tools_router)


@app.get("/health")
def health() -> dict:
    """Health check endpoint for monitoring and container orchestration."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "api_key_configured": settings.validate_api_key(),
    }
