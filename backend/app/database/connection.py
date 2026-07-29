from typing import AsyncGenerator
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings
from app.core.logging_config import logger

Base = declarative_base()

# Determine initial database URL
database_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)

try:
    engine = create_async_engine(
        database_url,
        echo=False,
        future=True,
        pool_pre_ping=True
    )
except Exception:
    # Fallback to local SQLite async if postgres URL is invalid
    database_url = "sqlite+aiosqlite:///./qnetsecure.db"
    engine = create_async_engine(database_url, echo=False, future=True)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


async def init_db() -> None:
    """Creates database tables automatically using Base.metadata.create_all()."""
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database schema initialized via Base.metadata.create_all() ({engine.url.drivername})")
    except Exception as e:
        logger.warning(f"PostgreSQL connection failed ({str(e)}). Falling back to local SQLite database...")
        # Fallback engine to SQLite
        sqlite_url = "sqlite+aiosqlite:///./qnetsecure.db"
        engine = create_async_engine(sqlite_url, echo=False, future=True)
        AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Local SQLite database schema initialized successfully (qnetsecure.db).")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for delivering async database sessions.

    Yields:
        AsyncSession: Active database session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
