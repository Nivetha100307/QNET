import { useState } from "react";
import { sessionService } from "../services/sessionService";
import { QKDSessionRequest, QKDSessionResponse } from "../types/api";

export const useCreateSession = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<QKDSessionResponse | null>(null);

  const createSession = async (request: QKDSessionRequest | number = 128): Promise<QKDSessionResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionService.startSession(request);
      setSessionData(data);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create QKD session";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSessionData(null);
    setError(null);
    setIsLoading(false);
  };

  return { createSession, isLoading, error, sessionData, reset };
};
