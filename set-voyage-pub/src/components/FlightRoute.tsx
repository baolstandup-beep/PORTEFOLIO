import React from 'react';
import { getLength, getPointAtLength, getTangentAtLength } from '@remotion/paths';
import { COULEURS, FONTS } from '../theme';

/**
 * Trajet aérien animé : arc pointillé qui se trace + avion qui le suit.
 * progress 0→1.
 */
export const FlightRoute: React.FC<{
  from: string;
  to: string;
  progress: number;
  width?: number;
  accent?: string;
}> = ({ from, to, progress, width = 860, accent = COULEURS.jaune }) => {
  const h = 260;
  const d = `M 60 ${h - 50} Q ${width / 2} ${-60} ${width - 60} ${h - 50}`;
  const len = getLength(d);
  const at = Math.max(0.001, Math.min(len, len * progress));
  const pt = getPointAtLength(d, at) ?? { x: 0, y: 0 };
  const tan = getTangentAtLength(d, at) ?? { x: 1, y: 0 };
  const angle = (Math.atan2(tan.y, tan.x) * 180) / Math.PI;

  const label = (txt: string, x: number, alignRight: boolean, visible: number) => (
    <div
      style={{
        position: 'absolute',
        top: h - 20,
        left: alignRight ? undefined : x - 60,
        right: alignRight ? width - x - 60 : undefined,
        fontFamily: FONTS.texte,
        fontWeight: 700,
        fontSize: 30,
        color: '#fff',
        letterSpacing: 2,
        textTransform: 'uppercase',
        opacity: visible,
        textShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}
    >
      {txt}
    </div>
  );

  return (
    <div style={{ position: 'relative', width, height: h + 30 }}>
      <svg width={width} height={h} style={{ overflow: 'visible' }}>
        <path d={d} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={4} strokeDasharray="2 16" strokeLinecap="round" />
        <path d={d} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - progress)} />
        <circle cx={60} cy={h - 50} r={14} fill="#fff" />
        <circle cx={60} cy={h - 50} r={7} fill={COULEURS.bleu} />
        <circle cx={width - 60} cy={h - 50} r={14 + (progress > 0.97 ? 6 : 0)} fill={accent} opacity={progress > 0.97 ? 1 : 0.35} />
        <g transform={`translate(${pt.x} ${pt.y}) rotate(${angle + 90})`}>
          <circle r={30} fill="#fff" opacity={0.18} />
          <path d="M0 -22 C2 -22 3 -20 3 -17 L3 -6 L18 3 L18 7 L3 3 L3 13 L8 17 L8 20 L0 18 L-8 20 L-8 17 L-3 13 L-3 3 L-18 7 L-18 3 L-3 -6 L-3 -17 C-3 -20 -2 -22 0 -22Z" transform="scale(1.3)" fill="#fff" />
        </g>
      </svg>
      {label(from, 60, false, 1)}
      {label(to, width - 60, true, progress > 0.9 ? 1 : 0.4)}
    </div>
  );
};
