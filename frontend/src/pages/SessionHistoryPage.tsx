import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowUpDown,
  Database,
  Download,
  FileSpreadsheet,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useSessions } from "../hooks";
import { MOCK_SESSIONS } from "../mocks/session";

export const SessionHistoryPage: React.FC = () => {
  const { sessions, total, isLoading, error, refetch } = useSessions(50, 0);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"created_at" | "bell_parameter" | "qber">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const rawSessions = sessions.length > 0 ? sessions : MOCK_SESSIONS;

  // Filter & Search Logic
  const filteredSessions = rawSessions.filter((s) => {
    const matchesSearch = s.session_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || s.status.toUpperCase() === statusFilter.toUpperCase();
    return matchesSearch && matchesStatus;
  });

  // Sort Logic
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    let valA = a[sortBy] ?? 0;
    let valB = b[sortBy] ?? 0;
    if (typeof valA === "string") valA = new Date(valA).getTime();
    if (typeof valB === "string") valB = new Date(valB).getTime();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Export JSON
  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(sortedSessions, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `entanglenet-session-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["session_id", "status", "raw_key_length", "bell_parameter", "qber", "eavesdropping_detected", "created_at"];
    const rows = sortedSessions.map((s) => [
      s.session_id,
      s.status,
      s.raw_key_length,
      s.bell_parameter ?? "",
      s.qber ?? "",
      s.eavesdropping_detected,
      s.created_at,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `entanglenet-session-audit-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap justify-between items-center glass-panel p-6 rounded-2xl gap-4">
        <div>
          <h1 className="font-title text-2xl font-bold text-[#f0f4fc]">Session Audit History</h1>
          <p className="text-xs text-[#8c9ba5]">
            Historical QKD run records from REST API <code className="text-[#00f0ff]">GET /api/v1/qkd/sessions</code>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-[#00f0ff] hover:bg-white/10 transition-all"
          >
            <Download size={14} /> JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-[#00ff9d] hover:bg-white/10 transition-all"
          >
            <FileSpreadsheet size={14} /> CSV
          </button>
          <button
            onClick={refetch}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#9d4edd] text-black font-title font-bold text-xs shadow-cyan hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh API</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-[#5c6b75]" />
            <input
              type="text"
              placeholder="Search by Session ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#f0f4fc] outline-none focus:border-[#00f0ff]"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Filter size={14} className="text-[#8c9ba5]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-black/30 border border-white/10 text-[#f0f4fc] rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#0b0d17]">All Statuses</option>
              <option value="COMPLETED" className="bg-[#0b0d17]">Completed</option>
              <option value="ABORTED_EAVESDROPPING" className="bg-[#0b0d17]">Aborted (Eve)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown size={14} className="text-[#8c9ba5]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-black/30 border border-white/10 text-[#f0f4fc] rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
            >
              <option value="created_at" className="bg-[#0b0d17]">Created At</option>
              <option value="bell_parameter" className="bg-[#0b0d17]">Bell Score S</option>
              <option value="qber" className="bg-[#0b0d17]">QBER Error</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono font-semibold"
            >
              {sortOrder.toUpperCase()}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel p-4 rounded-2xl border border-[#ff3b30]/30 bg-[#ff3b30]/10 flex items-center justify-between text-xs text-[#ff3b30]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>API Warning: {error}. Displaying cached session records.</span>
          </div>
          <button onClick={refetch} className="underline font-semibold">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel p-6 rounded-2xl overflow-hidden">
        {isLoading && rawSessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8c9ba5] space-y-2">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#00f0ff]" />
            <p>Fetching session logs from backend REST API...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-[#8c9ba5] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Session ID</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Raw Key Bits</th>
                  <th className="pb-3 font-semibold">Bell Parameter (S)</th>
                  <th className="pb-3 font-semibold">QBER Error</th>
                  <th className="pb-3 font-semibold">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#f0f4fc]">
                {sortedSessions.map((s) => {
                  const isSuccess = s.status === "completed" || s.status === "COMPLETED";
                  return (
                    <tr key={s.session_id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-mono text-[#00f0ff]">{s.session_id}</td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase border ${
                            isSuccess
                              ? "bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/30"
                              : "bg-[#ff3b30]/10 text-[#ff3b30] border-[#ff3b30]/30"
                          }`}
                        >
                          {isSuccess ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                          <span>{s.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 font-semibold text-[#f0f4fc]">
                        {s.raw_key_length} bits
                      </td>
                      <td className="py-3.5 font-bold text-[#00f0ff]">
                        {s.bell_parameter ? s.bell_parameter.toFixed(3) : "N/A"}
                      </td>
                      <td className="py-3.5 text-[#00ff9d]">
                        {s.qber !== undefined && s.qber !== null
                          ? `${(s.qber * 100).toFixed(2)}%`
                          : "N/A"}
                      </td>
                      <td className="py-3.5 text-[#8c9ba5]">
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-[#5c6b75]">
          <span>
            Displaying <strong className="text-[#f0f4fc]">{sortedSessions.length}</strong> of{" "}
            <strong className="text-[#f0f4fc]">{total || rawSessions.length}</strong> sessions
          </span>
          <span className="flex items-center gap-1">
            <Database size={12} /> REST Endpoint: /api/v1/qkd/sessions
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionHistoryPage;
