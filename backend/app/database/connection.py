from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings
from app.core.logging_config import logger

Base = declarative_base()

# Create async engine for PostgreSQL
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True
)

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
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database schema initialized via Base.metadata.create_all()")
    except Exception as e:
        logger.error(f"Error initializing database schema: {str(e)}")
        # Raise so caller is aware if DB connection fails
        raise


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
