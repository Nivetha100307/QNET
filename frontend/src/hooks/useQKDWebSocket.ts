import { useCallback, useEffect, useRef, useState } from "react";
import { WebSocketConnectionStatus, WebSocketEvent } from "../types/websocket";
import { QKDWebSocket } from "../websocket/QKDWebSocket";

export const useQKDWebSocket = (sessionId?: string) => {
  const socketRef = useRef<QKDWebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketConnectionStatus>("DISCONNECTED");
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [eventCount, setEventCount] = useState<number>(0);

  const connect = useCallback((targetSessionId: string) => {
    if (!socketRef.current) {
      socketRef.current = new QKDWebSocket(targetSessionId);
    }
    const socket = socketRef.current;

    const unsubscribeStatus = socket.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const unsubscribeMessage = socket.onMessage((evt) => {
      setLastEvent(evt);
      setEventCount((prev) => prev + 1);
    });

    socket.subscribeSession(targetSessionId);

    return () => {
      unsubscribeStatus();
      unsubscribeMessage();
    };
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setStatus("DISCONNECTED");
  }, []);

  useEffect(() => {
    if (sessionId) {
      const cleanup = connect(sessionId);
      return () => {
        cleanup();
        disconnect();
      };
    }
  }, [sessionId, connect, disconnect]);

  return { status, lastEvent, eventCount, connect, disconnect };
};
