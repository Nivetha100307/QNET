"""Unit tests for the FastAPI WebSocket endpoint in app/api/v1/endpoints/websocket.py."""

import pytest
from fastapi.testclient import TestClient

from app.api.v1.endpoints.websocket import get_connection_manager
from app.infrastructure.websocket.connection_manager import ConnectionManager
from app.main import app


@pytest.fixture
def mock_connection_manager():
    manager = ConnectionManager()
    app.dependency_overrides[get_connection_manager] = lambda: manager
    yield manager
    app.dependency_overrides.clear()


def test_websocket_connection_accepted_and_registered(mock_connection_manager):
    client = TestClient(app)
    session_id = "sess_unit_101"

    with client.websocket_connect(f"/api/v1/ws/qkd/sessions/{session_id}") as websocket:
        assert mock_connection_manager.active_connections_count() == 1
        assert mock_connection_manager.session_connections_count(session_id) == 1

        # Send optional text frame
        websocket.send_text("ping")


def test_websocket_disconnect_cleanup(mock_connection_manager):
    client = TestClient(app)
    session_id = "sess_unit_102"

    with client.websocket_connect(f"/api/v1/ws/qkd/sessions/{session_id}"):
        assert mock_connection_manager.active_connections_count() == 1

    # Outside context block, client is disconnected and cleaned up
    assert mock_connection_manager.active_connections_count() == 0
    assert mock_connection_manager.session_connections_count(session_id) == 0


def test_websocket_multiple_connections_same_session(mock_connection_manager):
    client = TestClient(app)
    session_id = "sess_unit_multi"

    with client.websocket_connect(f"/api/v1/ws/qkd/sessions/{session_id}") as ws1:
        assert mock_connection_manager.session_connections_count(session_id) == 1

        with client.websocket_connect(f"/api/v1/ws/qkd/sessions/{session_id}") as ws2:
            assert mock_connection_manager.session_connections_count(session_id) == 2
            assert mock_connection_manager.active_connections_count() == 2

        assert mock_connection_manager.session_connections_count(session_id) == 1

    assert mock_connection_manager.active_connections_count() == 0
