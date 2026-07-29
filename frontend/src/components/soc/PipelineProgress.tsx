import React from 'react';
import { StageCard, StageInfo } from './StageCard';

interface PipelineProgressProps {
  stages: StageInfo[];
  currentActiveStageIndex: number;
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  stages,
  currentActiveStageIndex
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            20-Stage Zero-Trust Verification Pipeline Visualizer
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Active Stage: {currentActiveStageIndex >= 0 ? `#${currentActiveStageIndex + 1} / 20` : 'Idle'}
        </span>
      </div>

      {/* 20 Stage Cards Responsive Grid (4 columns x 5 rows) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {stages.map((stg, idx) => (
          <StageCard
            key={stg.number}
            stage={stg}
            isCurrentActive={idx === currentActiveStageIndex}
          />
        ))}
      </div>
    </div>
  );
};
