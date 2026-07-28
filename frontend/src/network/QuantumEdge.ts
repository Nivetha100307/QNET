/**
 * Cytoscape Network Edge Data Types & Definitions
 */

export type EdgeType = "secure" | "warning" | "compromised" | "disconnected";

export interface QuantumEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  type: EdgeType;
}

export const NETWORK_EDGES: QuantumEdgeData[] = [
  { id: "e1", source: "source", target: "alice", label: "Quantum Fiber A", type: "secure" },
  { id: "e2", source: "source", target: "bob", label: "Quantum Fiber B", type: "secure" },
  { id: "e3", source: "alice", target: "repeater_1", label: "Control Plane A", type: "secure" },
  { id: "e4", source: "bob", target: "repeater_2", label: "Control Plane B", type: "secure" },
  { id: "e5", source: "eve", target: "source", label: "Intercept Cable", type: "disconnected" },
];
