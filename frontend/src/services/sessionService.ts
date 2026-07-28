import { qkdApi } from "../api/qkdApi";
import { QKDSessionRequest, QKDSessionResponse, SessionListResponse } from "../types/api";

export const sessionService = {
  async startSession(request: QKDSessionRequest | number = 128): Promise<QKDSessionResponse> {
    const payload: QKDSessionRequest = typeof request === "number" ? { num_bits: request } : request;
    return await qkdApi.createSession(payload);
  },

  async fetchSession(sessionId: string): Promise<QKDSessionResponse> {
    return await qkdApi.getSession(sessionId);
  },

  async fetchSessions(limit: number = 20, offset: number = 0): Promise<SessionListResponse> {
    return await qkdApi.listSessions(limit, offset);
  },
};
