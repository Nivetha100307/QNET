import React, { useState } from 'react';
import { ListFilter, ShieldAlert, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  stage: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
}

interface AuditTableProps {
  logs: AuditLogEntry[];
}

export const AuditTable: React.FC<AuditTableProps> = ({ logs }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    if (filterSeverity === 'ALL') return true;
    return log.severity === filterSeverity;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-bold font-sans">Zero-Trust Audit Log Viewer</span>
        </div>

        {/* Severity Filter Buttons */}
        <div className="flex items-center gap-1.5 text-[10px]">
          {['ALL', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded border transition-all ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
                  : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
              <th className="py-2 px-2">Timestamp</th>
              <th className="py-2 px-2">Stage</th>
              <th className="py-2 px-2">Severity</th>
              <th className="py-2 px-2">Audit Log Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((entry) => {
                let badgeClass = 'bg-cyan-950 text-cyan-300 border-cyan-800';
                if (entry.severity === 'WARNING') badgeClass = 'bg-amber-950 text-amber-300 border-amber-800';
                if (entry.severity === 'ERROR' || entry.severity === 'CRITICAL') badgeClass = 'bg-rose-950 text-rose-300 border-rose-800';

                return (
                  <tr key={entry.id} className="border-b border-slate-900/80 hover:bg-slate-950/40">
                    <td className="py-2 px-2 text-slate-400 text-[11px] whitespace-nowrap">{entry.timestamp}</td>
                    <td className="py-2 px-2 text-cyan-400 font-bold text-[11px] whitespace-nowrap">{entry.stage}</td>
                    <td className="py-2 px-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${badgeClass}`}>
                        {entry.severity}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-300 text-[11px]">{entry.message}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                  No audit logs matching selected severity filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
