"""Unit tests for the WebSocket ConnectionManager and SessionEvent models."""

import json
import pytest

from app.infrastructure.websocket.connection_manager import (
    EVENT_SESSION_STARTED,
    ConnectionManager,
    SessionEvent,
)


class MockWebSocket:
    """Mock WebSocket client for unit testing."""

    def __init__(self, should_fail_send: bool = False) -> None:
        self.accepted: bool = False
        self.sent_messages: list[str] = []
        self.should_fail_send: bool = should_fail_send

    async def accept(self) -> None:
        self.accepted = True

    async def send_text(self, data: str) -> None:
        if self.should_fail_send:
            raise RuntimeError("Connection dropped / Broken pipe")
        self.sent_messages.append(data)


@pytest.mark.asyncio
async def test_session_event_serialization():
    event = SessionEvent(
        session_id="test_sess_123",
        event_type=EVENT_SESSION_STARTED,
        payload={"num_bits": 128},
    )

    event_dict = event.to_dict()
    assert event_dict["session_id"] == "test_sess_123"
    assert event_dict["event_type"] == "SESSION_STARTED"
    assert event_dict["payload"] == {"num_bits": 128}
    assert "timestamp" in event_dict


@pytest.mark.asyncio
async def test_connect_and_active_connections():
    manager = ConnectionManager()
    ws = MockWebSocket()

    await manager.connect(ws)

    assert ws.accepted is True
    assert manager.active_connections_count() == 1
    assert ws in manager.active_connections


@pytest.mark.asyncio
async def test_disconnect_client():
    manager = ConnectionManager()
    ws = MockWebSocket()

    await manager.connect(ws, session_id="sess_1")
    assert manager.active_connections_count() == 1
    assert manager.session_connections_count("sess_1") == 1

    manager.disconnect(ws, session_id="sess_1")
    assert manager.active_connections_count() == 0
    assert manager.session_connections_count("sess_1") == 0


@pytest.mark.asyncio
async def test_broadcast_to_all_clients():
    manager = ConnectionManager()
    ws1 = MockWebSocket()
    ws2 = MockWebSocket()

    await manager.connect(ws1)
    await manager.connect(ws2)

    event = SessionEvent(session_id="s1", event_type="PAIR_GENERATED")
    await manager.broadcast(event)

    assert len(ws1.sent_messages) == 1
    assert len(ws2.sent_messages) == 1

    data1 = json.loads(ws1.sent_messages[0])
    assert data1["event_type"] == "PAIR_GENERATED"


@pytest.mark.asyncio
async def test_broadcast_to_specific_session():
    manager = ConnectionManager()
    ws_sess_a = MockWebSocket()
    ws_sess_b = MockWebSocket()

    await manager.connect(ws_sess_a, session_id="session_A")
    await manager.connect(ws_sess_b, session_id="session_B")

    event_a = SessionEvent(session_id="session_A", event_type="KEY_SIFTED")
    await manager.broadcast_to_session("session_A", event_a)

    assert len(ws_sess_a.sent_messages) == 1
    assert len(ws_sess_b.sent_messages) == 0


@pytest.mark.asyncio
async def test_multiple_clients_and_graceful_disconnect():
    manager = ConnectionManager()
    ws_good = MockWebSocket()
    ws_broken = MockWebSocket(should_fail_send=True)

    await manager.connect(ws_good)
    await manager.connect(ws_broken)

    assert manager.active_connections_count() == 2

    # Broadcast should succeed for healthy client and disconnect broken client gracefully
    await manager.broadcast("Ping Event")

    assert len(ws_good.sent_messages) == 1
    assert ws_good.sent_messages[0] == "Ping Event"
    assert manager.active_connections_count() == 1
    assert ws_broken not in manager.active_connections


@pytest.mark.asyncio
async def test_empty_client_list_handling():
    manager = ConnectionManager()
    # Broadacsting to 0 clients should execute cleanly without error
    await manager.broadcast("No clients test")
    await manager.broadcast_to_session("empty_sess", "No clients test")
    assert manager.active_connections_count() == 0
