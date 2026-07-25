"""FastAPI WebSocket router for live QKD session streaming."""

from functools import lru_cache

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect

from app.infrastructure.websocket.connection_manager import ConnectionManager

router = APIRouter(prefix="/ws", tags=["websocket"])

# Singleton instance of ConnectionManager for WebSocket streaming
_global_connection_manager = ConnectionManager()


@lru_cache
def get_connection_manager() -> ConnectionManager:
    """Dependency provider for ConnectionManager singleton."""
    return _global_connection_manager


@router.websocket(
    "/qkd/sessions/{session_id}",
    name="qkd_session_websocket",
)
async def websocket_qkd_session(
    websocket: WebSocket,
    session_id: str,
    manager: ConnectionManager = Depends(get_connection_manager),
) -> None:
    """WebSocket endpoint for subscribing to live QKD session event streams.

    Route:
        ws://localhost:8000/api/v1/ws/qkd/sessions/{session_id}

    Workflow:
        1. Accept incoming WebSocket connection.
        2. Register client with ConnectionManager for session_id subscription.
        3. Maintain persistent connection, listening for client messages.
        4. Gracefully disconnect and remove client on disconnect or error.
    """
    await manager.connect(websocket, session_id=session_id)
    try:
        while True:
            # Keep-alive loop listening for incoming client messages or ping/pong
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id=session_id)
    except Exception:
        manager.disconnect(websocket, session_id=session_id)
