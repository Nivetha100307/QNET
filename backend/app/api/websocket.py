from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import ws_manager
from app.core.logging_config import logger

router = APIRouter(tags=["WebSocket Real-Time Events"])

@router.websocket("/ws/sessions")
async def websocket_session_events(websocket: WebSocket) -> None:
    """WebSocket endpoint for receiving real-time quantum session events."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep socket alive and receive any client pings
            data = await websocket.receive_text()
            logger.info(f"Received client WS message: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection error: {str(e)}")
        ws_manager.disconnect(websocket)
