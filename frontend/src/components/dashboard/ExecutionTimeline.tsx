import React from "react";
import { CheckCircle, Clock, Layers, Lock, Scale, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboardContext } from "../../contexts/DashboardContext";

export const ExecutionTimeline: React.FC = () => {
  const { activeStep } = useDashboardContext();

  const steps = [
    { id: 1, title: "Waiting", desc: "Session Initialized", icon: Clock },
    { id: 2, title: "Bell Pair Generation", desc: "|Φ+⟩ EPR Pairs Prepared", icon: Zap },
    { id: 3, title: "Basis Selection", desc: "Alice (0°,45°,90°) / Bob (45°,90°,135°)", icon: Layers },
    { id: 4, title: "Measurement", desc: "Ry(-θ) Rotations & Z-Basis Measurement", icon: Zap },
    { id: 5, title: "Bell Test", desc: "CHSH Parameter S = 2.828 > 2.0 Verified", icon: Scale },
    { id: 6, title: "Key Sifting", desc: "Matching Basis Bits Extracted (128 bits)", icon: CheckCircle },
    { id: 7, title: "AES Encryption", desc: "AES-256-GCM Shared Key Derived", icon: Lock },
    { id: 8, title: "Completed", desc: "Quantum Key Exchange Finalized", icon: CheckCircle },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="glass-panel p-5 rounded-2xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-title font-bold text-base text-[#f0f4fc]">
          Protocol Execution Timeline
        </h2>
        <span className="text-xs text-[#00f0ff] bg-[#00f0ff]/10 border border-[#00f0ff]/30 px-2.5 py-1 rounded-full font-semibold">
          Step {activeStep} / 8
        </span>
      </div>

      <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.id < activeStep || activeStep === 8;
          const isCurrent = step.id === activeStep && activeStep !== 8;
          return (
            <div key={step.title} className="relative flex items-start gap-3 text-xs">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                  isCurrent
                    ? "bg-[#00f0ff] text-black border-[#00f0ff] shadow-cyan animate-pulse"
                    : isCompleted
                    ? "bg-[#0b0d17] text-[#00ff9d] border-[#00ff9d]"
                    : "bg-[#0b0d17] text-[#5c6b75] border-white/10"
                }`}
              >
                <Icon size={12} />
              </div>

              <div>
                <div
                  className={`font-semibold ${
                    isCurrent
                      ? "text-[#00f0ff]"
                      : isCompleted
                      ? "text-[#f0f4fc]"
                      : "text-[#5c6b75]"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-[10px] text-[#5c6b75]">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
