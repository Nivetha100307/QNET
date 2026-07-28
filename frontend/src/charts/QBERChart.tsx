import React from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity } from "lucide-react";
import { useDashboardContext } from "../contexts/DashboardContext";

export const QBERChart: React.FC = () => {
  const { qberData } = useDashboardContext();

  const data = [
    { sample: "t-4", qber: 0.8 },
    { sample: "t-3", qber: 1.1 },
    { sample: "t-2", qber: 0.9 },
    { sample: "t-1", qber: 1.4 },
    { sample: "current", qber: qberData.errorRate * 100 },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-[#00ff9d]" />
          <h3 className="font-title font-bold text-sm text-[#f0f4fc]">QBER Noise Spectrum</h3>
        </div>
        <span className="text-[10px] text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded-full font-semibold">
          {(qberData.errorRate * 100).toFixed(2)}%
        </span>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="sample" stroke="#5c6b75" fontSize={10} />
            <YAxis domain={[0, 15]} stroke="#5c6b75" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: "#0b0d17", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
            <ReferenceLine y={11.0} label={{ value: "Max Safe (11%)", fill: "#ffb700", fontSize: 9 }} stroke="#ffb700" strokeDasharray="3 3" />
            <Line type="monotone" dataKey="qber" stroke="#00ff9d" strokeWidth={2.5} dot={{ r: 3, fill: "#00ff9d" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
