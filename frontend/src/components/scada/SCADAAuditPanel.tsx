import React from 'react';
import { ListFilter, ShieldCheck } from 'lucide-react';
import { SCADAPacketResponse } from '../../services';

interface SCADAAuditPanelProps {
  history: SCADAPacketResponse[];
}

export const SCADAAuditPanel: React.FC<SCADAAuditPanelProps> = ({ history }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-bold font-sans font-semibold">Immutable SCADA Execution Audit Log</span>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono font-bold">
          {history.length} Logs Persisted
        </span>
      </div>

      <div className="overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
              <th className="py-2 px-2">Timestamp</th>
              <th className="py-2 px-2">Packet ID</th>
              <th className="py-2 px-2">Command</th>
              <th className="py-2 px-2">Nodes</th>
              <th className="py-2 px-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((pkt) => (
                <tr key={pkt.packet_id} className="border-b border-slate-900/80 hover:bg-slate-950/40">
                  <td className="py-2 px-2 text-slate-400 text-[11px] whitespace-nowrap">
                    {new Date(pkt.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-2 text-cyan-400 font-bold text-[11px] whitespace-nowrap">
                    {pkt.packet_id}
                  </td>
                  <td className="py-2 px-2 text-slate-200 font-bold text-[11px] whitespace-nowrap">
                    {pkt.command}
                  </td>
                  <td className="py-2 px-2 text-slate-400 text-[11px] whitespace-nowrap">
                    {pkt.source_node} → {pkt.destination_node}
                  </td>
                  <td className="py-2 px-2 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold border bg-emerald-950 text-emerald-300 border-emerald-800">
                      EXECUTED
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                  No SCADA commands executed yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
