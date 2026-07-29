import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { LogItem } from '../../types';
import { exportLogsToCSV } from '../../utils/exportUtils';
import { Download, Search, RefreshCw } from 'lucide-react';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface LogsAGGridProps {
  logs: LogItem[];
  searchQuery: string;
  categoryFilter: string;
  severityFilter: string;
  onSearchChange: (q: string) => void;
  onCategoryChange: (c: string) => void;
  onSeverityChange: (s: string) => void;
  onRefresh?: () => void;
}

export const LogsAGGrid: React.FC<LogsAGGridProps> = ({
  logs,
  searchQuery,
  categoryFilter,
  severityFilter,
  onSearchChange,
  onCategoryChange,
  onSeverityChange,
  onRefresh
}) => {

  const categories = ['ALL', 'SCADA', 'SECURITY', 'QUANTUM', 'PACKET', 'TELEMETRY', 'AUDIT'];
  const severities = ['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchCat = categoryFilter === 'ALL' || log.category === categoryFilter;
      const matchSev = severityFilter === 'ALL' || log.severity === severityFilter;
      const matchSearch =
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSev && matchSearch;
    });
  }, [logs, categoryFilter, severityFilter, searchQuery]);

  const columnDefs: ColDef<LogItem>[] = useMemo(() => [
    {
      field: 'id',
      headerName: 'Log ID',
      width: 120,
      sortable: true,
      cellRenderer: (params: any) => (
        <span className="font-mono text-teal-400 font-semibold">{params.value}</span>
      )
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 130,
      sortable: true,
      cellRenderer: (params: any) => (
        <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
          {params.value}
        </span>
      )
    },
    {
      field: 'severity',
      headerName: 'Severity',
      width: 120,
      sortable: true,
      cellRenderer: (params: any) => {
        const val = params.value;
        const color =
          val === 'ERROR'
            ? 'bg-rose-950 text-rose-400 border-rose-800'
            : val === 'WARNING'
            ? 'bg-amber-950 text-amber-400 border-amber-800'
            : val === 'SUCCESS'
            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
            : 'bg-slate-800 text-slate-300 border-slate-700';
        return (
          <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${color}`}>
            {val}
          </span>
        );
      }
    },
    {
      field: 'timestamp',
      headerName: 'Time (UTC)',
      width: 180,
      sortable: true,
      valueFormatter: (params: any) => new Date(params.value * 1000).toISOString().replace('T', ' ').substring(0, 19)
    },
    {
      field: 'message',
      headerName: 'Event Message',
      flex: 1,
      minWidth: 250,
      sortable: true
    },
    {
      field: 'details',
      headerName: 'Technical Rationale / Details',
      flex: 1.5,
      minWidth: 300,
      sortable: true,
      cellRenderer: (params: any) => (
        <span className="font-mono text-slate-400 text-xs">{params.value}</span>
      )
    }
  ], []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
      {/* Control Filters & Export Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search logs by message, ID, device..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 font-mono transition-colors"
          />
        </div>

        {/* Category & Severity Selectors */}
        <div className="flex items-center space-x-2">
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl font-mono focus:outline-none focus:border-teal-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-xl font-mono focus:outline-none focus:border-teal-500"
          >
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                Severity: {sev}
              </option>
            ))}
          </select>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => exportLogsToCSV(filteredLogs)}
            className="flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* AG Grid Table Container */}
      <div className="ag-theme-alpine-dark w-full h-[450px] rounded-xl overflow-hidden border border-slate-800">
        <AgGridReact
          rowData={filteredLogs}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={15}
          rowSelection="single"
          animateRows={true}
        />
      </div>
    </div>
  );
};
