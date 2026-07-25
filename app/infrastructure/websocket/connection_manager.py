"""WebSocket Infrastructure Connection Manager.

This module provides the `SessionEvent` data model and `ConnectionManager` class to
manage WebSocket client connection registries and handle real-time event broadcasting.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Optional, Union

from fastapi import WebSocket


@dataclass(frozen=True)
class SessionEvent:
    """Structured container for real-time QKD session events."""

    session_id: str
    event_type: str
    payload: Dict[str, Any] = field(default_factory=dict)
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )

    def to_dict(self) -> Dict[str, Any]:
        """Serialize event object to a dictionary."""
        return {
            "session_id": self.session_id,
            "event_type": self.event_type,
            "timestamp": self.timestamp,
            "payload": self.payload,
        }


# Standard QKD Event Types
EVENT_SESSION_STARTED = "SESSION_STARTED"
EVENT_PAIR_GENERATED = "PAIR_GENERATED"
EVENT_MEASUREMENT_COMPLETED = "MEASUREMENT_COMPLETED"
EVENT_CHSH_COMPLETED = "CHSH_COMPLETED"
EVENT_KEY_SIFTED = "KEY_SIFTED"
EVENT_QBER_COMPLETED = "QBER_COMPLETED"
EVENT_KEY_GENERATED = "KEY_GENERATED"
EVENT_AES_READY = "AES_READY"
EVENT_SESSION_COMPLETED = "SESSION_COMPLETED"
EVENT_SESSION_FAILED = "SESSION_FAILED"


class ConnectionManager:
    """Manages WebSocket connections and broadcasts live event messages."""

    def __init__(self) -> None:
        """Initialize the ConnectionManager with empty connection registries."""
        # Registry of all active WebSocket connections
        self._active_connections: List[WebSocket] = []
        # Map of session_id to list of subscribed WebSockets
        self._session_connections: Dict[str, List[WebSocket]] = {}

    @property
    def active_connections(self) -> List[WebSocket]:
        """Return list of active WebSocket connections."""
        return list(self._active_connections)

    def active_connections_count(self) -> int:
        """Return count of all active WebSocket connections."""
        return len(self._active_connections)

    def session_connections_count(self, session_id: str) -> int:
        """Return count of active connections for a specific session."""
        return len(self._session_connections.get(session_id, []))

    async def connect(
        self, websocket: WebSocket, session_id: Optional[str] = None
    ) -> None:
        """Accept a new WebSocket connection and add it to connection registries.

        Args:
            websocket: Incoming WebSocket client instance.
            session_id: Optional session identifier for session-specific subscription.
        """
        await websocket.accept()
        if websocket not in self._active_connections:
            self._active_connections.append(websocket)

        if session_id:
            if session_id not in self._session_connections:
                self._session_connections[session_id] = []
            if websocket not in self._session_connections[session_id]:
                self._session_connections[session_id].append(websocket)

    def disconnect(
        self, websocket: WebSocket, session_id: Optional[str] = None
    ) -> None:
        """Gracefully remove a disconnected WebSocket client from registries.

        Args:
            websocket: Disconnected WebSocket client.
            session_id: Optional session ID.
        """
        if websocket in self._active_connections:
            self._active_connections.remove(websocket)

        # Remove from specific session registry if provided
        if session_id and session_id in self._session_connections:
            if websocket in self._session_connections[session_id]:
                self._session_connections[session_id].remove(websocket)
            if not self._session_connections[session_id]:
                del self._session_connections[session_id]

        # Also purge from all session registries if present
        for sid, conn_list in list(self._session_connections.items()):
            if websocket in conn_list:
                conn_list.remove(websocket)
            if not conn_list:
                del self._session_connections[sid]

    async def send_personal_message(
        self, message: Union[dict, str, SessionEvent], websocket: WebSocket
    ) -> None:
        """Send a JSON text message to a single WebSocket client.

        Args:
            message: Message payload (dict, str, or SessionEvent).
            websocket: Target WebSocket connection.
        """
        data_str = self._format_message(message)
        try:
            await websocket.send_text(data_str)
        except Exception:
            self.disconnect(websocket)

    async def broadcast(self, message: Union[dict, str, SessionEvent]) -> None:
        """Broadcast a message to all active WebSocket connections.

        Args:
            message: Message payload (dict, str, or SessionEvent).
        """
        if not self._active_connections:
            return

        data_str = self._format_message(message)
        stale_connections: List[WebSocket] = []

        for connection in list(self._active_connections):
            try:
                await connection.send_text(data_str)
            except Exception:
                stale_connections.append(connection)

        # Clean up stale connections
        for stale in stale_connections:
            self.disconnect(stale)

    async def broadcast_to_session(
        self, session_id: str, message: Union[dict, str, SessionEvent]
    ) -> None:
        """Broadcast a message only to clients subscribed to a specific session_id.

        Args:
            session_id: Target session ID string.
            message: Message payload.
        """
        connections = self._session_connections.get(session_id, [])
        if not connections:
            return

        data_str = self._format_message(message)
        stale_connections: List[WebSocket] = []

        for connection in list(connections):
            try:
                await connection.send_text(data_str)
            except Exception:
                stale_connections.append(connection)

        for stale in stale_connections:
            self.disconnect(stale, session_id=session_id)

    @staticmethod
    def _format_message(message: Union[dict, str, SessionEvent]) -> str:
        """Format input message payload to JSON string."""
        if isinstance(message, SessionEvent):
            return json.dumps(message.to_dict())
        elif isinstance(message, dict):
            return json.dumps(message)
        elif isinstance(message, str):
            return message
        else:
            return json.dumps(str(message))
