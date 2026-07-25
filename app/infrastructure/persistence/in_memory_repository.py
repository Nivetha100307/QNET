"""In-memory implementation of IQKDSessionRepository.

This module provides `InMemoryQKDSessionRepository`, a thread-safe in-memory
store for QKD session records suitable for development, testing, and demos.
"""

from threading import RLock
from typing import Dict, List, Optional
from uuid import UUID

from app.domain.entities.qkd_session import QKDResult
from app.domain.interfaces.qkd_repository import IQKDSessionRepository


class InMemoryQKDSessionRepository(IQKDSessionRepository):
    """Thread-safe in-memory repository implementing IQKDSessionRepository."""

    def __init__(self) -> None:
        """Initialize the repository with an empty dictionary and an RLock."""
        self._storage: Dict[str, QKDResult] = {}
        self._lock = RLock()

    def save_session(self, session: QKDResult) -> None:
        """Persist or update a QKD session result.

        Args:
            session: QKDResult domain entity to store.

        Raises:
            TypeError: If session is None.
        """
        if session is None:
            raise TypeError("Cannot save None session.")

        sid_str = str(session.session_id)
        with self._lock:
            self._storage[sid_str] = session

    def get_session(self, session_id: UUID | str) -> Optional[QKDResult]:
        """Fetch a stored QKD session by ID.

        Args:
            session_id: Session identifier (UUID or str).

        Returns:
            Optional[QKDResult]: The stored QKDResult or None if not found.
        """
        if session_id is None:
            return None

        sid_str = str(session_id)
        with self._lock:
            return self._storage.get(sid_str)

    def list_sessions(self, limit: int = 100, offset: int = 0) -> List[QKDResult]:
        """List QKD session results with pagination.

        Args:
            limit: Maximum number of records to return.
            offset: Starting index for pagination.

        Returns:
            List[QKDResult]: Paginated slice of stored sessions.
        """
        with self._lock:
            all_sessions = list(self._storage.values())
            # Sort newest first based on created_at timestamp if present
            all_sessions.sort(
                key=lambda s: getattr(s, "created_at", None), reverse=True
            )
            return all_sessions[offset : offset + limit]

    def delete_session(self, session_id: UUID | str) -> bool:
        """Delete a QKD session by ID.

        Args:
            session_id: Session identifier.

        Returns:
            bool: True if deleted, False if session was not found.
        """
        if session_id is None:
            return False

        sid_str = str(session_id)
        with self._lock:
            if sid_str in self._storage:
                del self._storage[sid_str]
                return True
            return False

    def clear(self) -> None:
        """Clear all stored sessions."""
        with self._lock:
            self._storage.clear()

    def count(self) -> int:
        """Return the total number of stored sessions."""
        with self._lock:
            return len(self._storage)
