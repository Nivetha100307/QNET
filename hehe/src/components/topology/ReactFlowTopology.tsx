import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant
} from '@xyflow/react';
import { useAppStore } from '../../store/useAppStore';
import { TopologyNode } from '../../types';
import {
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Cpu,
  Server,
  Lock,
  X,
  KeyRound
} from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: 'CC_MAIN',
    type: 'default',
    position: { x: 380, y: 30 },
    data: {
      label: 'Control Centre (Master SOC)',
      type: 'CONTROL_CENTRE',
      status: 'GREEN',
      trustScore: 100,
      substation: 'HQ_CORE',
      ip: '10.0.0.1',
      protocol: 'E91 QKD + HTTPS'
    },
    style: {
      background: '#0f172a',
      color: '#38bdf8',
      border: '2px solid #0284c7',
      boxShadow: '0 0 15px rgba(2, 132, 199, 0.3)',
      width: 220,
    }
  },
  {
    id: 'SUB_NORTH',
    type: 'default',
    position: { x: 180, y: 150 },
    data: {
      label: 'Substation North (Alice)',
      type: 'SUBSTATION',
      status: 'GREEN',
      trustScore: 100,
      substation: 'SUB_NORTH',
      ip: '10.1.0.10',
      protocol: 'E91 QKD Session'
    },
    style: {
      background: '#0f172a',
      color: '#2dd4bf',
      border: '2px solid #0d9488',
      boxShadow: '0 0 12px rgba(13, 148, 136, 0.25)',
      width: 200,
    }
  },
  {
    id: 'SUB_SOUTH',
    type: 'default',
    position: { x: 580, y: 150 },
    data: {
      label: 'Substation South (Bob)',
      type: 'SUBSTATION',
      status: 'GREEN',
      trustScore: 100,
      substation: 'SUB_SOUTH',
      ip: '10.2.0.10',
      protocol: 'E91 QKD Session'
    },
    style: {
      background: '#0f172a',
      color: '#2dd4bf',
      border: '2px solid #0d9488',
      boxShadow: '0 0 12px rgba(13, 148, 136, 0.25)',
      width: 200,
    }
  },
  {
    id: 'BRK_12',
    type: 'default',
    position: { x: 100, y: 280 },
    data: {
      label: 'Circuit Breaker BRK_12',
      type: 'BREAKER',
      status: 'GREEN',
      trustScore: 100,
      substation: 'SUB_NORTH',
      voltage: '230.4 V',
      current: '42.1 A',
      state: 'OPEN'
    },
    style: {
      background: '#0f172a',
      color: '#f8fafc',
      border: '2px solid #334155',
      width: 180,
    }
  },
  {
    id: 'TRANS_TAP_01',
    type: 'default',
    position: { x: 270, y: 280 },
    data: {
      label: 'Transformer Tap 01',
      type: 'TRANSFORMER',
      status: 'GREEN',
      trustScore: 98,
      substation: 'SUB_NORTH',
      load: '78.4%'
    },
    style: {
      background: '#0f172a',
      color: '#f8fafc',
      border: '2px solid #334155',
      width: 180,
    }
  },
  {
    id: 'RELAY_04',
    type: 'default',
    position: { x: 500, y: 280 },
    data: {
      label: 'Protection Relay 04',
      type: 'RELAY',
      status: 'GREEN',
      trustScore: 100,
      substation: 'SUB_SOUTH',
      state: 'NORMAL'
    },
    style: {
      background: '#0f172a',
      color: '#f8fafc',
      border: '2px solid #334155',
      width: 180,
    }
  },
  {
    id: 'GEN_MAIN_01',
    type: 'default',
    position: { x: 670, y: 280 },
    data: {
      label: 'Generator Unit 01',
      type: 'GENERATOR',
      status: 'GREEN',
      trustScore: 96,
      substation: 'SUB_SOUTH',
      output: '1200.0 kW'
    },
    style: {
      background: '#0f172a',
      color: '#f8fafc',
      border: '2px solid #334155',
      width: 180,
    }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e-cc-north',
    source: 'CC_MAIN',
    target: 'SUB_NORTH',
    animated: true,
    label: 'E91 QKD (1.45 kbps)',
    style: { stroke: '#06b6d4', strokeWidth: 3 },
    labelStyle: { fill: '#38bdf8', fontSize: 10, fontFamily: 'JetBrains Mono' }
  },
  {
    id: 'e-cc-south',
    source: 'CC_MAIN',
    target: 'SUB_SOUTH',
    animated: true,
    label: 'E91 QKD (1.42 kbps)',
    style: { stroke: '#06b6d4', strokeWidth: 3 },
    labelStyle: { fill: '#38bdf8', fontSize: 10, fontFamily: 'JetBrains Mono' }
  },
  {
    id: 'e-north-brk',
    source: 'SUB_NORTH',
    target: 'BRK_12',
    animated: true,
    label: 'RS-485 Modbus',
    style: { stroke: '#10b981', strokeWidth: 2 },
    labelStyle: { fill: '#34d399', fontSize: 10, fontFamily: 'JetBrains Mono' }
  },
  {
    id: 'e-north-trans',
    source: 'SUB_NORTH',
    target: 'TRANS_TAP_01',
    animated: true,
    label: 'IEC 61850',
    style: { stroke: '#10b981', strokeWidth: 2 },
    labelStyle: { fill: '#34d399', fontSize: 10, fontFamily: 'JetBrains Mono' }
  },
  {
    id: 'e-south-relay',
    source: 'SUB_SOUTH',
    target: 'RELAY_04',
    animated: true,
    label: 'IEC 61850',
    style: { stroke: '#10b981', strokeWidth: 2 },
    labelStyle: { fill: '#34d399', fontSize: 10, fontFamily: 'JetBrains Mono' }
  },
  {
    id: 'e-south-gen',
    source: 'SUB_SOUTH',
    target: 'GEN_MAIN_01',
    animated: true,
    label: 'DNP3',
    style: { stroke: '#10b981', strokeWidth: 2 },
    labelStyle: { fill: '#34d399', fontSize: 10, fontFamily: 'JetBrains Mono' }
  }
];

