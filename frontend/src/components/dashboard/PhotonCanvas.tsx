import React, { useEffect, useRef } from "react";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

interface PhotonCanvasProps {
  isEveActive?: boolean;
}

export const PhotonCanvas: React.FC<PhotonCanvasProps> = ({ isEveActive = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let pos = 0;

    const render = () => {
      pos += 0.012;
      if (pos > 1) pos = 0;

      const w = canvas.width;
      const h = canvas.height;
      const yMid = h / 2;

      const xAlice = 70;
      const xEPR = w / 2;
      const xBob = w - 70;
      const xEve = xEPR;
      const yEve = yMid - 45;

      ctx.clearRect(0, 0, w, h);

      // Fiber Optic Cable
      ctx.strokeStyle = "rgba(0, 240, 255, 0.2)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(xAlice, yMid);
      ctx.lineTo(xBob, yMid);
      ctx.stroke();

      // EPR Source Node (Center)
      ctx.fillStyle = "#9d4edd";
      ctx.shadowColor = "#9d4edd";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(xEPR, yMid, 12, 0, Math.PI * 2);
      ctx.fill();

      // Alice Detector Node (Left)
      ctx.fillStyle = "#00f0ff";
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(xAlice, yMid, 14, 0, Math.PI * 2);
      ctx.fill();

      // Bob Detector Node (Right)
      ctx.fillStyle = "#ff007f";
      ctx.shadowColor = "#ff007f";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(xBob, yMid, 14, 0, Math.PI * 2);
      ctx.fill();

      // Eve Intercept Node if active
      if (isEveActive) {
        ctx.strokeStyle = "rgba(255, 59, 48, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(xEve, yEve);
        ctx.lineTo(xEPR - (xEPR - xAlice) * pos, yMid);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#ff3b30";
        ctx.shadowColor = "#ff3b30";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(xEve, yEve, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // Moving Twin Photons
      const curAliceX = xEPR - (xEPR - xAlice) * pos;
      const curBobX = xEPR + (xBob - xEPR) * pos;

      const pColor = isEveActive ? "#ff3b30" : "#00f0ff";

      // Photon 1 (Alice direction)
      ctx.fillStyle = pColor;
      ctx.shadowColor = pColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(curAliceX, yMid, 6, 0, Math.PI * 2);
      ctx.fill();

      // Photon 2 (Bob direction)
      ctx.beginPath();
      ctx.arc(curBobX, yMid, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isEveActive]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-panel p-5 rounded-2xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-[#00f0ff]" />
          <h2 className="font-title font-bold text-base text-[#f0f4fc]">
            Optical Channel Photon Trajectory
          </h2>
        </div>
        <span className="text-xs text-[#8c9ba5] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
          Bell State |Φ+⟩ = 1/√2(|00⟩ + |11⟩)
        </span>
      </div>

      <div className="relative bg-black/40 rounded-xl overflow-hidden border border-white/5 p-2">
        <canvas ref={canvasRef} width={600} height={160} className="w-full h-40 block" />
        <div className="flex justify-between items-center px-4 py-2 text-xs">
          <div className="text-[#00f0ff] font-semibold">Alice Node (0.0°)</div>
          <div className="text-[#9d4edd] font-semibold">EPR Source</div>
          {isEveActive && <div className="text-[#ff3b30] font-semibold">Eve Node</div>}
          <div className="text-[#ff007f] font-semibold">Bob Node (45.0°)</div>
        </div>
      </div>
    </motion.div>
  );
};
