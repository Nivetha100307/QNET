/**
 * Cytoscape Network Node Data Types & Definitions
 */

export type NodeState = "idle" | "running" | "completed" | "failed";

export interface QuantumNodeData {
  id: string;
  label: string;
  type: "alice" | "bob" | "source" | "repeater" | "eve";
  state: NodeState;
  ip?: string;
}

export const NETWORK_NODES: QuantumNodeData[] = [
  { id: "alice", label: "Alice Terminal (Node A)", type: "alice", state: "completed", ip: "192.168.1.10" },
  { id: "source", label: "EPR Entanglement Source", type: "source", state: "completed", ip: "192.168.1.50" },
  { id: "bob", label: "Bob Terminal (Node B)", type: "bob", state: "completed", ip: "192.168.1.20" },
  { id: "repeater_1", label: "Quantum Repeater Alpha", type: "repeater", state: "idle", ip: "192.168.1.30" },
  { id: "repeater_2", label: "Quantum Repeater Beta", type: "repeater", state: "idle", ip: "192.168.1.40" },
  { id: "eve", label: "Eve Intercept Node", type: "eve", state: "failed", ip: "192.168.1.99" },
];