export const ReactFlowTopology: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);
  const { breakerStateOverrides, toggleBreakerState } = useAppStore();

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data);
  }, []);

  return (
    <div className="relative w-full h-[520px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        className="bg-slate-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
        <Controls />
      </ReactFlow>

      {/* Node Detail Drawer Modal */}
      {selectedNodeData && (
        <div className="absolute right-4 top-4 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-50 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-slate-100">{selectedNodeData.label}</span>
            </div>
            <button
              onClick={() => setSelectedNodeData(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Device Type:</span>
              <span className="text-teal-400 font-semibold">{selectedNodeData.type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Substation:</span>
              <span className="text-slate-200">{selectedNodeData.substation || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Zero-Trust Score:</span>
              <span className="text-emerald-400 font-bold">{selectedNodeData.trustScore} / 100</span>
            </div>
            {selectedNodeData.voltage && (
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Live Voltage:</span>
                <span className="text-slate-200">{selectedNodeData.voltage}</span>
              </div>
            )}
            {selectedNodeData.current && (
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">Live Current:</span>
                <span className="text-slate-200">{selectedNodeData.current}</span>
              </div>
            )}
            {selectedNodeData.type === 'BREAKER' && (
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 font-sans">Breaker State:</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold ${
                      breakerStateOverrides[selectedNodeData.id] === 'OPEN'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {breakerStateOverrides[selectedNodeData.id] || 'OPEN'}
                  </span>
                </div>
                <button
                  onClick={() => toggleBreakerState(selectedNodeData.id)}
                  className="w-full mt-1 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Toggle Circuit Breaker</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
