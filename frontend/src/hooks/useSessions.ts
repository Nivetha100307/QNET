import { useCallback, useEffect, useState } from "react";
import { sessionService } from "../services/sessionService";
import { QKDSessionResponse } from "../types/api";

export const useSessions = (limit: number = 20, offset: number = 0) => {
  const [sessions, setSessions] = useState<QKDSessionResponse[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sessionService.fetchSessions(limit, offset);
      setSessions(data.sessions);
      setTotal(data.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load sessions history";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, total, isLoading, error, refetch: fetchSessions };
};
