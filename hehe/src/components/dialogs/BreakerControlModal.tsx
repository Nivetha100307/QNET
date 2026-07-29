import React, { useState } from 'react';
import { api } from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { ZeroTrustDecision } from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock
} from 'lucide-react';

interface BreakerControlModalProps {
  onClose: () => void;
}

export const BreakerControlModal: React.FC<BreakerControlModalProps> = ({ onClose }) => {
  const {
    selectedDevice,
    setSelectedDevice,
    selectedRole,
    setSelectedRole,
    selectedCommand,
    setSelectedCommand,
    toggleBreakerState,
    addSecurityAlert,
    setLastDecision
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const [decisionResult, setDecisionResult] = useState<ZeroTrustDecision | null>(null);

  const devices = ['BRK_12', 'RELAY_04', 'TRANS_TAP_01', 'GEN_MAIN_01'];
  const roles = ['CONTROL_OPERATOR', 'GRID_ADMIN', 'SUBSTATION_ENGINEER', 'FIELD_ENGINEER', 'VIEWER'];
  const commands = ['OPEN_BREAKER', 'CLOSE_BREAKER', 'TRIP_RELAY', 'SET_TRANSFORMER_TAP', 'EMERGENCY_SHUTDOWN'];

  const handleExecute = async () => {
    setLoading(true);
    setDecisionResult(null);

    try {
      const decision = await api.verifyZeroTrust({
        entity_id: selectedDevice,
        role: selectedRole,
        command: selectedCommand,
        substation_id: 'SUB_NORTH'
      });

      setDecisionResult(decision);
      setLastDecision(decision);

      if (decision.decision === 'ALLOW') {
        toggleBreakerState(selectedDevice);
        addSecurityAlert({
          type: 'COMMAND_EXECUTED',
          description: `Zero-Trust Verified: ${selectedCommand} executed on ${selectedDevice} by ${selectedRole}`,
          severity: 'LOW'
        });
      } else {
        addSecurityAlert({
          type: 'COMMAND_BLOCKED',
          description: `Security Decision Engine Blocked ${selectedCommand} on ${selectedDevice} (Role: ${selectedRole})`,
          severity: 'HIGH'
        });
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-800/80 text-teal-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                SCADA Command Execution Console
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Submits request to 20-Stage Zero-Trust Decision Engine over E91 QKD session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1.5 font-sans font-medium">Target Device:</label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {devices.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-sans font-medium">Operator Role:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-sans font-medium">SCADA Command:</label>
            <select
              value={selectedCommand}
              onChange={(e) => setSelectedCommand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:border-teal-500 focus:outline-none"
            >
              {commands.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Execution Button */}
        <button
          onClick={handleExecute}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying 20-Stage Zero-Trust Pipeline...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Submit & Execute SCADA Command</span>
            </>
          )}
        </button>

        {/* Decision Output Result */}
        {decisionResult && (
          <div
            className={`p-4 rounded-xl border space-y-3 font-mono text-xs animate-in fade-in duration-200 ${
              decisionResult.decision === 'ALLOW'
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800/80 text-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {decisionResult.decision === 'ALLOW' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                )}
                <span className="text-sm font-bold tracking-wider">
                  DECISION: {decisionResult.decision}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                Risk: {decisionResult.overall_risk}
              </span>
            </div>

            <p className="text-slate-300 font-sans text-xs">{decisionResult.rationale}</p>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
              <span>Checks Passed: {decisionResult.checks_passed} / 20</span>
              <span>Device Trust: {decisionResult.trust_score} / 100</span>
              <span>Packet ID: {decisionResult.packet_id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
