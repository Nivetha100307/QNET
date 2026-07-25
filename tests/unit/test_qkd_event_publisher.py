"""Unit tests for the WebSocketEventPublisher infrastructure adapter."""

import asyncio
from uuid import uuid4
import pytest

from app.domain.entities.qkd_session import QKDResult, SessionStatus
from app.infrastructure.websocket.connection_manager import (
    EVENT_PAIR_GENERATED,
    EVENT_SESSION_COMPLETED,
    EVENT_SESSION_FAILED,
    EVENT_SESSION_STARTED,
    ConnectionManager,
    SessionEvent,
)
from app.infrastructure.websocket.qkd_event_publisher import WebSocketEventPublisher


class MockConnectionManager(ConnectionManager):
    """Mock ConnectionManager to record broadcast_to_session calls."""

    def __init__(self) -> None:
        super().__init__()
        self.broadcast_calls: list[tuple] = []

    async def broadcast_to_session(self, session_id: str, message) -> None:
        self.broadcast_calls.append((session_id, message))


@pytest.mark.asyncio
async def test_publish_session_started():
    mock_mgr = MockConnectionManager()
    publisher = WebSocketEventPublisher(connection_manager=mock_mgr)

    await publisher.publish_event_async(
        SessionEvent("sess_001", EVENT_SESSION_STARTED, {"num_bits": 128})
    )

    assert len(mock_mgr.broadcast_calls) == 1
    session_id, event = mock_mgr.broadcast_calls[0]
    assert session_id == "sess_001"
    assert event.event_type == "SESSION_STARTED"
    assert event.payload == {"num_bits": 128}


@pytest.mark.asyncio
async def test_publish_session_completed():
    mock_mgr = MockConnectionManager()
    publisher = WebSocketEventPublisher(connection_manager=mock_mgr)

    sid = uuid4()
    session = QKDResult(
        session_id=sid,
        raw_key_length=128,
        sifted_key=[1] * 128,
        qber=0.0,
        chsh_value=2.828,
        eavesdropping_detected=False,
        status=SessionStatus.COMPLETED,
    )

    publisher.publish_session_completed(session)
    await asyncio.sleep(0)  # Yield control to allow loop.create_task to execute

    assert len(mock_mgr.broadcast_calls) == 1
    session_id, event = mock_mgr.broadcast_calls[0]
    assert session_id == str(sid)
    assert event.event_type == EVENT_SESSION_COMPLETED
    assert event.payload["raw_key_length"] == 128
    assert event.payload["status"] == "completed"


@pytest.mark.asyncio
async def test_publish_session_failed():
    mock_mgr = MockConnectionManager()
    publisher = WebSocketEventPublisher(connection_manager=mock_mgr)

    sid = uuid4()
    session = QKDResult(
        session_id=sid,
        raw_key_length=0,
        sifted_key=[],
        qber=0.25,
        chsh_value=1.4,
        eavesdropping_detected=True,
        status=SessionStatus.ABORTED_EAVESDROPPING,
    )

    publisher.publish_session_failed(session, reason="CHSH Bell parameter S <= 2.0")
    await asyncio.sleep(0)  # Yield control to allow loop.create_task to execute

    assert len(mock_mgr.broadcast_calls) == 1
    session_id, event = mock_mgr.broadcast_calls[0]
    assert session_id == str(sid)
    assert event.event_type == EVENT_SESSION_FAILED
    assert event.payload["reason"] == "CHSH Bell parameter S <= 2.0"
    assert event.payload["eavesdropping_detected"] is True


@pytest.mark.asyncio
async def test_publish_progress_event():
    mock_mgr = MockConnectionManager()
    publisher = WebSocketEventPublisher(connection_manager=mock_mgr)

    publisher.publish_progress("sess_progress_1", EVENT_PAIR_GENERATED, {"pairs_count": 500})
    await asyncio.sleep(0)  # Yield control to allow loop.create_task to execute

    assert len(mock_mgr.broadcast_calls) == 1
    session_id, event = mock_mgr.broadcast_calls[0]
    assert session_id == "sess_progress_1"
    assert event.event_type == EVENT_PAIR_GENERATED
    assert event.payload == {"pairs_count": 500}


def test_null_connection_manager_raises_type_error():
    with pytest.raises(TypeError, match="connection_manager dependency cannot be None"):
        WebSocketEventPublisher(connection_manager=None)
