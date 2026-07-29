import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LogItem } from '../../types';
import { useAppStore } from '../../store/useAppStore';
import { LogsAGGrid } from '../../components/logs/LogsAGGrid';
import { ScrollText, ShieldCheck } from 'lucide-react';

export const LogsExplorerPage: React.FC = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const {
    logSearchQuery,
    setLogSearchQuery,
    logFilterCategory,
    setLogFilterCategory,
    logFilterSeverity,
    setLogFilterSeverity
  } = useAppStore();

  const fetchLogs = async () => {
    try {
      const data = await api.getLogs(logFilterCategory, logSearchQuery, logFilterSeverity);
      setLogs(data.logs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [logFilterCategory, logFilterSeverity]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <ScrollText className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Enterprise Logs Explorer (AG Grid Industrial Table)
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Multi-category audit trail for SCADA, Security, Quantum QKD, Communication & System events
            </p>
          </div>
        </div>
      </div>

      {/* AG Grid Component */}
      <LogsAGGrid
        logs={logs}
        searchQuery={logSearchQuery}
        categoryFilter={logFilterCategory}
        severityFilter={logFilterSeverity}
        onSearchChange={setLogSearchQuery}
        onCategoryChange={setLogFilterCategory}
        onSeverityChange={setLogFilterSeverity}
        onRefresh={fetchLogs}
      />
    </div>
  );
};
