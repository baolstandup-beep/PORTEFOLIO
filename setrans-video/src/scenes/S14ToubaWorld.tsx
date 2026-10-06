import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONTS, PLACES, TEXTS } from '../config/setrans.config';
import { DarkBackground, Particles } from '../components/Base';
import { FlatWorld } from '../components/Maps';
import { EASE, lerp, progress } from '../lib/anim';
import { useLayout } from '../lib/layout';
import type { SceneProps } from './types';

type P = keyof typeof PLACES;

/** Silhouette stylisée de la Grande Mosquée de Touba (dôme + minaret central). */
const ToubaSilhouette: React.FC<{ t: number }> = ({ t }) => (
  <svg width={220} height={170} viewBox="0 0 220 170" style={{ overflow: 'visible' }}>
    <g
      fill="none"
      stroke={COLORS.white}
      strokeWidth={1.6}
      strokeLinejoin="round"
      strokeLinecap="round"
      pathLength={1}
      opacity={0.9}
    >
      {[
        'M10 160 L210 160',
        // Corps
        'M30 160 L30 112 L190 112 L190 160',
        // Dôme
        'M70 112 C70 80 150 80 150 112',
        'M110 84 L110 74',
        // Minaret central (Lamp Fall)
        'M102 112 L102 30 L118 30 L118 112',
        'M98 30 L122 30 M100 50 L120 50 M100 76 L120 76',
        'M104 30 L110 6 L116 30',
        // Minarets latéraux
        'M40 112 L40 68 L50 68 L50 112',
        'M41 68 L45 52 L49 68',
        'M170 112 L170 68 L180 68 L180 112',
        'M171 68 L175 52 L179 68',
      ].map((d, i) => (
        <path key={i} d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
      ))}
    </g>
  </svg>
);

/** SCÈNE 14 — Touba, centre stratégique, connectée au Sénégal, à l'Afrique et au monde. */
export const S14ToubaWorld: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const { cx, cy, V } = useLayout();
  const zoomT = progress(f, 0.6, duration - 0.3, EASE.inOut);
  const zoom = Math.exp(lerp(Math.log(V ? 6 : 9), Math.log(V ? 0.6 : 1.15), zoomT));
  const center: [number, number] = [
    lerp(PLACES.touba[0], 5, zoomT),
    lerp(PLACES.touba[1], 22, zoomT),
  ];
  const sil = progress(f, 0.1, 1.4, EASE.inOut);
  const silOut = progress(f, 1.6, 2.4, EASE.soft);
  const pulse = ((f / 30) % 1.4) / 1.4;

  const arc = (to: P, s: number, len = 1.4) => ({
    from: PLACES.touba,
    to: PLACES[to],
    t: progress(f, s, s + len, EASE.inOut),
    width: 1.5,
  });
  const arcs = [
    arc('dakar', 0.4, 1),
    arc('saintLouis', 0.6, 1),
    arc('ziguinchor', 0.7, 1),
    arc('tambacounda', 0.8, 1),
    arc('kaolack', 0.9, 1),
    arc('abidjan', 1.4),
    arc('lagos', 1.6),
    arc('casablanca', 1.7),
    arc('paris', 2.0),
    arc('antwerp', 2.1),
    arc('marseille', 2.2),
    arc('dubai', 2.4),
    arc('shanghai', 2.6),
    arc('newYork', 2.5),
    arc('saoPaulo', 2.7),
  ];
  const ends: P[] = ['dakar', 'saintLouis', 'ziguinchor', 'tambacounda', 'kaolack', 'abidjan', 'lagos', 'casablanca', 'paris', 'antwerp', 'marseille', 'dubai', 'shanghai', 'newYork', 'saoPaulo'];
  const dots = [
    ...ends.map((k, i) => ({ at: PLACES[k], r: 2.6, opacity: arcs[i].t > 0.98 ? 1 : 0 })),
    { at: PLACES.touba, r: 7, color: COLORS.white, pulse },
  ];
  const caption = progress(f, 3.2, 4.0, EASE.out);
  return (
    <DarkBackground glow={0.25}>
      <Particles count={40} seed={21} opacity={0.3} />
      <FlatWorld center={center} zoom={zoom} arcs={arcs} dots={dots} />
      {/* Silhouette de Touba, au centre, au début (zoom serré) */}
      <div
        style={{
          position: 'absolute',
          left: cx - 110,
          top: cy - 200,
          opacity: sil * (1 - silOut),
          transform: `translateY(${(1 - sil) * 10}px)`,
        }}
      >
        <ToubaSilhouette t={sil} />
      </div>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 90,
          opacity: caption,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.title,
            fontWeight: 600,
            fontSize: 40,
            letterSpacing: '0.04em',
            color: COLORS.white,
            transform: `translateY(${(1 - caption) * 14}px)`,
          }}
        >
          {TEXTS.tagline}
        </div>
      </AbsoluteFill>
    </DarkBackground>
  );
};
