import React, { useEffect, useRef, useState } from 'react';
import { QuarcCluster } from '../../../services/repeaterApi';
import { Radio, Activity, Cpu, Thermometer, Trophy, Zap, Layers, ArrowRight } from 'lucide-react';

interface QuarcNetworkTopologyCanvasProps {
  clusters: QuarcCluster[];
  activeDestination: string;
  selectedClusterId?: string;
  onSelectCluster: (cluster: QuarcCluster) => void;
  currentStageIdx: number;
}

// In-Memory Scene Graph Interfaces
interface NodeEntity {
  id: string;
  label: string;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  clusterId: string;
  fidelity: number;
  memorySlots: string;
}

interface FiberEntity {
  fromNode: NodeEntity;
  toNode: NodeEntity;
  fidelity: number;
  isWinner: boolean;
  color: string;
}

interface PhotonEntity {
  x: number;
  y: number;
  targetNodeIdx: number;
  speed: number;
  color: string;
  trail: { x: number; y: number }[];
  chain: NodeEntity[];
}

export const QuarcNetworkTopologyCanvas: React.FC<QuarcNetworkTopologyCanvasProps> = ({
  clusters,
  activeDestination,
  selectedClusterId,
  onSelectCluster,
  currentStageIdx
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tooltip State for Layer 7 Glassmorphism Overlay
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    fidelity: number;
    qber: number;
    loss: string;
    genRate: string;
    memoryMs: number;
  } | null>(null);

  const isEvaluatingPhase = currentStageIdx >= 2 && currentStageIdx <= 4;
  const isWinnerLockedIn = currentStageIdx >= 5;

  // 3 Candidate Routes with Scores, Hops & Badges
  const candidateRoutes = [
    {
      id: 0,
      name: 'Primary Path (Winner)',
      clusterPath: 'Cluster A ➔ Cluster B ➔ Cluster C',
      localPath: `Control Center ➔ R1 ➔ R2 ➔ R4 ➔ R5 ➔ R6 ➔ R8 ➔ ${activeDestination.replace('_', ' ')}`,
      score: 96.4,
      hops: 4,
      avgFidelity: 98.8,
      status: 'WINNER LOCKED IN 🏆',
      winner: true,
      colorClass: 'border-cyan-500 bg-cyan-950/60 ring-2 ring-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.3)] text-cyan-300'
    },
    {
      id: 1,
      name: 'Alternative Path (Standby)',
      clusterPath: 'Cluster A ➔ Cluster D ➔ Cluster C',
      localPath: `Control Center ➔ R1 ➔ R2 ➔ R12 ➔ R13 ➔ R6 ➔ R8 ➔ ${activeDestination.replace('_', ' ')}`,
      score: 91.2,
      hops: 5,
      avgFidelity: 95.2,
      status: 'STANDBY (REJECTED)',
      winner: false,
      colorClass: 'border-amber-500/50 bg-amber-950/30 text-amber-300 opacity-80'
    },
    {
      id: 2,
      name: 'Emergency Path (Backup)',
      clusterPath: 'Cluster A ➔ Cluster F ➔ Cluster C',
      localPath: `Control Center ➔ R1 ➔ Substation D ➔ ${activeDestination.replace('_', ' ')}`,
      score: 87.5,
      hops: 6,
      avgFidelity: 93.1,
      status: 'BACKUP (REJECTED)',
      winner: false,
      colorClass: 'border-purple-500/50 bg-purple-950/30 text-purple-300 opacity-70'
    }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // High-DPI Canvas Resizing
    const width = canvas.parentElement?.clientWidth || 900;
    const height = 460;
    canvas.width = width;
    canvas.height = height;

    // Scene Graph Node Entities (Positioned with 5-Column Spacing)
    const nodes: NodeEntity[] = [
      { id: 'CC', label: 'CC', baseX: width * 0.08, baseY: height * 0.5, x: width * 0.08, y: height * 0.5, clusterId: 'CC', fidelity: 99.8, memorySlots: '10/10' },
      { id: 'R1', label: 'R1', baseX: width * 0.22, baseY: height * 0.44, x: width * 0.22, y: height * 0.44, clusterId: 'Cluster-A', fidelity: 98.8, memorySlots: '8/10' },
      { id: 'R2', label: 'R2', baseX: width * 0.32, baseY: height * 0.56, x: width * 0.32, y: height * 0.56, clusterId: 'Cluster-A', fidelity: 98.8, memorySlots: '10/10' },
      { id: 'R4', label: 'R4', baseX: width * 0.45, baseY: height * 0.22, x: width * 0.45, y: height * 0.22, clusterId: 'Cluster-B', fidelity: 99.1, memorySlots: '7/10' },
      { id: 'R5', label: 'R5', baseX: width * 0.54, baseY: height * 0.22, x: width * 0.54, y: height * 0.22, clusterId: 'Cluster-B', fidelity: 98.5, memorySlots: '9/10' },
      { id: 'R7', label: 'R7', baseX: width * 0.62, baseY: height * 0.22, x: width * 0.62, y: height * 0.22, clusterId: 'Cluster-B', fidelity: 98.2, memorySlots: '8/10' },
      { id: 'R12', label: 'R12', baseX: width * 0.46, baseY: height * 0.78, x: width * 0.46, y: height * 0.78, clusterId: 'Cluster-D', fidelity: 95.2, memorySlots: '5/10' },
      { id: 'R13', label: 'R13', baseX: width * 0.58, baseY: height * 0.78, x: width * 0.58, y: height * 0.78, clusterId: 'Cluster-D', fidelity: 94.8, memorySlots: '6/10' },
      { id: 'R6', label: 'R6', baseX: width * 0.74, baseY: height * 0.44, x: width * 0.74, y: height * 0.44, clusterId: 'Cluster-C', fidelity: 99.8, memorySlots: '9/10' },
      { id: 'R8', label: 'R8', baseX: width * 0.82, baseY: height * 0.56, x: width * 0.82, y: height * 0.56, clusterId: 'Cluster-C', fidelity: 96.7, memorySlots: '8/10' },
      { id: 'SUB', label: activeDestination.replace('Substation_', 'Sub '), baseX: width * 0.93, baseY: height * 0.5, x: width * 0.93, y: height * 0.5, clusterId: 'SUB', fidelity: 100.0, memorySlots: '12/12' },
    ];

    // Node Lookup Map
    const nodeMap = new Map<string, NodeEntity>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    // Fiber Links
    const fibers: FiberEntity[] = [
      { fromNode: nodeMap.get('CC')!, toNode: nodeMap.get('R1')!, fidelity: 99.8, isWinner: true, color: '#06b6d4' },
      { fromNode: nodeMap.get('R1')!, toNode: nodeMap.get('R2')!, fidelity: 98.8, isWinner: true, color: '#3b82f6' },
      { fromNode: nodeMap.get('R2')!, toNode: nodeMap.get('R4')!, fidelity: 99.1, isWinner: true, color: '#a855f7' },
      { fromNode: nodeMap.get('R2')!, toNode: nodeMap.get('R12')!, fidelity: 95.2, isWinner: false, color: '#f59e0b' },
      { fromNode: nodeMap.get('R4')!, toNode: nodeMap.get('R5')!, fidelity: 99.1, isWinner: true, color: '#a855f7' },
      { fromNode: nodeMap.get('R5')!, toNode: nodeMap.get('R7')!, fidelity: 98.5, isWinner: true, color: '#a855f7' },
      { fromNode: nodeMap.get('R12')!, toNode: nodeMap.get('R13')!, fidelity: 94.8, isWinner: false, color: '#f59e0b' },
      { fromNode: nodeMap.get('R5')!, toNode: nodeMap.get('R6')!, fidelity: 99.8, isWinner: true, color: '#22c55e' },
      { fromNode: nodeMap.get('R13')!, toNode: nodeMap.get('R6')!, fidelity: 95.2, isWinner: false, color: '#f59e0b' },
      { fromNode: nodeMap.get('R6')!, toNode: nodeMap.get('R8')!, fidelity: 96.7, isWinner: true, color: '#22c55e' },
      { fromNode: nodeMap.get('R8')!, toNode: nodeMap.get('SUB')!, fidelity: 100.0, isWinner: true, color: '#22c55e' },
    ];

    // Candidate Path Node Chains
    const path1Winner = [nodeMap.get('CC')!, nodeMap.get('R1')!, nodeMap.get('R2')!, nodeMap.get('R4')!, nodeMap.get('R5')!, nodeMap.get('R6')!, nodeMap.get('R8')!, nodeMap.get('SUB')!];
    const path2Alternative = [nodeMap.get('CC')!, nodeMap.get('R1')!, nodeMap.get('R2')!, nodeMap.get('R12')!, nodeMap.get('R13')!, nodeMap.get('R6')!, nodeMap.get('R8')!, nodeMap.get('SUB')!];

    // Photon Probes Entity Arrays
    const probeWinner: PhotonEntity = { x: path1Winner[0].x, y: path1Winner[0].y, targetNodeIdx: 1, speed: 4.5, color: '#22d3ee', trail: [], chain: path1Winner };
    const probeAlternative: PhotonEntity = { x: path2Alternative[0].x, y: path2Alternative[0].y, targetNodeIdx: 1, speed: 4.5, color: '#f59e0b', trail: [], chain: path2Alternative };

    // 60 FPS Engine Loop
    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, width, height);

      // 1. UPDATE FORCE LAYOUT PHYSICS
      nodes.forEach((n, i) => {
        if (n.id !== 'CC' && n.id !== 'SUB') {
          n.x = n.baseX + Math.sin(time * 1.4 + i) * 3;
          n.y = n.baseY + Math.cos(time * 1.1 + i) * 3;
        }
      });

      // 2. AMBIENT GRID
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. ORGANIC CONVEX CLUSTER HULLS
      const drawClusterHull = (clusterId: string, label: string, color: string, fillStyle: string, strokeStyle: string, clusterNodes: NodeEntity[]) => {
        if (clusterNodes.length === 0) return;
        const minX = Math.min(...clusterNodes.map(n => n.x)) - 32;
        const maxX = Math.max(...clusterNodes.map(n => n.x)) + 32;
        const minY = Math.min(...clusterNodes.map(n => n.y)) - 28;
        const maxY = Math.max(...clusterNodes.map(n => n.y)) + 28;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(minX, minY, maxX - minX, maxY - minY, 24);
        ctx.fillStyle = fillStyle;
        ctx.fill();
        ctx.lineWidth = selectedClusterId === clusterId ? 3 : 2;
        ctx.strokeStyle = strokeStyle;
        ctx.shadowColor = color;
        ctx.shadowBlur = selectedClusterId === clusterId ? 25 : 12;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = color;
        ctx.font = 'bold 11px monospace';
        ctx.fillText(label, minX + 14, minY - 8);
        ctx.restore();
      };

      const clusterA = nodes.filter(n => n.clusterId === 'Cluster-A');
      const clusterB = nodes.filter(n => n.clusterId === 'Cluster-B');
      const clusterD = nodes.filter(n => n.clusterId === 'Cluster-D');
      const clusterC = nodes.filter(n => n.clusterId === 'Cluster-C');

      drawClusterHull('Cluster-A', 'Cluster A (Core Hub)', '#3b82f6', 'rgba(30, 58, 138, 0.25)', 'rgba(59, 130, 246, 0.7)', clusterA);
      drawClusterHull('Cluster-B', 'Cluster B (Swapping Mesh)', '#a855f7', 'rgba(88, 28, 135, 0.25)', 'rgba(168, 85, 247, 0.7)', clusterB);
      drawClusterHull('Cluster-D', 'Cluster D (Standby Bypass)', '#f59e0b', 'rgba(120, 53, 15, 0.2)', 'rgba(245, 158, 11, 0.5)', clusterD);
      drawClusterHull('Cluster-C', 'Cluster C (End-Node Grid)', '#22c55e', 'rgba(20, 83, 45, 0.25)', 'rgba(34, 197, 94, 0.7)', clusterC);

      // 4. DRAW OPTICAL FIBER MESH WITH MULTI-PATH HIGHLIGHTING & ON-CANVAS ROUTE SCORE BADGES
      fibers.forEach(f => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(f.fromNode.x, f.fromNode.y);
        ctx.lineTo(f.toNode.x, f.toNode.y);

        if (isWinnerLockedIn) {
          ctx.lineWidth = f.isWinner ? 4.5 : 2;
          ctx.strokeStyle = f.isWinner ? '#06b6d4' : f.color;
          if (f.isWinner) {
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 18;
          } else {
            ctx.setLineDash([5, 4]);
            ctx.globalAlpha = 0.4;
          }
        } else {
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = f.color;
          ctx.shadowColor = f.color;
          ctx.shadowBlur = 10;
        }
        ctx.stroke();
        ctx.restore();
      });

      // DRAW ON-CANVAS ROUTE SCORE TAGS DIRECTLY ON FIBERS
      const r2Node = nodeMap.get('R2')!;
      const r4Node = nodeMap.get('R4')!;
      const r12Node = nodeMap.get('R12')!;

      // Winner Path Tag (R2 ➔ R4)
      ctx.save();
      const mid1X = (r2Node.x + r4Node.x) / 2;
      const mid1Y = (r2Node.y + r4Node.y) / 2;
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('96.4% (Winner)', mid1X + 10, mid1Y - 6);
      ctx.restore();

      // Standby Path Tag (R2 ➔ R12)
      ctx.save();
      const mid2X = (r2Node.x + r12Node.x) / 2;
      const mid2Y = (r2Node.y + r12Node.y) / 2;
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('91.2% (Standby)', mid2X + 10, mid2Y + 12);
      ctx.restore();

      // 5. UPDATE & DRAW MULTI-PATH PROBES OR LOCKED-IN PHOTON
      const advanceProbe = (p: PhotonEntity) => {
        const targetNode = p.chain[p.targetNodeIdx];
        const dx = targetNode.x - p.x;
        const dy = targetNode.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 4) {
          p.targetNodeIdx = (p.targetNodeIdx + 1) % p.chain.length;
          if (p.targetNodeIdx === 0) p.targetNodeIdx = 1;
          p.x = p.chain[p.targetNodeIdx - 1].x;
          p.y = p.chain[p.targetNodeIdx - 1].y;
        } else {
          p.x += (dx / dist) * p.speed;
          p.y += (dy / dist) * p.speed;
        }

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 10) p.trail.shift();

        ctx.save();
        p.trail.forEach((pt, idx) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, (idx / 10) * 5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = idx / 10;
          ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.restore();
      };

      if (isEvaluatingPhase) {
        advanceProbe(probeWinner);
        advanceProbe(probeAlternative);
      } else if (isWinnerLockedIn) {
        advanceProbe(probeWinner);

        ctx.save();
        ctx.beginPath();
        ctx.arc(nodeMap.get('R6')!.x, nodeMap.get('R6')!.y, 22, 0, Math.PI * 2);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();
      }

      // 6. DRAW REPEATER NODES & MEMORY SLOT BARS
      nodes.forEach(n => {
        const isSelected = selectedClusterId === n.clusterId;

        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.id === 'CC' || n.id === 'SUB' ? 26 : 20, 0, Math.PI * 2);
        ctx.fillStyle = n.id === 'CC' ? 'rgba(6, 182, 212, 0.2)' : n.id === 'SUB' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.8)';
        ctx.strokeStyle = n.id === 'CC' ? '#06b6d4' : n.id === 'SUB' ? '#22c55e' : isSelected ? '#3b82f6' : '#64748b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = n.id === 'CC' ? '#06b6d4' : n.id === 'SUB' ? '#22c55e' : '#3b82f6';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, n.x, n.y);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#a855f7';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(n.memorySlots, n.x, n.y + 32);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Canvas Ray-Casting
    const handleCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let hovered: NodeEntity | null = null;
      nodes.forEach(n => {
        if (Math.hypot(n.x - mouseX, n.y - mouseY) < 25) {
          hovered = n;
        }
      });

      if (hovered) {
        const node = hovered as NodeEntity;
        setTooltipState({
          visible: true,
          x: mouseX + 15,
          y: mouseY + 15,
          title: `Node ${node.label} (${node.clusterId})`,
          fidelity: node.fidelity,
          qber: 1.1,
          loss: '0.18 dB/km',
          genRate: '24 pairs/s',
          memoryMs: 26
        });
      } else {
        setTooltipState(null);
      }
    };

    canvas.addEventListener('mousemove', handleCanvasMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
    };
  }, [clusters, activeDestination, selectedClusterId, currentStageIdx, isEvaluatingPhase, isWinnerLockedIn]);

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border-2 border-cyan-500/40 space-y-4 relative overflow-hidden shadow-2xl min-h-[600px] flex flex-col justify-between font-mono select-none">
      {/* Header Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Radio className="w-5 h-5 animate-ping" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-100 font-sans uppercase tracking-wider">
              LIVE NETWORK TOPOLOGY 3.0 (MULTI-ROUTE OPTIMIZATION SCOREBOARD)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              REAL-TIME CANDIDATE ROUTE EVALUATION &amp; SCORE COMPARISON
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className={`px-2.5 py-1 rounded-lg border font-extrabold flex items-center gap-1.5 ${
            isEvaluatingPhase
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            {isEvaluatingPhase ? '⚡ Evaluating Candidate Routes...' : '🏆 Winner Path Locked In'}
          </span>
        </div>
      </div>

      {/* 3-CARD CANDIDATE ROUTE OPTIMIZATION SCOREBOARD */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
        {candidateRoutes.map((opt) => (
          <div
            key={opt.id}
            className={`p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden ${opt.colorClass}`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-extrabold font-sans text-slate-100">{opt.name}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-extrabold ${
                opt.winner ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {opt.status}
              </span>
            </div>
            <div className="text-xs font-mono font-extrabold text-cyan-300 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {opt.clusterPath}
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate mb-2">
              {opt.localPath}
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">Score: <strong className="text-cyan-300 font-bold">{opt.score}%</strong></span>
              <span className="text-slate-400">Hops: <strong className="text-slate-200">{opt.hops}</strong></span>
              <span className="text-slate-400">Fidelity: <strong className="text-emerald-400">{opt.avgFidelity}%</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* 60 FPS HTML5 CANVAS CONTAINER */}
      <div className="relative w-full h-[460px] flex items-center justify-center z-10">
        <canvas ref={canvasRef} className="w-full h-full cursor-crosshair rounded-xl" />
      </div>

      {/* Glassmorphic Cursor Tooltip */}
      {tooltipState && tooltipState.visible && (
        <div
          style={{ left: `${tooltipState.x}px`, top: `${tooltipState.y}px` }}
          className="absolute z-50 bg-slate-900/90 backdrop-blur-xl border-2 border-cyan-500/70 rounded-2xl p-3.5 shadow-2xl text-[11px] font-mono space-y-2 pointer-events-none min-w-[240px] animate-in fade-in duration-150"
        >
          <div className="font-extrabold text-cyan-300 border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{tooltipState.title}</span>
            <span className="text-[9px] bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300">Live Canvas Ray-Cast</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>Fidelity: <strong className="text-emerald-400">{tooltipState.fidelity}%</strong></div>
            <div>QBER: <strong className="text-amber-300">{tooltipState.qber}%</strong></div>
            <div>Attenuation: <strong className="text-slate-200">{tooltipState.loss}</strong></div>
            <div>Gen Rate: <strong className="text-purple-300">{tooltipState.genRate}</strong></div>
            <div>Memory: <strong className="text-cyan-300">{tooltipState.memoryMs} ms</strong></div>
          </div>
        </div>
      )}

      {/* Bottom Legend */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>Fidelity Gradient:</span>
          <span className="text-rose-400 font-bold">Low</span>
          <div className="w-32 h-2.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-400" />
          <span className="text-emerald-400 font-bold">High</span>
        </div>
        <span>Bell Pair States: <strong className="text-blue-400">Blue=Ready</strong> | <strong className="text-purple-400">Purple=Reserved</strong> | <strong className="text-amber-400">Orange=Generating</strong></span>
      </div>
    </div>
  );
};
