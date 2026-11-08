import React from 'react';
import { C } from '../theme';

type Node = { x: number; y: number; hx: number; hy: number }; // hx/hy : poignée sortante (relative)

/**
 * Tracé à la plume (outil « Plume ») : une courbe de Bézier se dessine, ses points d'ancrage
 * et poignées apparaissent au passage. La ligne graphique qui traverse l'écran au début du film.
 */
export const PenPath: React.FC<{ nodes: Node[]; p: number; color?: string; width?: number; glow?: boolean; handles?: number; fade?: number }> = ({
  nodes, p, color = C.brand, width = 6, glow = true, handles = 1, fade = 0,
}) => {
  let d = `M ${nodes[0].x} ${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    d += ` C ${a.x + a.hx} ${a.y + a.hy} ${b.x - b.hx} ${b.y - b.hy} ${b.x} ${b.y}`;
  }
  const seg = 1 / (nodes.length - 1);
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', opacity: 1 - fade }}>
      <defs>
        <filter id="penGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={width * 1.6} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray="1 1" strokeDashoffset={1 - p} filter={glow ? 'url(#penGlow)' : undefined} />
      {nodes.map((n, i) => {
        const vis = Math.max(0, Math.min(1, (p - i * seg) * 8 + 1)) * handles;
        if (vis <= 0) return null;
        return (
          <g key={i} opacity={vis}>
            <line x1={n.x - n.hx} y1={n.y - n.hy} x2={n.x + n.hx} y2={n.y + n.hy} stroke="rgba(255,255,255,0.55)" strokeWidth={1.5} />
            <circle cx={n.x - n.hx} cy={n.y - n.hy} r={5} fill={C.paper} />
            <circle cx={n.x + n.hx} cy={n.y + n.hy} r={5} fill={C.paper} />
            <rect x={n.x - 8} y={n.y - 8} width={16} height={16} fill={C.ink} stroke={C.paper} strokeWidth={2} />
          </g>
        );
      })}
    </svg>
  );
};
