import { WebSocketConnectionStatus, WebSocketEvent } from "../types/websocket";
import { parseWebSocketMessage } from "./eventParser";

export type MessageHandler = (event: WebSocketEvent) => void;
export type StatusHandler = (status: WebSocketConnectionStatus) => void;

export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string = "";
  private status: WebSocketConnectionStatus = "DISCONNECTED";
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();

  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

  private isExplicitDisconnect: boolean = false;

  constructor(sessionId?: string) {
    if (sessionId) {
      this.url = this.buildUrl(sessionId);
    }
  }

  public buildUrl(sessionId: string): string {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/^http:\/\//, "").replace(/^https:\/\//, "")
      : "127.0.0.1:8000";
    return `${protocol}//${host}/api/v1/ws/qkd/sessions/${sessionId}`;
  }

  public connect(sessionId?: string): void {
    if (sessionId) {
      this.url = this.buildUrl(sessionId);
    }

    if (!this.url) {
      console.warn("[WebSocketClient] Cannot connect: No session ID provided.");
      return;
    }

    this.isExplicitDisconnect = false;
    this.setStatus("CONNECTING");

    try {
      this.cleanUpSocket();
      this.socket = new WebSocket(this.url);

      // Timeout safety check
      this.connectionTimeoutTimer = setTimeout(() => {
        if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
          console.warn("[WebSocketClient] Connection timed out.");
          this.socket.close();
          this.handleReconnect();
        }
      }, 5000);

      this.socket.onopen = () => {
        this.clearTimeoutTimer();
        this.reconnectAttempts = 0;
        this.setStatus("CONNECTED");
        this.startHeartbeat();
      };

      this.socket.onmessage = (event: MessageEvent) => {
        const parsed = parseWebSocketMessage(event.data);
        if (parsed) {
          this.messageHandlers.forEach((handler) => handler(parsed));
        }
      };

      this.socket.onerror = (err) => {
        console.error("[WebSocketClient] Socket error:", err);
      };

      this.socket.onclose = () => {
        this.stopHeartbeat();
        this.clearTimeoutTimer();
        if (!this.isExplicitDisconnect) {
          this.handleReconnect();
        } else {
          this.setStatus("DISCONNECTED");
        }
      };
    } catch (err) {
      console.error("[WebSocketClient] Exception on connect:", err);
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus("FAILED");
      return;
    }

    this.setStatus("RECONNECTING");
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  public disconnect(): void {
    this.isExplicitDisconnect = true;
    this.stopHeartbeat();
    this.clearTimeoutTimer();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.cleanUpSocket();
    this.setStatus("DISCONNECTED");
  }

  private cleanUpSocket(): void {
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      if (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      ) {
        this.socket.close();
      }
      this.socket = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingIntervalTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: "PING", timestamp: new Date().toISOString() }));
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }

  private clearTimeoutTimer(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }

  public onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    handler(this.status);
    return () => this.statusHandlers.delete(handler);
  }

  public getStatus(): WebSocketConnectionStatus {
    return this.status;
  }

  private setStatus(status: WebSocketConnectionStatus): void {
    this.status = status;
    this.statusHandlers.forEach((handler) => handler(status));
  }
}
