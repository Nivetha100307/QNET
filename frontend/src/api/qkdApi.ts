import {
  HealthResponse,
  QKDSessionRequest,
  QKDSessionResponse,
  SessionListResponse,
} from "../types/api";
import { apiClient } from "./client";
import { ENDPOINTS } from "./endpoints";

export const qkdApi = {
  /** Fetch backend service health status */
  async health(): Promise<HealthResponse> {
    const response = await apiClient.get<HealthResponse>(ENDPOINTS.HEALTH);
    return response.data;
  },

  /** Create and execute a new QKD session */
  async createSession(request: QKDSessionRequest): Promise<QKDSessionResponse> {
    const response = await apiClient.post<QKDSessionResponse>(
      ENDPOINTS.CREATE_SESSION,
      request
    );
    return response.data;
  },

  /** Fetch a specific QKD session outcome by ID */
  async getSession(sessionId: string): Promise<QKDSessionResponse> {
    const response = await apiClient.get<QKDSessionResponse>(
      ENDPOINTS.GET_SESSION(sessionId)
    );
    return response.data;
  },

  /** Fetch paginated historical list of QKD sessions */
  async listSessions(limit: number = 20, offset: number = 0): Promise<SessionListResponse> {
    const response = await apiClient.get<SessionListResponse>(
      ENDPOINTS.LIST_SESSIONS,
      { params: { limit, offset } }
    );
    return response.data;
  },
};
