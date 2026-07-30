import React from 'react';

interface QuantumLinkProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  status: 'IDLE' | 'ACTIVE' | 'SWAPPED' | 'DIMMED';
  label?: string;
  isGlowing?: boolean;
}

export const QuantumLink: React.FC<QuantumLinkProps> = ({
  x1,
  y1,
  x2,
  y2,
  status,
  label,
  isGlowing = true
}) => {
  const isSwapped = status === 'SWAPPED';
  const isActive = status === 'ACTIVE' || status === 'SWAPPED';

  const lineColor = isSwapped
    ? '#10b981' // emerald
    : isActive
    ? '#06b6d4' // cyan
    : '#334155'; // slate-700

  const strokeDash = status === 'DIMMED' ? '4,4' : 'none';

  return (
    <g>
      {/* Background Line Glow */}
      {isActive && isGlowing && (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={lineColor}
          strokeWidth="6"
          strokeOpacity="0.25"
          className="blur-sm"
        />
      )}

      {/* Primary Link Line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={lineColor}
        strokeWidth={isActive ? '3' : '1.5'}
        strokeDasharray={strokeDash}
        strokeOpacity={status === 'DIMMED' ? '0.4' : '1'}
      />

      {/* Animated Glowing Photon Qubit Particle */}
      {isActive && (
        <circle r="4" fill={isSwapped ? '#34d399' : '#38bdf8'}>
          <animateMotion
            path={`M ${x1} ${y1} L ${x2} ${y2}`}
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Distance / Status Label */}
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={(y1 + y2) / 2 - 8}
          fill="#94a3b8"
          fontSize="10"
          fontFamily="monospace"
          textAnchor="middle"
          className="select-none font-bold"
        >
          {label}
        </text>
      )}
    </g>
  );
};
