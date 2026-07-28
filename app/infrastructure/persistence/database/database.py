"""SQLAlchemy Dual (Sync & Async) Engine and Database Session Management."""

import logging
from typing import AsyncGenerator
from urllib.parse import quote, unquote

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.infrastructure.persistence.database.base import Base

logger = logging.getLogger(__name__)

settings = get_settings()


def fix_db_url(url: str) -> str:
    """Ensure database connection string passwords with special characters are properly URL-encoded."""
    if not url or "://" not in url or "sqlite" in url:
        return url
    parts = url.split("://", 1)
    scheme = parts[0]
    rest = parts[1]
    last_at = rest.rfind("@")
    if last_at == -1 or ":" not in rest[:last_at]:
        return url
    userpass = rest[:last_at]
    hostdb = rest[last_at + 1 :]
    user, password = userpass.split(":", 1)
    raw_password = unquote(password)
    encoded_pass = quote(raw_password, safe="")
    return f"{scheme}://{user}:{encoded_pass}@{hostdb}"


raw_db_url = fix_db_url(settings.DATABASE_URL or "sqlite:///./entanglenet.db")

# Format Sync DB URL (psycopg2 / sqlite3)
sync_db_url = raw_db_url
if sync_db_url.startswith("postgresql+asyncpg://"):
    sync_db_url = sync_db_url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
elif sync_db_url.startswith("postgresql://"):
    sync_db_url = sync_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
elif sync_db_url.startswith("sqlite+aiosqlite://"):
    sync_db_url = sync_db_url.replace("sqlite+aiosqlite://", "sqlite://", 1)

# Format Async DB URL (asyncpg / aiosqlite)
async_db_url = raw_db_url
if async_db_url.startswith("postgresql+psycopg2://"):
    async_db_url = async_db_url.replace("postgresql+psycopg2://", "postgresql+asyncpg://", 1)
elif async_db_url.startswith("postgresql://"):
    async_db_url = async_db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif async_db_url.startswith("sqlite://") and not async_db_url.startswith("sqlite+aiosqlite://"):
    async_db_url = async_db_url.replace("sqlite://", "sqlite+aiosqlite://", 1)

# Sync Engine setup
sync_engine_kwargs = {}
if "sqlite" in sync_db_url:
    sync_engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    sync_engine_kwargs["connect_args"] = {"connect_timeout": 5}

try:
    sync_engine = create_engine(
        sync_db_url,
        echo=False,
        **sync_engine_kwargs,
    )
except Exception as err:
    logger.warning(f"Failed to create sync engine for {sync_db_url.split('@')[-1]}: {err}. Falling back to SQLite.")
    sync_db_url = "sqlite:///./entanglenet.db"
    sync_engine = create_engine(sync_db_url, echo=False, connect_args={"check_same_thread": False})

SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False,
)

# Async Engine setup
async_engine_kwargs = {}
if "sqlite" in async_db_url:
    async_engine_kwargs["connect_args"] = {"check_same_thread": False}

try:
    async_engine: AsyncEngine = create_async_engine(
        async_db_url,
        echo=False,
        future=True,
        **async_engine_kwargs,
    )
except Exception as err:
    logger.warning(f"Failed to create async engine: {err}. Falling back to SQLite.")
    async_db_url = "sqlite+aiosqlite:///./entanglenet.db"
    async_engine = create_async_engine(async_db_url, echo=False, future=True, connect_args={"check_same_thread": False})

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


def init_db() -> None:
    """Initialize database tables schema on startup using sync engine."""
    global sync_engine, sync_db_url, SyncSessionLocal
    try:
        Base.metadata.create_all(bind=sync_engine)
        logger.info(f"Database schema initialized successfully using engine {sync_db_url.split('@')[-1] if '@' in sync_db_url else sync_db_url}")
    except Exception as exc:
        logger.error(f"Primary database connection failed ({exc}). Falling back to local SQLite database.")
        sync_db_url = "sqlite:///./entanglenet.db"
        sync_engine = create_engine(sync_db_url, echo=False, connect_args={"check_same_thread": False})
        SyncSessionLocal = sessionmaker(bind=sync_engine, autocommit=False, autoflush=False)
        Base.metadata.create_all(bind=sync_engine)
        logger.info("Local SQLite database schema initialized successfully.")


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency generator providing an AsyncSession instance."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
