import React from 'react';
import { SCADALayerCard, SCADALayerInfo } from './SCADALayerCard';

interface SCADAPipelineProgressProps {
  layers: SCADALayerInfo[];
  currentActiveLayerIndex: number;
}

export const SCADAPipelineProgress: React.FC<SCADAPipelineProgressProps> = ({
  layers,
  currentActiveLayerIndex
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            15-Layer SCADA Security Pipeline Visualizer
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Active Layer: {currentActiveLayerIndex >= 0 ? `#${currentActiveLayerIndex + 1} / 15` : 'Idle Readiness'}
        </span>
      </div>

      {/* 15 Layer Cards Grid (5 columns x 3 rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {layers.map((lyr, idx) => (
          <SCADALayerCard
            key={lyr.number}
            layer={lyr}
            isCurrentActive={idx === currentActiveLayerIndex}
          />
        ))}
      </div>
    </div>
  );
};
