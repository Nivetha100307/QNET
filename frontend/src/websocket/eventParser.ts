import { WebSocketEvent } from "../types/websocket";

/**
 * Safely parse incoming WebSocket raw text frames into typed WebSocketEvent objects.
 */
export const parseWebSocketMessage = (data: string): WebSocketEvent | null => {
  try {
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== "object") return null;

    return {
      session_id: parsed.session_id || parsed.sessionId || "unknown",
      event_type: parsed.event_type || parsed.eventType || "UNKNOWN_EVENT",
      payload: parsed.payload || parsed.data || {},
      timestamp: parsed.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to parse WebSocket JSON payload:", error);
    return null;
  }
};
