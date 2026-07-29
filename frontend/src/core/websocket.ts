import { EventBus } from './EventBus';

class WebSocketService {
  private socket: WebSocket | null = null;
  private isConnecting: boolean = false;
  private reconnectInterval: number = 1000;

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public connect(): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }
    this.isConnecting = true;

    // Use direct port 8000 WS endpoint
    const wsUrl = 'ws://localhost:8000/api/v1/ws/sessions';

    try {
      if (this.socket) {
        try {
          this.socket.close();
        } catch (e) {}
      }

      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
        console.log('[QNetSecure WS] Single connection established successfully.');
        EventBus.emit('WS_STATUS', { connected: true });
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          const eventType = parsed.event || 'UNKNOWN';
          const payload = parsed.data !== undefined ? parsed.data : parsed;
          EventBus.emit(eventType, payload);
        } catch (e) {
          console.error('[QNetSecure WS] Message parse error:', e);
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.isConnecting = false;
        console.warn('[QNetSecure WS] Connection closed. Reconnecting in 1s...');
        EventBus.emit('WS_STATUS', { connected: false });
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.socket.onerror = (error) => {
        console.error('[QNetSecure WS] Socket error:', error);
      };
    } catch (e) {
      this.isConnecting = false;
      console.error('[QNetSecure WS] Failed to initiate connection:', e);
      EventBus.emit('WS_STATUS', { connected: false });
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      try {
        this.socket.close();
      } catch (e) {}
      this.socket = null;
    }
  }
}

export const wsService = new WebSocketService();
