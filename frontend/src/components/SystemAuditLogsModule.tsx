import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Database,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Layers,
  Activity,
  ChevronDown,
  ChevronRight,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap
} from 'lucide-react';
import {
  fetchAuditLogs,
  fetchAuditStats,
  SystemAuditLogItem,
  SystemAuditStats,
  SessionResponse
} from '../services';

interface SystemAuditLogsModuleProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
}

const MODULE_OPTIONS = [
  { id: 'ALL', label: 'All System Modules' },
  { id: 'MODULE_1_SESSION', label: 'Module 1: Session Management' },
  { id: 'MODULE_2_QUANTUM', label: 'Module 2: Quantum Engine' },
  { id: 'MODULE_3_KEY', label: 'Module 3: Quantum Key Gen' },
  { id: 'MODULE_4_SECURITY', label: 'Module 4: Security CHSH' },
  { id: 'MODULE_5_SCADA', label: 'Module 5: SCADA Engine' },
  { id: 'MODULE_6_ZERO_TRUST', label: 'Module 6: Zero Trust SOC' },
  { id: 'MODULE_7_REPEATER', label: 'Module 7: Quantum Repeater' },
  { id: 'MODULE_8_CASCADE', label: 'Module 8: Cascade & AI' },
];

export const SystemAuditLogsModule: React.FC<SystemAuditLogsModuleProps> = ({
  session
}) => {
  const [logs, setLogs] = useState<SystemAuditLogItem[]>([]);
  const [stats, setStats] = useState<SystemAuditStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logData, statData] = await Promise.all([
        fetchAuditLogs({
          module_id: selectedModule === 'ALL' ? undefined : selectedModule,
          severity: selectedSeverity === 'ALL' ? undefined : selectedSeverity,
          search: searchQuery.trim() || undefined,
          limit: 100
        }),
        fetchAuditStats()
      ]);
      setLogs(logData);
      setStats(statData);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit vault logs from Supabase PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedModule, selectedSeverity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'SUCCESS':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                  Module 9: Centralized System Audit Vault
                  <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold flex items-center gap-1.5">
                    <Database className="w-3 h-3 text-emerald-400" /> PostgreSQL (Supabase Connected)
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Immutable forensic audit trail &amp; real-time event telemetry stream across Modules 1 through 8
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Querying Supabase...' : 'Refresh Audit Vault'}</span>
          </button>
        </div>
      </div>

      {/* Summary Statistics Ribbon */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
            <span className="text-slate-400 text-[10px] uppercase block">TOTAL AUDIT LOGS</span>
            <span className="text-cyan-400 font-extrabold text-xl">{stats.total_events}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
            <span className="text-slate-400 text-[10px] uppercase block">SUCCESS RATE</span>
            <span className="text-emerald-400 font-extrabold text-xl">{stats.success_rate_pct}%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
            <span className="text-slate-400 text-[10px] uppercase block">SUCCESS EVENTS</span>
            <span className="text-emerald-300 font-extrabold text-xl">{stats.success_events}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
            <span className="text-slate-400 text-[10px] uppercase block">WARNING ALERTS</span>
            <span className="text-amber-400 font-extrabold text-xl">{stats.warning_events}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-md">
            <span className="text-slate-400 text-[10px] uppercase block">CRITICAL THREATS</span>
            <span className="text-rose-400 font-extrabold text-xl">{stats.critical_events}</span>
          </div>
        </div>
      )}

      {/* Filters & Search Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Module Selector */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider shrink-0">
              Module:
            </span>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-slate-950 text-cyan-300 text-xs font-mono px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400"
            >
              {MODULE_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Badges */}
          <div className="flex items-center space-x-1.5 font-mono text-xs overflow-x-auto pb-1 lg:pb-0">
            <span className="text-slate-400 text-[11px] font-sans font-semibold mr-1">Severity:</span>
            {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'CRITICAL'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-3 py-1.5 rounded-lg border font-bold text-[11px] transition ${
                  selectedSeverity === sev
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search actions, nodes, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 text-xs font-mono pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-400 placeholder:text-slate-600"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Audit Log Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Supabase Audit Log Records ({logs.length} Entries Loaded)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-Time Query Limit: 100
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {logs.length === 0 && !loading && (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-2">
            <Database className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-semibold text-slate-300">No audit log records found for the current query filter.</p>
            <p className="text-[11px] text-slate-500">Execute actions in Modules 1–8 to auto-generate audit logs in Supabase PostgreSQL.</p>
          </div>
        )}

        <div className="space-y-3 font-mono text-xs">
          {logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const formattedTime = new Date(log.timestamp).toLocaleString();

            return (
              <div
                key={log.id}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  isExpanded
                    ? 'bg-slate-950 border-purple-500/50 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="p-1 rounded bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <span className={`px-2.5 py-0.5 rounded border text-[10px] font-bold ${getSeverityBadge(log.severity)}`}>
                      {log.severity}
                    </span>

                    <span className="px-2 py-0.5 rounded bg-slate-900 text-purple-300 border border-purple-500/30 text-[10px]">
                      {log.module_id}
                    </span>

                    <span className="font-bold text-slate-200 text-sm">
                      {log.action}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    {log.source_node && (
                      <span className="text-slate-300">
                        {log.source_node} ➔ {log.destination_node || 'N/A'}
                      </span>
                    )}
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formattedTime}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">OPERATOR ROLE</span>
                        <span className="text-cyan-300 font-bold">{log.operator_role}</span>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">SESSION UUID</span>
                        <span className="text-slate-300 font-bold">{log.session_uuid || 'N/A'}</span>
                      </div>

                      <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">LOG RECORD ID</span>
                        <span className="text-emerald-400 font-bold">#{log.id}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[10px] font-sans uppercase font-bold flex items-center gap-1.5">
                        <FileCode className="w-3.5 h-3.5 text-cyan-400" /> Event Details JSON Payload:
                      </span>
                      <pre className="text-emerald-300 text-[11px] font-mono overflow-x-auto p-2 bg-slate-950 rounded border border-slate-800/80 leading-relaxed">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
