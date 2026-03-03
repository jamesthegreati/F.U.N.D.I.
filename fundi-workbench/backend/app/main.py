from __future__ import annotations

import asyncio
import os
import platform
import shutil
import sys
from contextlib import asynccontextmanager

# On Windows, the default SelectorEventLoop does not support
# asyncio.create_subprocess_exec (used for QEMU).  Switch to
# ProactorEventLoop before uvicorn creates the event loop.
if platform.system() == "Windows":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints.compile import router as compile_router
from app.api.endpoints.generate import router as generate_router
from app.api.endpoints.ai_tools import router as ai_tools_router
from app.api.endpoints.simulate import router as simulate_router
from app.api.endpoints.component_library import router as components_router
from app.core.config import settings
from app.services.compiler import CompilerService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events."""
    # Startup validation
    print("🚀 Starting FUNDI Backend...", file=sys.stderr)
    print(f"📊 Environment: {settings.ENVIRONMENT}", file=sys.stderr)
    
    # Validate API keys
    if not settings.validate_api_key():
        print(f"⚠️  {settings.get_api_key_error_message()}", file=sys.stderr)
        print("⚠️  AI features will not work until a valid API key is configured.", file=sys.stderr)
    else:
        if settings.validate_gemini_key():
            print("✅ Gemini API key configured", file=sys.stderr)
            print(f"🤖 Gemini model: {settings.GEMINI_MODEL}", file=sys.stderr)
        else:
            print("⚠️  Gemini API key not configured", file=sys.stderr)
        if settings.validate_openrouter_key():
            print("✅ OpenRouter API key configured (fallback provider)", file=sys.stderr)
            print(f"🤖 OpenRouter model: {settings.OPENROUTER_MODEL}", file=sys.stderr)
        else:
            print("ℹ️  OpenRouter not configured (optional fallback)", file=sys.stderr)
    
    # Validate Arduino CLI availability
    # Prefer explicit override, then fall back to PATH lookup.
    arduino_cli_path = os.environ.get("ARDUINO_CLI_PATH") or shutil.which("arduino-cli")
    if arduino_cli_path:
        print(f"✅ Arduino CLI found at: {arduino_cli_path}", file=sys.stderr)

        sketchbook_dir = os.environ.get("ARDUINO_SKETCHBOOK_DIR")
        libraries_dir = os.environ.get("ARDUINO_LIBRARIES_DIR")
        if sketchbook_dir:
            print(f"📁 Arduino sketchbook dir: {sketchbook_dir}", file=sys.stderr)
        if libraries_dir:
            print(f"📚 Arduino libraries dir: {libraries_dir}", file=sys.stderr)

        # Optional startup bootstrap for non-AVR board cores so ESP32/Pico compile out-of-the-box.
        if os.environ.get("FUNDI_AUTO_BOOTSTRAP_CORES", "0").strip().lower() not in {"0", "false", "no"}:
            service = CompilerService()
            for board in ("wokwi-esp32-devkit-v1", "wokwi-pi-pico"):
                ok, err = service.ensure_board_core(board)
                if ok:
                    if err:
                        print(f"⏳ Board core setup in progress: {board} ({err})", file=sys.stderr)
                    else:
                        print(f"✅ Board core ready: {board}", file=sys.stderr)
                else:
                    print(
                        f"⚠️  Board core bootstrap failed for {board}: {err} "
                        "(you can tune FUNDI_CORE_INSTALL_RETRIES and FUNDI_CORE_INSTALL_TIMEOUT_S)",
                        file=sys.stderr,
                    )
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
app.include_router(simulate_router)
app.include_router(components_router)


@app.get("/health")
def health() -> dict:
    """Health check endpoint for monitoring and container orchestration."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "api_key_configured": settings.validate_api_key(),
        "gemini_configured": settings.validate_gemini_key(),
        "openrouter_configured": settings.validate_openrouter_key(),
    }
