"""Port: IQKDSessionRepository.

Abstraction for persisting and querying QKD session outcomes.
Concrete implementations (e.g., PostgreSQL, in-memory) live in infrastructure/.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from app.domain.entities.qkd_session import QKDResult


class IQKDSessionRepository(ABC):
    @abstractmethod
    def save_session(self, session: QKDResult) -> None:
        """Persist a QKD session result."""
        raise NotImplementedError

    @abstractmethod
    def get_session(self, session_id: UUID | str) -> Optional[QKDResult]:
        """Fetch a QKD session result by ID."""
        raise NotImplementedError

    @abstractmethod
    def list_sessions(self, limit: int = 100, offset: int = 0) -> List[QKDResult]:
        """List QKD session results with pagination."""
        raise NotImplementedError
