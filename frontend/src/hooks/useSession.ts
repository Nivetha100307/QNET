import { useCallback, useState } from "react";
import { sessionService } from "../services/sessionService";
import { QKDSessionResponse } from "../types/api";

export const useSession = (initialSessionId?: string) => {
  const [session, setSession] = useState<QKDSessionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionService.fetchSession(sessionId);
      setSession(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Session not found";
      setError(msg);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { session, isLoading, error, fetchSession };
};
