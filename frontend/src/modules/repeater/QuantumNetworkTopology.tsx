import React from 'react';
import { Network, Activity, Cpu, Server, ShieldCheck } from 'lucide-react';
import { RepeaterNodeCard } from './RepeaterNode';
import { RepeaterNodeInfo } from '../../services/repeaterApi';
import { QuantumLink } from './QuantumLink';

interface QuantumNetworkTopologyProps {
  nodes: RepeaterNodeInfo[];
  stage: 'INITIAL' | 'BELL_PAIRS' | 'SWAP_R1' | 'SWAP_R2' | 'SWAP_R3' | 'END_TO_END';
  distanceKm: number;
}

export const QuantumNetworkTopology: React.FC<QuantumNetworkTopologyProps> = ({
  nodes,
  stage,
  distanceKm
}) => {
  const hopDist = (distanceKm / 4).toFixed(0);

  // Define 5 horizontal node positions for SVG linking
  const nodeCoords = [
    { id: 'Control_Center', label: 'Control Center', x: 90, y: 75, type: 'SOURCE' },
    { id: 'Repeater_R1', label: 'Repeater R1', x: 285, y: 75, type: 'REPEATER' },
    { id: 'Repeater_R2', label: 'Repeater R2', x: 480, y: 75, type: 'REPEATER' },
    { id: 'Repeater_R3', label: 'Repeater R3', x: 675, y: 75, type: 'REPEATER' },
    { id: 'Substation_A', label: 'Substation A', x: 870, y: 75, type: 'DESTINATION' }
  ];

  const getLinkStatus = (linkIdx: number): 'IDLE' | 'ACTIVE' | 'SWAPPED' | 'DIMMED' => {
    if (stage === 'END_TO_END') return 'SWAPPED';
    if (stage === 'INITIAL') return 'IDLE';
    if (stage === 'BELL_PAIRS') return 'ACTIVE';
    if (stage === 'SWAP_R1') return linkIdx <= 1 ? 'SWAPPED' : 'ACTIVE';
    if (stage === 'SWAP_R2') return linkIdx <= 2 ? 'SWAPPED' : 'ACTIVE';
    if (stage === 'SWAP_R3') return 'SWAPPED';
    return 'ACTIVE';
  };

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.15)] space-y-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Network className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-100 uppercase tracking-wide">
              Quantum Network Topology & Live Mesh Visualizer
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Dynamic Qubit Photon Transmission & Repeater Mesh State Engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">
            Link Distance: <strong>{distanceKm} km</strong>
          </span>
          <span className="text-xs px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-extrabold border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            STAGE: {stage}
          </span>
        </div>
      </div>

      {/* Centerpiece SVG Canvas for Links & Particle Flows */}
      <div className="relative w-full overflow-x-auto bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80">
        <svg viewBox="0 0 960 150" className="w-full min-w-[760px] h-40 select-none">
          {/* Links between adjacent nodes */}
          <QuantumLink x1={90} y1={75} x2={285} y2={75} status={getLinkStatus(0)} label={`${hopDist} km`} />
          <QuantumLink x1={285} y1={75} x2={480} y2={75} status={getLinkStatus(1)} label={`${hopDist} km`} />
          <QuantumLink x1={480} y1={75} x2={675} y2={75} status={getLinkStatus(2)} label={`${hopDist} km`} />
          <QuantumLink x1={675} y1={75} x2={870} y2={75} status={getLinkStatus(3)} label={`${hopDist} km`} />

          {/* Node SVG Icons & Glows */}
          {nodeCoords.map((nc) => (
            <g key={nc.id}>
              <circle
                cx={nc.x}
                cy={nc.y}
                r="25"
                fill="#0b1329"
                stroke={nc.type === 'SOURCE' ? '#06b6d4' : nc.type === 'DESTINATION' ? '#10b981' : '#a855f7'}
                strokeWidth="3"
                className="transition-all duration-300"
              />
              <circle
                cx={nc.x}
                cy={nc.y}
                r="32"
                fill="none"
                stroke={nc.type === 'SOURCE' ? '#06b6d4' : nc.type === 'DESTINATION' ? '#10b981' : '#a855f7'}
                strokeOpacity="0.35"
                className="animate-ping"
              />
              <text
                x={nc.x}
                y={nc.y + 48}
                fill="#f1f5f9"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {nc.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Repeater Node Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {nodes.map((node) => (
          <RepeaterNodeCard key={node.id} node={node} type="REPEATER" />
        ))}
      </div>
    </div>
  );
};
