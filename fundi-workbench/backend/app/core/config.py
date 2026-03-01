from __future__ import annotations

import os
import sys
from typing import List

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env file for local development
load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    GEMINI_API_KEY: str | None = None
    # Primary Gemini model to use for generation.
    # Can be set in backend/.env as GEMINI_MODEL.
    # Examples: "models/gemini-1.5-flash", "gemini-1.5-pro"
    GEMINI_MODEL: str = "models/gemini-flash-lite-latest"

    # OpenRouter fallback provider.
    # Used when Gemini is unavailable or its API key is missing.
    OPENROUTER_API_KEY: str | None = None
    OPENROUTER_MODEL: str = "google/gemini-2.0-flash-001"

    ENVIRONMENT: str = "dev"  # dev | prod

    # Per spec: hardcode allowed origins
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://jamesthegreati.github.io",
    ]

    # Agentic guardrails: diff budget (tunable via backend/.env)
    # These limit how much the model can rewrite existing sketches unless the user
    # explicitly asks for a refactor/rewrite.
    DIFF_BUDGET_MIN_OLD_LINES: int = 60
    DIFF_BUDGET_MAX_CHANGED_LINES: int = 160
    DIFF_BUDGET_MAX_CHANGED_RATIO: float = 0.45

    # For larger/older projects, be stricter by default.
    DIFF_BUDGET_LARGE_PROJECT_LINES: int = 200
    DIFF_BUDGET_LARGE_PROJECT_MAX_CHANGED_LINES: int = 180
    DIFF_BUDGET_LARGE_PROJECT_MAX_CHANGED_RATIO: float = 0.25

    def validate_api_key(self) -> bool:
        """Validate that at least one LLM API key (Gemini or OpenRouter) is usable."""
        return self.validate_gemini_key() or self.validate_openrouter_key()

    def validate_gemini_key(self) -> bool:
        """Validate that the Gemini API key is set and not a placeholder."""
        if not self.GEMINI_API_KEY:
            return False
        if self.GEMINI_API_KEY in ["your_api_key_here", "", "None", "null"]:
            return False
        return True

    def validate_openrouter_key(self) -> bool:
        """Validate that the OpenRouter API key is set and not a placeholder."""
        if not self.OPENROUTER_API_KEY:
            return False
        if self.OPENROUTER_API_KEY in ["your_api_key_here", "", "None", "null"]:
            return False
        return True

    def get_api_key_error_message(self) -> str:
        """Get a helpful error message for missing/invalid API keys."""
        return (
            "No LLM API key is configured. "
            "Please set GEMINI_API_KEY or OPENROUTER_API_KEY in your environment or .env file. "
            "Gemini: https://makersuite.google.com/app/apikey | "
            "OpenRouter: https://openrouter.ai/keys"
        )


settings = Settings()

# Validate critical settings at startup
if __name__ != "__main__":  # Only validate when imported, not when running directly
    if not settings.validate_api_key():
        print(
            f"WARNING: {settings.get_api_key_error_message()}",
            file=sys.stderr,
        )
        print(
            "The backend will start, but AI generation features will not work until the API key is configured.",
            file=sys.stderr,
        )
