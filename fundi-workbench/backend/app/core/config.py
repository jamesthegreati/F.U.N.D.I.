from __future__ import annotations

import os
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


settings = Settings()
