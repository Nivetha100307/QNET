import React, { useState, useEffect } from 'react';
import {
  Server,
  Zap,
  Radio,
  ArrowRightLeft,
  Cpu,
  Lock,
  Activity
} from 'lucide-react';
import { SessionResponse } from '../services';

interface NodePosition {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  type: 'CONTROL' | 'SUBSTATION';
  pingMs: number;
}

interface NodeCommunicationTopologyProps {
  activeSession: SessionResponse | null;
  selectedProtocol?: string;
  selectedSourceNode?: string;
  selectedDestNodes?: string[];
  onSelectNodePair?: (source: string, dest: string) => void;
}

export const NodeCommunicationTopology: React.FC<NodeCommunicationTopologyProps> = ({
  activeSession,
  selectedProtocol,
  selectedSourceNode,
  selectedDestNodes,
  onSelectNodePair
}) => {
  const [selectedSource, setSelectedSource] = useState<string>('Control_Center');
  const [selectedDest, setSelectedDest] = useState<string>('Substation_A');
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (activeSession) {
      setSelectedSource(activeSession.source_node);
      setSelectedDest(activeSession.destination_node);
    } else if (selectedSourceNode) {
      setSelectedSource(selectedSourceNode);
    }
  }, [activeSession, selectedSourceNode]);

  // Smooth 60FPS animation tick for flying photons
  useEffect(() => {
    let animFrame: number;
    const animate = () => {
      setProgress((prev) => (prev + 0.008) % 1.0);
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Compact horizontal 5-node arrangement
  const nodes: NodePosition[] = [
    { id: 'Control_Center', name: 'Control Center (HQ)', shortName: 'Control Center', x: 80, y: 120, type: 'CONTROL', pingMs: 1.2 },
    { id: 'Substation_A', name: 'Substation A (North)', shortName: 'Substation A', x: 240, y: 120, type: 'SUBSTATION', pingMs: 1.8 },
    { id: 'Substation_B', name: 'Substation B (East)', shortName: 'Substation B', x: 400, y: 120, type: 'SUBSTATION', pingMs: 2.4 },
    { id: 'Substation_C', name: 'Substation C (South)', shortName: 'Substation C', x: 560, y: 120, type: 'SUBSTATION', pingMs: 3.1 },
    { id: 'Substation_D', name: 'Substation D (West)', shortName: 'Substation D', x: 720, y: 120, type: 'SUBSTATION', pingMs: 4.0 },
  ];

  const getNode = (id: string) => nodes.find((n) => n.id === id) || nodes[0];
  const srcNode = getNode(selectedSourceNode || activeSession?.source_node || selectedSource);

  // Extract all target destination node IDs from UI selection or active session
  const destNodeIds = React.useMemo(() => {
    if (selectedProtocol === 'GHZ' && selectedDestNodes && selectedDestNodes.length > 0) {
      return selectedDestNodes;
    }
    if (activeSession?.destination_node) {
      const split = activeSession.destination_node.split(',').map((s) => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
    if (selectedDestNodes && selectedDestNodes.length > 0) {
      return selectedDestNodes;
    }
    return [selectedDest];
  }, [selectedProtocol, selectedDestNodes, activeSession, selectedDest]);

  const targetNodes = destNodeIds.map(getNode);

  const isSessionActive = activeSession?.status === 'ACTIVE' || activeSession?.status === 'READY';
  const isGhzProtocol = selectedProtocol === 'GHZ' || activeSession?.protocol === 'GHZ';

  const handleNodeClick = (nodeId: string) => {
    if (nodeId === srcNode.id) return;
    setSelectedDest(nodeId);
    if (onSelectNodePair) {
      onSelectNodePair(srcNode.id, nodeId);
    }
  };

  // Helper function to build bezier curve parameters for any source-destination node pair
  const createLinkCurve = (targetNode: NodePosition) => {
    const midX = (srcNode.x + targetNode.x) / 2;
    const arcControlY = 30; // arch upwards
    const curvePath = `M ${srcNode.x} ${srcNode.y} Q ${midX} ${arcControlY} ${targetNode.x} ${targetNode.y}`;

    const getBezierPoint = (t: number) => {
      const t1 = 1 - t;
      const x = t1 * t1 * srcNode.x + 2 * t1 * t * midX + t * t * targetNode.x;
      const y = t1 * t1 * srcNode.y + 2 * t1 * t * arcControlY + t * t * targetNode.y;
      return { x, y };
    };

    const p1 = getBezierPoint(progress);
    const p2 = getBezierPoint((progress + 0.5) % 1.0);
    const trail1 = getBezierPoint(Math.max(0, progress - 0.04));
    const trail2 = getBezierPoint(Math.max(0, progress - 0.08));

    const angle = progress * Math.PI * 8;
    const orbitalOffset1 = { x: Math.cos(angle) * 7, y: Math.sin(angle) * 7 };
    const orbitalOffset2 = { x: -Math.cos(angle) * 7, y: -Math.sin(angle) * 7 };

    return {
      targetNode,
      curvePath,
      midX,
      arcControlY,
      p1,
      p2,
      trail1,
      trail2,
      orbitalOffset1,
      orbitalOffset2
    };
  };

  const activeLinks = targetNodes.map(createLinkCurve);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-3">
              Real-Time Node-to-Node Quantum Communication Topology
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                isGhzProtocol
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}>
                {isGhzProtocol ? `GHZ ${destNodeIds.length}-Node Group Broadcast` : 'E91 Active Optical Mesh'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualizing photon entanglement pulses {isGhzProtocol ? '|GHZ₄⟩' : '|Φ+⟩'} flowing between optical nodes
            </p>
          </div>
        </div>

        {/* Selected Route Info Badge */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-slate-400 font-sans text-[11px] font-semibold">Active Path:</span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold">{srcNode.shortName}</span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-purple-300 font-bold">
              {destNodeIds.length === 1
                ? getNode(destNodeIds[0]).shortName
                : `${destNodeIds.map(id => getNode(id).shortName.replace('Substation ', '')).join(', ')} (${destNodeIds.length} Nodes)`}
            </span>
          </span>
        </div>
      </div>

      {/* COMPACT & PROPERLY ALIGNED SVG TOPOLOGY DIAGRAM */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-950/90 border border-slate-800 p-2">
        <svg viewBox="0 0 800 220" className="w-full h-auto max-h-[240px] overflow-visible">
          <defs>
            {/* Laser Glow Filter */}
            <filter id="laserGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="photonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Arc Gradient */}
            <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>

            <linearGradient id="ghzGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* 1. Base Horizontal Optical Backbone Bus Line */}
          <line
            x1="80"
            y1="120"
            x2="720"
            y2="120"
            stroke="#1e293b"
            strokeWidth="2"
            strokeDasharray="6 6"
          />

          {/* 2. Active Quantum Laser Transmission Arcs for ALL Target Nodes */}
          {activeLinks.map((link) => (
            <g key={`link-${link.targetNode.id}`}>
              <path
                d={link.curvePath}
                fill="none"
                stroke={isGhzProtocol ? "url(#ghzGrad)" : "url(#arcGrad)"}
                strokeWidth={isSessionActive ? "3.5" : "2.5"}
                filter="url(#laserGlow)"
                className="transition-all duration-500"
              />

              {/* Secondary Parallel Dashed Classical Line */}
              <path
                d={`M ${srcNode.x} ${srcNode.y + 6} Q ${link.midX} ${link.arcControlY + 6} ${link.targetNode.x} ${link.targetNode.y + 6}`}
                fill="none"
                stroke={isGhzProtocol ? "#c084fc" : "#10b981"}
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* 3. FLYING PHOTON PULSE ANIMATION FOR THIS LINK */}
              <g>
                <circle cx={link.trail2.x} cy={link.trail2.y} r="2.5" fill="#06b6d4" opacity="0.3" />
                <circle cx={link.trail1.x} cy={link.trail1.y} r="4" fill="#22d3ee" opacity="0.6" />

                {/* Primary Entangled Photon Core 1 */}
                <circle cx={link.p1.x} cy={link.p1.y} r="7" fill={isGhzProtocol ? "#c084fc" : "#22d3ee"} filter="url(#photonGlow)" />
                <circle cx={link.p1.x} cy={link.p1.y} r="3" fill="#ffffff" />

                {/* Entangled Orbiting Sub-Photons */}
                <circle cx={link.p1.x + link.orbitalOffset1.x} cy={link.p1.y + link.orbitalOffset1.y} r="2.5" fill="#67e8f9" />
                <circle cx={link.p1.x + link.orbitalOffset2.x} cy={link.p1.y + link.orbitalOffset2.y} r="2.5" fill="#a855f7" />

                {/* Primary Entangled Photon Core 2 */}
                <circle cx={link.p2.x} cy={link.p2.y} r="6" fill="#f472b6" filter="url(#photonGlow)" />
                <circle cx={link.p2.x} cy={link.p2.y} r="2.5" fill="#ffffff" />

                {/* Protocol Badge moving along path */}
                {isSessionActive && (
                  <g transform={`translate(${link.p1.x}, ${link.p1.y - 14})`}>
                    <rect x="-16" y="-8" width="32" height="14" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
                    <text x="0" y="2" fill="#c7d2fe" fontSize="7" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      {isGhzProtocol ? "GHZ" : "E91"}
                    </text>
                  </g>
                )}
              </g>
            </g>
          ))}

          {/* 4. Draw Nodes along the Horizontal Axis */}
          {nodes.map((node) => {
            const isSource = node.id === selectedSource;
            const isDest = destNodeIds.includes(node.id);
            const isControl = node.type === 'CONTROL';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => handleNodeClick(node.id)}
                className="cursor-pointer group"
              >
                {/* Selected Pulse Ring */}
                {(isSource || isDest) && (
                  <circle
                    r={isControl ? 26 : 22}
                    fill="none"
                    stroke={isSource ? '#22d3ee' : '#c084fc'}
                    strokeWidth="2"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                {/* Main Node Base Circle */}
                <circle
                  r={isControl ? 22 : 18}
                  fill={isControl ? '#0f172a' : '#090d16'}
                  stroke={isSource ? '#22d3ee' : isDest ? '#c084fc' : '#334155'}
                  strokeWidth={isSource || isDest ? 3 : 1.5}
                  filter={isSource || isDest ? 'url(#laserGlow)' : undefined}
                  className="transition-all duration-300 group-hover:stroke-cyan-400"
                />

                {/* Node Icon */}
                <foreignObject
                  x={isControl ? -11 : -9}
                  y={isControl ? -11 : -9}
                  width={isControl ? 22 : 18}
                  height={isControl ? 22 : 18}
                >
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    {isControl ? (
                      <Server className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Cpu className="w-3.5 h-3.5 text-purple-300" />
                    )}
                  </div>
                </foreignObject>

                {/* Node Label Below */}
                <g transform="translate(0, 32)">
                  <rect
                    x="-55"
                    y="-10"
                    width="110"
                    height="20"
                    rx="5"
                    fill="#020617"
                    stroke={isSource ? '#06b6d4' : isDest ? '#a855f7' : '#1e293b'}
                    strokeWidth="1.2"
                  />
                  <circle cx="-44" cy="0" r="2.5" fill="#10b981" />
                  <text
                    x="-36"
                    y="3"
                    fill={isSource ? '#22d3ee' : isDest ? '#e9d5ff' : '#cbd5e1'}
                    fontSize="8.5"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    textAnchor="start"
                  >
                    {node.shortName}
                  </text>
                </g>

                {/* Role Badges Above */}
                {isSource && (
                  <g transform="translate(0, -28)">
                    <rect x="-30" y="-8" width="60" height="14" rx="3" fill="#083344" stroke="#06b6d4" strokeWidth="1" />
                    <text x="0" y="2" fill="#67e8f9" fontSize="7.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      SOURCE
                    </text>
                  </g>
                )}

                {isDest && (
                  <g transform="translate(0, -28)">
                    <rect x="-38" y="-8" width="76" height="14" rx="3" fill="#3b0764" stroke="#a855f7" strokeWidth="1" />
                    <text x="0" y="2" fill="#f0abfc" fontSize="7.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      DESTINATION
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* COMPACT & ALIGNED METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block font-sans font-bold">
            E91 QUANTUM CHANNEL
          </span>
          <div className="flex items-center justify-between">
            <span className="text-slate-200 font-bold">{selectedSource} ➔ {selectedDest}</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              {activeSession ? activeSession.quantum_channel?.status || 'CONNECTED' : 'READY'}
            </span>
          </div>
          <span className="text-cyan-400 text-[10px] block">
            Latency: <strong>{activeSession?.quantum_channel?.latency_ms || 6.29} ms</strong> | Loss: <strong>{activeSession?.quantum_channel?.photon_loss || 15.0}%</strong>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block font-sans font-bold">
            CLASSICAL CONTROL CHANNEL
          </span>
          <div className="flex items-center justify-between">
            <span className="text-slate-200 font-bold">AES-256-GCM Encrypted</span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              AUTHENTICATED
            </span>
          </div>
          <span className="text-emerald-400 text-[10px] block">
            Latency: <strong>{activeSession?.classical_channel?.latency_ms || 3.07} ms</strong> | Status: <strong>READY</strong>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
          <span className="text-slate-500 text-[10px] uppercase block font-sans font-bold">
            TELEMETRY STATS
          </span>
          <div className="flex items-center justify-between">
            <span className="text-purple-300 font-bold">{activeSession?.message_count || 0} Msgs</span>
            <span className="text-amber-300 font-bold">{activeSession?.bytes_transferred || 0} B</span>
          </div>
          <span className="text-slate-400 text-[10px] block font-sans">
            Click any node above to select active destination node
          </span>
        </div>
      </div>
    </div>
  );
};
