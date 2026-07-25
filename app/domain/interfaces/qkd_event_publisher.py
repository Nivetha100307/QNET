"""Port: IQKDEventPublisher.

Abstraction for publishing real-time QKD session lifecycle events.
Concrete implementations (e.g., WebSocket broadcast, Redis pub/sub) live in infrastructure/.
"""

from abc import ABC, abstractmethod

from app.domain.entities.qkd_session import QKDResult


class IQKDEventPublisher(ABC):
    @abstractmethod
    def publish_session_started(self, session_id: str, num_bits: int) -> None:
        """Publish event indicating a QKD session has started."""
        raise NotImplementedError

    @abstractmethod
    def publish_session_completed(self, session: QKDResult) -> None:
        """Publish event indicating a QKD session completed successfully."""
        raise NotImplementedError

    @abstractmethod
    def publish_session_failed(self, session: QKDResult, reason: str) -> None:
        """Publish event indicating a QKD session failed or was aborted."""
        raise NotImplementedError
