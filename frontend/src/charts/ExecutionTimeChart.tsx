import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock } from "lucide-react";

export const ExecutionTimeChart: React.FC = () => {
  const data = [
    { stage: "EPR Gen", ms: 25 },
    { stage: "Basis Select", ms: 12 },
    { stage: "Measure", ms: 45 },
    { stage: "CHSH Test", ms: 30 },
    { stage: "Sifting", ms: 18 },
    { stage: "AES Derivation", ms: 12 },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-[#ffb700]" />
          <h3 className="font-title font-bold text-sm text-[#f0f4fc]">Circuit Stage Execution Latency (ms)</h3>
        </div>
        <span className="text-[10px] text-[#ffb700] bg-[#ffb700]/10 px-2 py-0.5 rounded-full font-semibold">
          Total: 142 ms
        </span>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="stage" stroke="#5c6b75" fontSize={9} />
            <YAxis stroke="#5c6b75" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: "#0b0d17", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
            <Bar dataKey="ms" fill="#ffb700" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
