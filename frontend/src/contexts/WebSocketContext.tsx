import React, { createContext, useContext, useState } from "react";
import { WebSocketEvent } from "../types";

interface WebSocketContextType {
  isConnected: boolean;
  lastEvent: WebSocketEvent | null;
  setIsConnected: (connected: boolean) => void;
  setLastEvent: (event: WebSocketEvent | null) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        lastEvent,
        setIsConnected,
        setLastEvent,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocketContext must be used within a WebSocketProvider");
  }
  return context;
};
