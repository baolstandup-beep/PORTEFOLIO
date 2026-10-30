import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Layer} from '../Layer';
import {COLORS, LOGO, LOGO_H, LOGO_W, T, progress} from '../layout';

type Pt = {x: number; y: number};

const [CX, CY] = LOGO.plane.center;
// Cap du nez de l'avion dans le logo (vers le haut à droite).
const NOSE_DEG = -27;
const nose = {
  x: Math.cos((NOSE_DEG * Math.PI) / 180),
  y: Math.sin((NOSE_DEG * Math.PI) / 180),
};

// Trajectoire : entrée par le bas à droite, large courbe vers la gauche puis
// remontée dans l'axe du nez jusqu'à la position exacte du logo.
const P0: Pt = {x: CX + 460, y: CY + 1500};
const P1: Pt = {x: CX + 300, y: CY + 330};
const P2: Pt = {x: CX - 240 * nose.x, y: CY - 240 * nose.y};
const P3: Pt = {x: CX, y: CY};

const bezier = (t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * P0.x + b * P1.x + c * P2.x + d * P3.x,
    y: a * P0.y + b * P1.y + c * P2.y + d * P3.y,
  };
};

const tangentDeg = (t: number) => {
  const p = bezier(Math.max(0, t - 0.01));
  const q = bezier(Math.min(1, t + 0.01));
  return (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
};

/**
 * Scène 2 : l'avion bleu (silhouette exacte du logo) traverse l'écran avec une
 * traînée lumineuse, s'incline légèrement puis se pose sur sa place d'origine,
 * où il reprend son aspect du logo (réserve blanche dans le dôme).
 */
export const Airplane: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < T.plane[0]) return null;

  const t = progress(frame, T.plane, (x) => 1 - Math.pow(1 - x, 3.2));
  const pos = bezier(t);
  // Inclinaison : suit la trajectoire, atténuée, et revient à 0 à l'arrivée.
  let bank = tangentDeg(t) - NOSE_DEG;
  bank = ((bank + 540) % 360) - 180;
  const rotate = bank * 0.45 * (1 - progress(frame, [T.plane[1] - 18, T.plane[1]]));
  const scale = interpolate(t, [0, 1], [1.9, 1]);

  const land = progress(frame, T.planeLand);
  const transform = `translate(${pos.x - CX}px, ${pos.y - CY}px) rotate(${rotate}deg) scale(${scale})`;
  const origin = `${CX}px ${CY}px`;

  // Traînée : la portion de courbe parcourue juste avant l'avion.
  const tail = Math.max(0, t - 0.32);
  const points: Pt[] = [];
  for (let i = 0; i <= 40; i++) points.push(bezier(tail + ((t - tail) * i) / 40));
  const trailOpacity = 1 - progress(frame, [T.plane[1] - 6, T.plane[1] + 24]);
  const from = points[0];
  const to = points[points.length - 1];

  // Halo à l'atterrissage.
  const pulse = progress(frame, [T.planeLand[0], T.planeLand[1] + 20]);
  const pulseOpacity = Math.sin(pulse * Math.PI) * 0.55;

  return (
    <>
      <svg
        width={LOGO_W}
        height={LOGO_H}
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: trailOpacity}}
      >
        <defs>
          <linearGradient id="trail" gradientUnits="userSpaceOnUse" x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
            <stop offset="0" stopColor={COLORS.blueGlow} stopOpacity="0" />
            <stop offset="0.7" stopColor={COLORS.blueGlow} stopOpacity="0.45" />
            <stop offset="1" stopColor="#bcd3ff" stopOpacity="0.95" />
          </linearGradient>
          <filter id="trailGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="url(#trail)"
          strokeWidth={26 * scale}
          strokeLinecap="round"
          filter="url(#trailGlow)"
        />
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="url(#trail)"
          strokeWidth={3}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: CX - 160,
          top: CY - 160,
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(140,180,255,0.9) 0%, rgba(52,110,220,0.25) 40%, transparent 70%)',
          opacity: pulseOpacity,
          transform: `scale(${0.6 + pulse * 0.8})`,
        }}
      />
      <Layer
        name="plane-blue"
        style={{
          transform,
          transformOrigin: origin,
          opacity: 1 - land,
          filter: `drop-shadow(0 ${14 * scale}px ${16 * scale}px rgba(16, 40, 90, ${0.28 * (1 - land)}))`,
        }}
      />
      <Layer name="plane-logo" style={{transform, transformOrigin: origin, opacity: land}} />
    </>
  );
};
