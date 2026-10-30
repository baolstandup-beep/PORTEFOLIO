import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Layer} from '../Layer';
import {LOGO, LOGO_H, LOGO_W, T, progress} from '../layout';

const [TEXT_TOP, TEXT_BOTTOM] = LOGO.bands.text;
const [SLOGAN_TOP, SLOGAN_BOTTOM] = LOGO.bands.slogan;
const [VOYAGE_X0, VOYAGE_X1] = LOGO.voyage[LOGO.voyage.length - 1];

/** Découpe une bande verticale [x0, x1] d'un calque, sans en changer la géométrie. */
const clip = (x0: number, x1: number, top: number, bottom: number, pad = 3) =>
  `inset(${top - pad}px ${LOGO_W - x1 - pad}px ${LOGO_H - bottom - pad}px ${x0 - pad}px)`;

/**
 * Scène 3 et 4 : SET lettre par lettre, VOYAGE en révélation lumineuse, puis
 * le slogan mot par mot (fondu et légère remontée).
 */
export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // SET- : chaque lettre monte avec un ressort, flou → net.
  const letters = LOGO.set.map(([x0, x1], i) => {
    const s = spring({
      frame: frame - T.set[0] - i * 5,
      fps,
      config: {damping: 14, stiffness: 120, mass: 0.7},
    });
    const blur = (1 - Math.min(1, s)) * 10;
    return (
      <Layer
        key={`set-${x0}`}
        name="set"
        style={{
          clipPath: clip(x0, x1, TEXT_TOP, TEXT_BOTTOM),
          opacity: Math.min(1, s * 1.4),
          transform: `translateY(${(1 - s) * 70}px) scale(${0.92 + 0.08 * s})`,
          transformOrigin: `${(x0 + x1) / 2}px ${TEXT_BOTTOM}px`,
          filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        }}
      />
    );
  });

  // VOYAGE : révélation de gauche à droite avec un front lumineux.
  const v = progress(frame, T.voyage);
  const edgeX = VOYAGE_X0 - 40 + (VOYAGE_X1 - VOYAGE_X0 + 80) * v;
  const voyageMask = `linear-gradient(90deg, #000 ${edgeX - 40}px, transparent ${edgeX + 10}px)`;
  const flare = v > 0 && v < 1 ? Math.sin(v * Math.PI) : 0;

  // Slogan : mots et tirets un à un.
  const words = LOGO.sloganWords.map(([x0, x1], i) => {
    const p = progress(frame, [T.slogan[0] + i * 6, T.slogan[0] + i * 6 + 22]);
    return (
      <Layer
        key={`slogan-${x0}`}
        name="slogan"
        style={{
          clipPath: clip(x0, x1, SLOGAN_TOP, SLOGAN_BOTTOM),
          opacity: p,
          transform: `translateY(${(1 - p) * 18}px)`,
        }}
      />
    );
  });

  return (
    <>
      {letters}
      <Layer
        name="voyage"
        style={{
          opacity: v > 0 ? 1 : 0,
          transform: `translateX(${(1 - v) * 24}px)`,
          maskImage: voyageMask,
          WebkitMaskImage: voyageMask,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: edgeX - 30,
          top: TEXT_TOP - 30,
          width: 60,
          height: TEXT_BOTTOM - TEXT_TOP + 60,
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(170,200,255,0.9) 0%, rgba(52,110,220,0.3) 38%, transparent 70%)',
          opacity: flare * 0.85,
        }}
      />
      {words}
    </>
  );
};
