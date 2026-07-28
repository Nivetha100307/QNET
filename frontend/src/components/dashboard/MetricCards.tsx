import React from "react";
import { Activity, Clock, Cpu, Key, Scale, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { MetricCardData } from "../../mocks/dashboard";

interface MetricCardsProps {
  metrics: MetricCardData[];
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const getIcon = (type: MetricCardData["type"]) => {
    switch (type) {
      case "bell":
        return { icon: Scale, color: "text-[#00f0ff]", border: "border-[#00f0ff]/30", bg: "bg-[#00f0ff]/10" };
      case "qber":
        return { icon: Activity, color: "text-[#00ff9d]", border: "border-[#00ff9d]/30", bg: "bg-[#00ff9d]/10" };
      case "time":
        return { icon: Clock, color: "text-[#ffb700]", border: "border-[#ffb700]/30", bg: "bg-[#ffb700]/10" };
      case "backend":
        return { icon: Cpu, color: "text-[#9d4edd]", border: "border-[#9d4edd]/30", bg: "bg-[#9d4edd]/10" };
      case "status":
        return { icon: ShieldCheck, color: "text-[#00ff9d]", border: "border-[#00ff9d]/30", bg: "bg-[#00ff9d]/10" };
      case "key":
        return { icon: Key, color: "text-[#ff007f]", border: "border-[#ff007f]/30", bg: "bg-[#ff007f]/10" };
      default:
        return { icon: Activity, color: "text-[#00f0ff]", border: "border-[#00f0ff]/30", bg: "bg-[#00f0ff]/10" };
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((card, idx) => {
        const style = getIcon(card.type);
        const Icon = style.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className="glass-panel glass-panel-hover p-4 rounded-2xl flex flex-col justify-between gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#8c9ba5] uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${style.bg} ${style.color} border ${style.border}`}>
                <Icon size={14} />
              </div>
            </div>

            <div>
              <div className={`font-title font-bold text-lg ${style.color}`}>
                {card.value}
              </div>
              <div className="text-[10px] text-[#5c6b75] mt-0.5">
                {card.subtitle}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
