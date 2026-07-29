import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ReportItem } from '../../types';
import { downloadReportSummary } from '../../utils/exportUtils';
import { FileSpreadsheet, Download, CheckCircle2, RefreshCw } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);

  const fetchReports = async () => {
    try {
      const res = await api.getReports();
      setReports(res.reports);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
            <FileSpreadsheet className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              System Audit Reports & Compliance Exporter
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Automated report generation for Zero-Trust Security, Grid Performance, and QKD Bell Parameters
            </p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2.5 px-3">Report ID</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Generated At</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 text-teal-400 font-bold">{rep.id}</td>
                  <td className="py-3 px-3 text-slate-200 font-sans">{rep.title}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                      {rep.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(rep.generated_at * 1000).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => downloadReportSummary(rep)}
                      className="inline-flex items-center space-x-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs px-3 py-1 rounded-lg transition-colors font-sans"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
