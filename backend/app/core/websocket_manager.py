import json
from typing import List, Dict, Any
from fastapi import WebSocket
from app.core.logging_config import logger

class ConnectionManager:
    """Manager for WebSocket client connections and event broadcasting."""

    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """Accepts a WebSocket connection and registers it.

        Args:
            websocket (WebSocket): Client socket.
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket) -> None:
        """Removes a WebSocket client connection.

        Args:
            websocket (WebSocket): Client socket to disconnect.
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total active connections: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any]) -> None:
        """Broadcasts a JSON-encoded event payload to all connected clients.

        Args:
            event_type (str): Event identifier string.
            data (Dict[str, Any]): Event payload parameters.
        """
        message = {
            "event": event_type,
            "data": data
        }
        payload_str = json.dumps(message)
        disconnected = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(payload_str)
            except Exception as e:
                logger.warning(f"Failed to send WS broadcast: {str(e)}")
                disconnected.append(connection)

        for conn in disconnected:
            self.disconnect(conn)

ws_manager = ConnectionManager()
