import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '../../store/useAppStore';
import { Maximize2, Minimize2 } from 'lucide-react';

interface EChartWrapperProps {
  option: any;
  title?: string;
  subtitle?: string;
  height?: string | number;
  className?: string;
}

export const EChartWrapper: React.FC<EChartWrapperProps> = ({
  option,
  title,
  subtitle,
  height = '300px',
  className = ''
}) => {
  const { theme } = useAppStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Apply dark vs light styling defaults to EChart option
  const isDark = theme === 'dark';
  const themedOption = {
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily: 'Poppins, sans-serif',
      color: isDark ? '#94a3b8' : '#475569'
    },
    grid: {
      top: 40,
      left: 50,
      right: 20,
      bottom: 30,
      containLabel: true
    },
    tooltip: {
      backgroundColor: isDark ? '#0f172a' : '#ffffff',
      borderColor: isDark ? '#334155' : '#cbd5e1',
      textStyle: {
        color: isDark ? '#f8fafc' : '#0f172a',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12
      }
    },
    ...option
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-md transition-all relative ${
        isFullscreen ? 'fixed inset-4 z-50 bg-slate-950/95 border-teal-500/50 backdrop-blur-lg flex flex-col' : className
      }`}
    >
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
          <div>
            {title && (
              <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase flex items-center space-x-2">
                <span>{title}</span>
              </h3>
            )}
            {subtitle && (
              <p className="text-[11px] font-mono text-slate-500">{subtitle}</p>
            )}
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      <div className={isFullscreen ? 'flex-1 w-full h-full' : ''}>
        <ReactECharts
          option={themedOption}
          style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height, width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </div>
    </div>
  );
};
