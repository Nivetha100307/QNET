import { qkdApi } from "../api/qkdApi";
import { HealthResponse } from "../types/api";

export const healthService = {
  async checkHealth(): Promise<HealthResponse> {
    return await qkdApi.health();
  },
};
