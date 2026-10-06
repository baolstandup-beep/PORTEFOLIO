import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, PLACES } from '../config/setrans.config';
import { DarkBackground, Particles } from '../components/Base';
import { Globe } from '../components/Maps';
import { EASE, lerp, progress } from '../lib/anim';
import type { SceneProps } from './types';

/** SCÈNE 01 — Noir → globe, lignes entre continents, plongée vers l'océan. */
export const S01Globe: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const appear = progress(f, 0.2, 2.0, EASE.soft);
  const orbit = progress(f, 0, duration, EASE.soft);
  const dive = progress(f, duration - 1.8, duration, EASE.in);

  const scale = lerp(lerp(360, 420, orbit), 4200, dive);
  const rotate: [number, number] = [lerp(-5, 28, orbit), lerp(-28, -14, orbit)];

  const A = (from: keyof typeof PLACES, to: keyof typeof PLACES, start: number) => ({
    from: PLACES[from],
    to: PLACES[to],
    t: progress(f, start, start + 1.6, EASE.inOut),
    width: 1.4,
  });

  const arcs = [
    A('dakar', 'paris', 1.0),
    A('dakar', 'newYork', 1.4),
    A('dakar', 'saoPaulo', 1.8),
    A('casablanca', 'lagos', 2.1),
    A('antwerp', 'newYork', 2.3),
    A('dakar', 'dubai', 2.5),
    A('lagos', 'saoPaulo', 2.8),
  ];
  const dots = (['dakar', 'paris', 'newYork', 'saoPaulo', 'casablanca', 'lagos', 'antwerp', 'dubai'] as const).map(
    (k, i) => ({ at: PLACES[k], r: k === 'dakar' ? 4 : 2.6, opacity: progress(f, 0.9 + i * 0.15, 1.5 + i * 0.15) }),
  );

  return (
    <DarkBackground glow={0.25 * appear}>
      <AbsoluteFill style={{ opacity: appear * 0.6 }}>
        <Particles count={50} seed={3} opacity={0.35} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: appear, transform: `translateY(${(1 - appear) * 30}px)` }}>
        <Globe rotate={rotate} scale={scale} arcs={arcs} dots={dots} />
      </AbsoluteFill>
      {/* Fondu vers le bleu océan à la plongée */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${COLORS.navy}, ${COLORS.blue})`,
          opacity: dive * 0.85,
        }}
      />
    </DarkBackground>
  );
};
