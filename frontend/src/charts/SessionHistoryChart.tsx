import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Database } from "lucide-react";

export const SessionHistoryChart: React.FC = () => {
  const data = [
    { run: "Run #1", bell: 2.828, qber: 1.2 },
    { run: "Run #2", bell: 1.414, qber: 25.0 },
    { run: "Run #3", bell: 2.812, qber: 1.8 },
    { run: "Run #4", bell: 2.825, qber: 1.1 },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-[#00f0ff]" />
          <h3 className="font-title font-bold text-sm text-[#f0f4fc]">Session Performance Trends</h3>
        </div>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="run" stroke="#5c6b75" fontSize={10} />
            <YAxis stroke="#5c6b75" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: "#0b0d17", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
            <Area type="monotone" dataKey="bell" stroke="#00f0ff" fill="#00f0ff" fillOpacity={0.2} name="Bell S" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
