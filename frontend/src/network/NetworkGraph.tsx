import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import { Activity, Network } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardContext } from "../contexts/DashboardContext";
import { startNetworkAnimations } from "./networkAnimations";
import { networkPresetLayout } from "./networkLayout";
import { NETWORK_NODES } from "./QuantumNode";
import { NETWORK_EDGES } from "./QuantumEdge";
import { cyStylesheet } from "./networkStyles";

export const NetworkGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const { isEveActive, activeStep, bellData } = useDashboardContext();

  useEffect(() => {
    if (!containerRef.current) return;

    // Elements mapping
    const elements = [
      ...NETWORK_NODES.map((n) => ({
        data: { ...n },
      })),
      ...NETWORK_EDGES.map((e) => ({
        data: { ...e },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: cyStylesheet,
      layout: networkPresetLayout,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      autoungrabify: false,
    });

    cyRef.current = cy;
    const stopAnim = startNetworkAnimations(cy);

    return () => {
      stopAnim();
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  // Dynamically react to DashboardContext state changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    // Update Eve Edge
    const eveEdge = cy.getElementById("e5");
    if (isEveActive) {
      eveEdge.data("type", "compromised");
      eveEdge.style("line-color", "#ff3b30");
      eveEdge.style("opacity", 1);
    } else {
      eveEdge.data("type", "disconnected");
      eveEdge.style("line-color", "#5c6b75");
      eveEdge.style("opacity", 0.3);
    }

    // Update Source Node State based on activeStep
    const sourceNode = cy.getElementById("source");
    if (activeStep > 1 && activeStep < 8) {
      sourceNode.data("state", "running");
    } else if (activeStep === 8) {
      sourceNode.data("state", bellData.isEntangled ? "completed" : "failed");
    }
  }, [isEveActive, activeStep, bellData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel p-5 rounded-2xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network size={18} className="text-[#00f0ff]" />
          <h2 className="font-title font-bold text-base text-[#f0f4fc]">
            Cytoscape Quantum Topology Visualizer
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8c9ba5]">
          <Activity size={14} className="text-[#00ff9d]" />
          <span>Interactive Canvas Node Router</span>
        </div>
      </div>

      <div className="relative w-full h-[320px] bg-black/40 rounded-xl overflow-hidden border border-white/5">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
};

export default NetworkGraph;
