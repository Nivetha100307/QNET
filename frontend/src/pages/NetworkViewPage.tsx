import React from "react";
import { NetworkGraph } from "../network/NetworkGraph";
import { DashboardProvider } from "../contexts/DashboardContext";

export const NetworkViewPage: React.FC = () => {
  return (
    <DashboardProvider>
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h1 className="font-title text-2xl font-bold text-[#f0f4fc]">Quantum Network Topology</h1>
          <p className="text-xs text-[#8c9ba5]">
            Interactive Cytoscape.js multi-node quantum graph router, repeaters, and optical channel state monitor.
          </p>
        </div>

        <NetworkGraph />
      </div>
    </DashboardProvider>
  );
};

export default NetworkViewPage;
