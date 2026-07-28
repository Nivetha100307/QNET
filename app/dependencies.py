"""Dependency Injection Providers for FastAPI Endpoints."""

from functools import lru_cache
import logging

from app.core.config import get_settings
from app.domain.interfaces.qkd_repository import IQKDSessionRepository
from app.infrastructure.persistence.in_memory_repository import InMemoryQKDSessionRepository
from app.infrastructure.persistence.postgres_repository import PostgresQKDSessionRepository
from app.infrastructure.websocket.connection_manager import ConnectionManager
from app.infrastructure.websocket.qkd_event_publisher import WebSocketEventPublisher

_global_connection_manager = ConnectionManager()
from app.quantum.e91.e91_protocol import E91Protocol
from app.services.qkd_session_service import QKDSessionService

logger = logging.getLogger(__name__)
settings = get_settings()


@lru_cache
def get_repository() -> IQKDSessionRepository:
    """Dependency provider returning IQKDSessionRepository instance based on config."""
    repo_type = settings.REPOSITORY_TYPE.lower()
    if repo_type in ["postgres", "postgresql", "supabase"]:
        logger.info("Initializing PostgresQKDSessionRepository (Database Persistence).")
        return PostgresQKDSessionRepository()
    else:
        logger.info("Initializing InMemoryQKDSessionRepository (In-Memory Fallback).")
        return InMemoryQKDSessionRepository()


@lru_cache
def get_qkd_session_service() -> QKDSessionService:
    """Dependency provider for QKDSessionService with injected protocol, repository, and event publisher."""
    protocol = E91Protocol()
    repository = get_repository()
    publisher = WebSocketEventPublisher(connection_manager=_global_connection_manager)
    return QKDSessionService(
        protocol=protocol,
        repository=repository,
        event_publisher=publisher,
    )
