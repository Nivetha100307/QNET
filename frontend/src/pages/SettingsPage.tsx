import React from "react";

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl">
        <h1 className="font-title text-2xl font-bold text-[#f0f4fc]">Hardware & System Settings</h1>
        <p className="text-xs text-[#8c9ba5]">IBM Quantum API credentials, simulator preferences, and shot counts.</p>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4 max-w-xl">
        <div>
          <label className="block text-xs font-semibold text-[#8c9ba5] uppercase mb-1">IBM Quantum API Token</label>
          <input
            type="password"
            placeholder="Paste IBM Quantum token..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#f0f4fc] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#8c9ba5] uppercase mb-1">Default Quantum Backend</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#f0f4fc] outline-none">
            <option value="aer">Qiskit AerSimulator (Local CPU)</option>
            <option value="ibm_brisbane">IBM Quantum Hardware (ibm_brisbane)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
