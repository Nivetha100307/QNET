import React, { useState, useEffect } from 'react';
import { Network, Zap, RefreshCw, Layers } from 'lucide-react';
import { SessionResponse, RepeaterMeshResponse, SwappingResponse, fetchRepeaterMesh, executeEntanglementSwapping } from '../services';

interface EntanglementSwappingModuleProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
}

export const EntanglementSwappingModule: React.FC<EntanglementSwappingModuleProps> = ({
  session,
  sessionHistory,
  onSelectSession
}) => {
  const [mesh, setMesh] = useState<RepeaterMeshResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [swappingResult, setSwappingResult] = useState<SwappingResponse | null>(null);

  useEffect(() => {
    async function loadMesh() {
      try {
        const data = await fetchRepeaterMesh();
        setMesh(data);
      } catch (err) {}
    }
    loadMesh();
  }, []);

  const handleSwapping = async () => {
    setLoading(true);
    try {
      const res = await executeEntanglementSwapping({
        session_uuid: session.session_id,
        repeater_node: 'R1_Control_SubA',
        source_node: session.source_node,
        destination_node: session.destination_node
      });
      setSwappingResult(res);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100">
                Module 7: Quantum Repeaters & Entanglement Swapping
              </h2>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Bell State Measurement (BSM) Repeaters & NetworkX Dijkstra Routing Mesh
            </p>
          </div>

          <button
            onClick={handleSwapping}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-lg"
          >
            {loading ? 'Executing BSM Swapping...' : 'Execute Entanglement Swapping'}
          </button>
        </div>
      </div>

      {mesh && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mesh.quantum_repeaters.map((r) => (
            <div key={r.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-bold text-cyan-400">{r.id}</div>
              <div className="text-xs text-slate-300">Location: {r.location}</div>
              <div className="text-xs text-slate-400">Memory Fidelity: {(r.memory_fidelity * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      )}

      {swappingResult && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-3">
          <div className="text-sm font-semibold text-emerald-300">BSM Entanglement Swapping Result</div>
          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              BSM Bell Outcome: <span className="text-cyan-400 font-bold">{swappingResult.bsm_result}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              Swapped Fidelity: <span className="text-emerald-400 font-bold">{swappingResult.swapped_fidelity}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
