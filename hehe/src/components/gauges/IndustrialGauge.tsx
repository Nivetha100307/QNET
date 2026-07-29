import React from 'react';
import ReactECharts from 'echarts-for-react';

interface IndustrialGaugeProps {
  title: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  height?: string;
}

export const IndustrialGauge: React.FC<IndustrialGaugeProps> = ({
  title,
  value,
  min = 0,
  max = 100,
  unit = '',
  warningThreshold = 80,
  criticalThreshold = 95,
  height = '180px'
}) => {
  const option = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min,
        max,
        splitNumber: 5,
        itemStyle: {
          color: value >= criticalThreshold ? '#ef4444' : value >= warningThreshold ? '#f59e0b' : '#14b8a6',
          shadowColor: 'rgba(20, 184, 166, 0.3)',
          shadowBlur: 10
        },
        progress: {
          show: true,
          roundCap: true,
          width: 8
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 4,
          offsetCenter: [0, '5%'],
          itemStyle: {
            color: '#06b6d4'
          }
        },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 8,
            color: [
              [warningThreshold / max, '#1e293b'],
              [criticalThreshold / max, '#334155'],
              [1, '#475569']
            ]
          }
        },
        axisTick: {
          distance: -15,
          splitNumber: 5,
          lineStyle: {
            width: 1,
            color: '#64748b'
          }
        },
        splitLine: {
          distance: -20,
          length: 8,
          lineStyle: {
            width: 2,
            color: '#94a3b8'
          }
        },
        axisLabel: {
          distance: -12,
          color: '#64748b',
          fontSize: 9,
          fontFamily: 'JetBrains Mono, monospace'
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          width: '60%',
          lineHeight: 20,
          borderRadius: 8,
          offsetCenter: [0, '70%'],
          fontSize: 16,
          fontWeight: 'bolder',
          fontFamily: 'JetBrains Mono, monospace',
          formatter: `{value}${unit}`,
          color: value >= criticalThreshold ? '#ef4444' : value >= warningThreshold ? '#f59e0b' : '#14b8a6'
        },
        data: [
          {
            value: Number(value.toFixed(2))
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-col items-center justify-between shadow-md">
      <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-poppins">
        {title}
      </div>
      <div className="w-full flex justify-center -my-2">
        <ReactECharts option={option} style={{ height, width: '100%' }} notMerge={true} />
      </div>
    </div>
  );
};
