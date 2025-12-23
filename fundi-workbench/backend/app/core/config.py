from __future__ import annotations

from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


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
