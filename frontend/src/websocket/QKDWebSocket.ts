import { MessageHandler, StatusHandler, WebSocketClient } from "./websocketClient";

export class QKDWebSocket {
  private client: WebSocketClient;

  constructor(sessionId?: string) {
    this.client = new WebSocketClient(sessionId);
  }

  public subscribeSession(sessionId: string): void {
    this.client.connect(sessionId);
  }

  public close(): void {
    this.client.disconnect();
  }

  public onMessage(handler: MessageHandler): () => void {
    return this.client.onMessage(handler);
  }

  public onStatusChange(handler: StatusHandler): () => void {
    return this.client.onStatusChange(handler);
  }

  public getStatus() {
    return this.client.getStatus();
  }
}
