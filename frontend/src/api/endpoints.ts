export const ENDPOINTS = {
  HEALTH: "/api/v1/health",
  CREATE_SESSION: "/api/v1/qkd/sessions",
  GET_SESSION: (id: string) => `/api/v1/qkd/sessions/${id}`,
  LIST_SESSIONS: "/api/v1/qkd/sessions",
} as const;
