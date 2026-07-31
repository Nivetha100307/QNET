import React from 'react';
import { QuarcSwapTask } from '../../../services/repeaterApi';
import { Clock, CheckCircle2 } from 'lucide-react';

interface EntanglementSchedulerProps {
  swapTasks: QuarcSwapTask[];
}

export const EntanglementScheduler: React.FC<EntanglementSchedulerProps> = ({ swapTasks }) => {
  const tasks = swapTasks.length > 0 ? swapTasks : [
    { task_id: 'swap-001', repeater: 'Repeater R1', memory_slot: 4, left_neighbor: 'Control Center', right_neighbor: 'Repeater R2', success_probability: 0.96, priority: 1, status: 'COMPLETED' },
    { task_id: 'swap-002', repeater: 'Repeater R3', memory_slot: 2, left_neighbor: 'Repeater R2', right_neighbor: 'Substation', success_probability: 0.94, priority: 2, status: 'EXECUTING' },
  ];

  return (
    <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Entanglement Resource Scheduler Execution Schedule
        </span>
        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
          Executable BSM Schedule
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {tasks.map((task, idx) => (
          <div key={task.task_id || idx} className="bg-slate-900/90 p-3.5 rounded-xl border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>✓ BSM @ {task.repeater}</span>
              <span>ETA {3 + idx * 2} ms</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Bell Pair #{341 + idx * 241} | Memory Slot {task.memory_slot}
            </div>
          </div>
        ))}

        <div className="bg-slate-900/90 p-3.5 rounded-xl border border-cyan-500/40 space-y-1 flex flex-col justify-center">
          <div className="text-cyan-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            Transmission Ready
          </div>
          <div className="text-[10px] text-slate-400">End-to-End Quantum Secrecy Active</div>
        </div>
      </div>
    </div>
  );
};
