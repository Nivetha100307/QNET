"""
Application configuration.

Single source of truth for all environment-driven settings. Uses
pydantic-settings so config is validated at startup (fail fast) and
typed everywhere else in the app.

Add new settings here as new modules (Postgres, Redis, AI, etc.) come online.
"""

from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- General ---
    APP_NAME: str = "EntangleNet"
    APP_DESCRIPTION: str = "AI-Enabled E91 Quantum Communication Network"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = Field(default="development")  # development | staging | production
    DEBUG: bool = True

    # --- API ---
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["*"]

    # --- Quantum ---
    QUANTUM_BACKEND: str = Field(default="aer_simulator")  # which Aer backend to default to
    DEFAULT_SHOTS: int = 1024
    SIMULATION_SEED: int | None = None  # set an int for reproducible runs

    # --- Database (wired later) ---
    POSTGRES_DSN: str | None = None

    # --- Cache / pubsub (wired later) ---
    REDIS_URL: str | None = None

    # --- Security ---
    SECRET_KEY: str = Field(default="change-me-in-.env")

    # --- Logging ---
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor so we parse the environment only once.

    Import and use this everywhere instead of instantiating Settings()
    directly, e.g.:

        from app.core.config import get_settings
        settings = get_settings()
    """
    return Settings()
