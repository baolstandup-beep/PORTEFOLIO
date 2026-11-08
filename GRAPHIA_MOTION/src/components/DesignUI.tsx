import React from 'react';
import { C, FONT } from '../theme';

/** Boîte de sélection type « transformation » (poignées carrées) : clin d'œil aux logiciels de création. */
export const SelectionBox: React.FC<{ x: number; y: number; w: number; h: number; p: number; color?: string; label?: string; scale?: number }> = ({
  x, y, w, h, p, color = C.sun, label, scale = 1,
}) => {
  if (p <= 0) return null;
  const hs = 12 * scale;
  const pts = [[0, 0], [0.5, 0], [1, 0], [1, 0.5], [1, 1], [0.5, 1], [0, 1], [0, 0.5]];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: Math.min(1, p * 1.5), pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, border: `${2 * scale}px solid ${color}`, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }} />
      {pts.map(([px, py], i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: px * w - hs / 2, top: py * h - hs / 2, width: hs, height: hs,
            background: C.paper, border: `${2 * scale}px solid ${color}`, transform: `scale(${Math.min(1, Math.max(0, p * 8 - i * 0.6))})`,
          }}
        />
      ))}
      {label && (
        <div style={{ position: 'absolute', left: 0, top: -34 * scale, fontFamily: FONT, fontWeight: 600, fontSize: 18 * scale, color: C.ink, background: color, padding: `${3 * scale}px ${10 * scale}px`, borderRadius: 4 * scale }}>
          {label}
        </div>
      )}
    </div>
  );
};

/** Curseur flèche. */
export const Cursor: React.FC<{ x: number; y: number; scale?: number; press?: number; opacity?: number }> = ({ x, y, scale = 1, press = 0, opacity = 1 }) => (
  <svg
    width={36 * scale} height={36 * scale} viewBox="0 0 24 24"
    style={{ position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: '0 0', opacity, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))' }}
  >
    <path d="M3 2 L3 19 L7.6 14.8 L10.6 21.5 L13.6 20.2 L10.7 13.6 L17 13.6 Z" fill={C.paper} stroke={C.ink} strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);

/** Pastille (chips) d'information — même langage que les chips du hero du site. */
export const Chip: React.FC<{ children: React.ReactNode; p: number; dark?: boolean; size?: number; style?: React.CSSProperties; dot?: string }> = ({ children, p, dark, size = 26, style, dot }) => (
  <div
    style={{
      display: 'inline-flex', alignItems: 'center', gap: size * 0.45, fontFamily: FONT, fontWeight: 600, fontSize: size,
      padding: `${size * 0.42}px ${size * 0.85}px`, borderRadius: 999, whiteSpace: 'nowrap',
      background: dark ? 'rgba(255,255,255,0.08)' : C.paper, color: dark ? C.paper : C.ink,
      border: dark ? '1px solid rgba(255,255,255,0.18)' : `1px solid ${C.line}`,
      boxShadow: dark ? 'none' : '0 1px 2px rgb(8 8 8 / 0.04), 0 8px 24px -12px rgb(8 8 8 / 0.18)',
      opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 24}px) scale(${0.9 + 0.1 * p})`, ...style,
    }}
  >
    {dot && <span style={{ width: size * 0.38, height: size * 0.38, borderRadius: 99, background: dot, boxShadow: `0 0 ${size * 0.5}px ${dot}` }} />}
    {children}
  </div>
);
