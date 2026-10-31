import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, springIn } from '../lib/anim';
import { COULEURS } from '../theme';

/**
 * Photo avec mouvement de caméra « Ken Burns » (zoom + panoramique) indépendant.
 */
export const KenBurns: React.FC<{
  src: string;
  duration: number;
  from?: { scale: number; x: number; y: number };
  to?: { scale: number; x: number; y: number };
  position?: string;
  style?: React.CSSProperties;
}> = ({ src, duration, from = { scale: 1.15, x: 0, y: 0 }, to = { scale: 1.0, x: 0, y: 0 }, position = 'center', style }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, duration], [0, 1], clamp);
  const s = from.scale + (to.scale - from.scale) * t;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: position,
          transform: `translate(${x}px, ${y}px) scale(${s})`,
        }}
      />
    </div>
  );
};

/**
 * Portrait du responsable dans un cadre circulaire animé :
 * anneau qui se dessine, anneau pointillé rotatif, satellite « avion » en orbite.
 */
export const CircularPortrait: React.FC<{
  src: string;
  size: number;
  delay?: number;
  objectPosition?: string;
  zoom?: number;
}> = ({ src, size, delay = 0, objectPosition = 'center', zoom = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = springIn(frame, fps, delay, { damping: 16, stiffness: 90 });
  const ring = interpolate(frame, [delay + 5, delay + 45], [0, 1], { ...clamp });
  const r = size / 2 + 34;
  const C = 2 * Math.PI * r;
  const orbit = (frame - delay) * 1.6;
  const imgZoom = interpolate(frame, [delay, delay + 180], [zoom * 1.12, zoom], clamp);
  const box = size + 160;

  return (
    <div style={{ position: 'relative', width: box, height: box, transform: `scale(${0.4 + 0.6 * enter})`, opacity: interpolate(enter, [0, 0.3], [0, 1], clamp) }}>
      {/* halo */}
      <div
        style={{
          position: 'absolute',
          inset: 30,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COULEURS.jaune}66 0%, ${COULEURS.jaune}00 70%)`,
          transform: `scale(${1.05 + Math.sin(frame / 12) * 0.03})`,
        }}
      />
      <svg width={box} height={box} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke={COULEURS.jaune} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - ring)} transform={`rotate(-90 ${box / 2} ${box / 2})`} />
        <g style={{ transformOrigin: 'center', transform: `rotate(${frame * 0.5}deg)` }}>
          <circle cx={box / 2} cy={box / 2} r={r + 30} fill="none" stroke="#fff" strokeOpacity={0.7 * ring} strokeWidth={4} strokeDasharray="3 20" strokeLinecap="round" />
        </g>
        <circle cx={box / 2} cy={box / 2} r={r - 20} fill="none" stroke={COULEURS.rouge} strokeWidth={4} strokeOpacity={ring}
          strokeDasharray={`${C * 0.12} ${C}`} transform={`rotate(${-orbit * 0.8} ${box / 2} ${box / 2})`} strokeLinecap="round" />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (box - size) / 2,
          top: (box - size) / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '10px solid #fff',
          boxShadow: '0 40px 90px rgba(6,26,64,0.45)',
          background: COULEURS.bleuNuit,
        }}
      >
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition, transform: `scale(${imgZoom})`, transformOrigin: objectPosition }} />
      </div>
      {/* satellite en orbite */}
      <div
        style={{
          position: 'absolute',
          left: box / 2 - 36,
          top: box / 2 - 36,
          width: 72,
          height: 72,
          transform: `rotate(${orbit}deg) translateY(${-(r + 30)}px) rotate(${-orbit}deg)`,
          opacity: ring,
        }}
      >
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: COULEURS.rouge, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(230,57,70,0.5)' }}>
          <svg width={40} height={40} viewBox="0 0 24 24" fill="#fff" style={{ transform: `rotate(${orbit + 90}deg)` }}>
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
