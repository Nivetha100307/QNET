import React from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Scale } from "lucide-react";
import { useDashboardContext } from "../contexts/DashboardContext";

export const BellScoreChart: React.FC = () => {
  const { bellData } = useDashboardContext();

  const data = [
    { time: "0s", s: 1.0 },
    { time: "1s", s: 1.8 },
    { time: "2s", s: 2.3 },
    { time: "3s", s: 2.6 },
    { time: "4s", s: bellData.sValue },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-[#00f0ff]" />
          <h3 className="font-title font-bold text-sm text-[#f0f4fc]">Bell Score S Progression</h3>
        </div>
        <span className="text-[10px] text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded-full font-semibold">
          S = {bellData.sValue.toFixed(3)}
        </span>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="time" stroke="#5c6b75" fontSize={10} />
            <YAxis domain={[0, 3]} stroke="#5c6b75" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: "#0b0d17", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
            <ReferenceLine y={2.0} label={{ value: "Classical Limit (2.0)", fill: "#ff3b30", fontSize: 9 }} stroke="#ff3b30" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="s" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#bellGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
