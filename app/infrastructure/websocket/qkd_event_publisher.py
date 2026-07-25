"""WebSocket Infrastructure Event Publisher.

This module provides the `WebSocketEventPublisher` class implementing the domain
port `IQKDEventPublisher`. It bridges the application layer and WebSocket infrastructure
by converting session events into `SessionEvent` payloads and delegating delivery to `ConnectionManager`.
"""

import asyncio
from typing import Any, Dict, Optional

from app.domain.entities.qkd_session import QKDResult
from app.domain.interfaces.qkd_event_publisher import IQKDEventPublisher
from app.infrastructure.websocket.connection_manager import (
    EVENT_SESSION_COMPLETED,
    EVENT_SESSION_FAILED,
    EVENT_SESSION_STARTED,
    ConnectionManager,
    SessionEvent,
)


class WebSocketEventPublisher(IQKDEventPublisher):
    """Concrete implementation of IQKDEventPublisher using ConnectionManager."""

    def __init__(self, connection_manager: ConnectionManager) -> None:
        """Initialize the WebSocketEventPublisher with an injected ConnectionManager.

        Args:
            connection_manager: Injected ConnectionManager instance.

        Raises:
            TypeError: If connection_manager is None.
        """
        if connection_manager is None:
            raise TypeError("connection_manager dependency cannot be None.")

        self._manager = connection_manager

    @property
    def manager(self) -> ConnectionManager:
        """Return the underlying ConnectionManager instance."""
        return self._manager

    def publish_session_started(self, session_id: str, num_bits: int) -> None:
        """Publish SESSION_STARTED event to WebSocket clients.

        Args:
            session_id: Unique session identifier string.
            num_bits: Target sifted key bit length.
        """
        event = SessionEvent(
            session_id=session_id,
            event_type=EVENT_SESSION_STARTED,
            payload={"num_bits": num_bits},
        )
        self._dispatch_event(event)

    def publish_session_completed(self, session: QKDResult) -> None:
        """Publish SESSION_COMPLETED event to WebSocket clients.

        Args:
            session: QKDResult domain entity.
        """
        status_val = (
            session.status.value
            if hasattr(session.status, "value")
            else str(session.status)
        )
        event = SessionEvent(
            session_id=str(session.session_id),
            event_type=EVENT_SESSION_COMPLETED,
            payload={
                "status": status_val,
                "raw_key_length": session.raw_key_length,
                "qber": session.qber,
                "chsh_value": session.chsh_value,
                "eavesdropping_detected": session.eavesdropping_detected,
            },
        )
        self._dispatch_event(event)

    def publish_session_failed(self, session: QKDResult, reason: str) -> None:
        """Publish SESSION_FAILED event to WebSocket clients.

        Args:
            session: QKDResult domain entity.
            reason: Description of the failure or eavesdropping abort.
        """
        status_val = (
            session.status.value
            if hasattr(session.status, "value")
            else str(session.status)
        )
        event = SessionEvent(
            session_id=str(session.session_id),
            event_type=EVENT_SESSION_FAILED,
            payload={
                "status": status_val,
                "reason": reason,
                "chsh_value": session.chsh_value,
                "qber": session.qber,
                "eavesdropping_detected": session.eavesdropping_detected,
            },
        )
        self._dispatch_event(event)

    def publish_progress(
        self, session_id: str, event_type: str, payload: Optional[Dict[str, Any]] = None
    ) -> None:
        """Publish intermediate protocol progress events (e.g. PAIR_GENERATED, KEY_SIFTED).

        Args:
            session_id: Target session ID string.
            event_type: Event type constant string.
            payload: Optional payload dictionary.
        """
        event = SessionEvent(
            session_id=session_id,
            event_type=event_type,
            payload=payload or {},
        )
        self._dispatch_event(event)

    async def publish_event_async(self, event: SessionEvent) -> None:
        """Asynchronously publish a SessionEvent directly via ConnectionManager."""
        await self._manager.broadcast_to_session(event.session_id, event)

    def _dispatch_event(self, event: SessionEvent) -> None:
        """Helper method to schedule async broadcast execution from sync context."""
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.publish_event_async(event))
        except RuntimeError:
            # If no running event loop in thread, execute synchronously via asyncio.run
            try:
                asyncio.run(self.publish_event_async(event))
            except Exception:
                pass
