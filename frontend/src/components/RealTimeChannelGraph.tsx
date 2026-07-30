import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Radio, Zap, Shield, RefreshCw } from 'lucide-react';

interface TelemetryPoint {
  time: string;
  timestamp: number;
  quantumLatency: number;
  photonLoss: number;
  bytesThroughput: number;
}

interface RealTimeChannelGraphProps {
  activeSessionId?: string;
  quantumLatency?: number;
  photonLoss?: number;
  bytesTransferred?: number;
}

export const RealTimeChannelGraph: React.FC<RealTimeChannelGraphProps> = ({
  activeSessionId,
  quantumLatency = 6.5,
  photonLoss = 15.2,
  bytesTransferred = 0
}) => {
  const [dataPoints, setDataPoints] = useState<TelemetryPoint[]>([]);
  const [visibleSeries, setVisibleSeries] = useState<{
    quantumLatency: boolean;
    photonLoss: boolean;
    bytesThroughput: boolean;
  }>({
    quantumLatency: true,
    photonLoss: true,
    bytesThroughput: true
  });

  // Seed initial rolling 30 data points
  useEffect(() => {
    const now = Date.now();
    const initialPoints: TelemetryPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const t = now - i * 1000;
      const timeStr = new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      initialPoints.push({
        time: timeStr,
        timestamp: t,
        quantumLatency: parseFloat((6.2 + Math.sin(i * 0.4) * 1.5 + (Math.random() - 0.5) * 0.6).toFixed(2)),
        photonLoss: parseFloat((14.8 + Math.cos(i * 0.3) * 3.2 + (Math.random() - 0.5) * 0.8).toFixed(2)),
        bytesThroughput: Math.floor(120 + Math.sin(i * 0.5) * 60 + Math.random() * 20)
      });
    }
    setDataPoints(initialPoints);
  }, []);

  // Update real-time stream every second
  useEffect(() => {
    const timer = setInterval(() => {
      const t = Date.now();
      const timeStr = new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const newLat = parseFloat((quantumLatency + (Math.random() - 0.5) * 0.8).toFixed(2));
      const newLoss = parseFloat((photonLoss + (Math.random() - 0.5) * 1.2).toFixed(2));
      const newBps = Math.floor(140 + Math.sin(t / 1500) * 70 + Math.random() * 30);

      setDataPoints((prev) => {
        const updated = [...prev.slice(1), {
          time: timeStr,
          timestamp: t,
          quantumLatency: Math.max(1, newLat),
          photonLoss: Math.max(0, Math.min(100, newLoss)),
          bytesThroughput: newBps
        }];
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quantumLatency, photonLoss]);

  // Dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Max scale calculations
  const maxLat = 15;
  const maxLoss = 40;
  const maxBps = 300;

  // Calculate coordinates
  const getCoordinates = (value: number, maxVal: number, index: number, total: number) => {
    const x = padding.left + (index / (total - 1)) * graphWidth;
    const clampedVal = Math.min(maxVal, Math.max(0, value));
    const y = padding.top + graphHeight - (clampedVal / maxVal) * graphHeight;
    return { x, y };
  };

  // Generate smooth cubic bezier SVG path string
  const generatePath = (key: keyof Omit<TelemetryPoint, 'time' | 'timestamp'>, maxVal: number) => {
    if (dataPoints.length === 0) return '';
    const points = dataPoints.map((pt, i) => getCoordinates(pt[key] as number, maxVal, i, dataPoints.length));
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const cpX = (current.x + next.x) / 2;
      path += ` C ${cpX} ${current.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    return path;
  };

  // Generate smooth area path string
  const generateAreaPath = (key: keyof Omit<TelemetryPoint, 'time' | 'timestamp'>, maxVal: number) => {
    const linePath = generatePath(key, maxVal);
    if (!linePath) return '';
    const lastX = padding.left + graphWidth;
    const firstX = padding.left;
    const bottomY = padding.top + graphHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const latestPoint = dataPoints[dataPoints.length - 1] || {
    quantumLatency: 6.5,
    photonLoss: 15.2,
    bytesThroughput: 140
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              Real-Time Quantum Channel Telemetry Stream
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LIVE 1000ms
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Streaming quantum latency, photon attenuation loss, &amp; data throughput
            </p>
          </div>
        </div>

        {/* Series Toggles */}
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <button
            onClick={() => setVisibleSeries((p) => ({ ...p, quantumLatency: !p.quantumLatency }))}
            className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1.5 ${
              visibleSeries.quantumLatency
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            Latency ({latestPoint.quantumLatency} ms)
          </button>

          <button
            onClick={() => setVisibleSeries((p) => ({ ...p, photonLoss: !p.photonLoss }))}
            className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1.5 ${
              visibleSeries.photonLoss
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Loss ({latestPoint.photonLoss}%)
          </button>

          <button
            onClick={() => setVisibleSeries((p) => ({ ...p, bytesThroughput: !p.bytesThroughput }))}
            className={`px-2.5 py-1 rounded-lg border font-bold transition flex items-center gap-1.5 ${
              visibleSeries.bytesThroughput
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Throughput ({latestPoint.bytesThroughput} B/s)
          </button>
        </div>
      </div>

      {/* SVG Real-Time Multi-Series Graph */}
      <div className="relative w-full overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[260px] overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + graphHeight * (1 - pct);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + graphWidth}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {Math.round(pct * maxLat)} ms
                </text>
              </g>
            );
          })}

          {/* Series Areas & Lines */}

          {/* 1. Quantum Latency Series */}
          {visibleSeries.quantumLatency && (
            <>
              <path
                d={generateAreaPath('quantumLatency', maxLat)}
                fill="url(#cyanGradient)"
              />
              <path
                d={generatePath('quantumLatency', maxLat)}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* 2. Photon Loss Series */}
          {visibleSeries.photonLoss && (
            <>
              <path
                d={generateAreaPath('photonLoss', maxLoss)}
                fill="url(#amberGradient)"
              />
              <path
                d={generatePath('photonLoss', maxLoss)}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="6 3"
                strokeLinecap="round"
              />
            </>
          )}

          {/* 3. Throughput Series */}
          {visibleSeries.bytesThroughput && (
            <>
              <path
                d={generateAreaPath('bytesThroughput', maxBps)}
                fill="url(#emeraldGradient)"
              />
              <path
                d={generatePath('bytesThroughput', maxBps)}
                fill="none"
                stroke="#34d399"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </>
          )}

          {/* Live Data Point Pulse Dots */}
          {dataPoints.length > 0 && (
            <>
              {visibleSeries.quantumLatency && (
                <circle
                  cx={getCoordinates(latestPoint.quantumLatency, maxLat, dataPoints.length - 1, dataPoints.length).x}
                  cy={getCoordinates(latestPoint.quantumLatency, maxLat, dataPoints.length - 1, dataPoints.length).y}
                  r="4"
                  fill="#22d3ee"
                  className="animate-pulse"
                />
              )}

              {visibleSeries.photonLoss && (
                <circle
                  cx={getCoordinates(latestPoint.photonLoss, maxLoss, dataPoints.length - 1, dataPoints.length).x}
                  cy={getCoordinates(latestPoint.photonLoss, maxLoss, dataPoints.length - 1, dataPoints.length).y}
                  r="4"
                  fill="#fbbf24"
                  className="animate-pulse"
                />
              )}

              {visibleSeries.bytesThroughput && (
                <circle
                  cx={getCoordinates(latestPoint.bytesThroughput, maxBps, dataPoints.length - 1, dataPoints.length).x}
                  cy={getCoordinates(latestPoint.bytesThroughput, maxBps, dataPoints.length - 1, dataPoints.length).y}
                  r="4"
                  fill="#34d399"
                  className="animate-pulse"
                />
              )}
            </>
          )}

          {/* X Axis Time Labels */}
          {dataPoints.length > 0 && (
            <>
              <text
                x={padding.left}
                y={svgHeight - 10}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
              >
                -30s ago ({dataPoints[0]?.time})
              </text>

              <text
                x={padding.left + graphWidth / 2}
                y={svgHeight - 10}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                -15s ago
              </text>

              <text
                x={padding.left + graphWidth}
                y={svgHeight - 10}
                fill="#38bdf8"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="end"
              >
                NOW ({latestPoint.time})
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
};
