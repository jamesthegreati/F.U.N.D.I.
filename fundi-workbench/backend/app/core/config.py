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
    ENVIRONMENT: str = "dev"  # dev | prod

    # Per spec: hardcode allowed origins
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    def validate_api_key(self) -> bool:
        """Validate that the API key is set and not a placeholder."""
        if not self.GEMINI_API_KEY:
            return False
        if self.GEMINI_API_KEY in ["your_api_key_here", "", "None", "null"]:
            return False
        return True

    def get_api_key_error_message(self) -> str:
        """Get a helpful error message for missing/invalid API key."""
        return (
            "GEMINI_API_KEY is not configured properly. "
            "Please set a valid Google Gemini API key in your environment or .env file. "
            "Get your API key from: https://makersuite.google.com/app/apikey"
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
