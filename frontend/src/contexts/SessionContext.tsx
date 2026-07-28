import React, { createContext, useContext, useState } from "react";
import { BackendInfo, Session, SessionStatus } from "../types";

interface SessionContextType {
  activeSession: Session | null;
  activeStatus: SessionStatus;
  backendInfo: BackendInfo;
  setActiveSession: (session: Session | null) => void;
  setActiveStatus: (status: SessionStatus) => void;
  setBackendInfo: (info: BackendInfo) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [activeStatus, setActiveStatus] = useState<SessionStatus>("IDLE");
  const [backendInfo, setBackendInfo] = useState<BackendInfo>({
    name: "AerSimulator (Local CPU)",
    is_simulator: true,
    status: "ONLINE",
  });

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        activeStatus,
        backendInfo,
        setActiveSession,
        setActiveStatus,
        setBackendInfo,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
};
