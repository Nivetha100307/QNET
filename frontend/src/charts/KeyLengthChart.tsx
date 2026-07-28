import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Key } from "lucide-react";

export const KeyLengthChart: React.FC = () => {
  const data = [
    { name: "Session 1", raw: 512, sifted: 128 },
    { name: "Session 2", raw: 512, sifted: 128 },
    { name: "Session 3", raw: 1024, sifted: 256 },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-[#ff007f]" />
          <h3 className="font-title font-bold text-sm text-[#f0f4fc]">Raw vs Sifted Key Extraction Ratio</h3>
        </div>
        <span className="text-[10px] text-[#ff007f] bg-[#ff007f]/10 px-2 py-0.5 rounded-full font-semibold">
          25.0% Yield
        </span>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="#5c6b75" fontSize={10} />
            <YAxis stroke="#5c6b75" fontSize={10} />
            <Tooltip contentStyle={{ backgroundColor: "#0b0d17", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} />
            <Legend wrapperStyle={{ fontSize: "10px" }} />
            <Bar dataKey="raw" fill="#9d4edd" name="Raw Photons" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sifted" fill="#ff007f" name="Sifted Bits" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
