import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS } from '../config/setrans.config';
import { Particles } from '../components/Base';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

/** SCÈNE 15 — Silence visuel : bleu nuit, particules qui convergent au centre. */
export const S15Silence: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const converge = progress(f, 0.3, duration + 0.4, EASE.inOut);
  const core = progress(f, duration - 1.4, duration + 0.4, EASE.in);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      <Particles count={140} seed={42} converge={converge} opacity={0.75} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(127,162,232,${0.35 * core}) 0%, rgba(28,63,136,${0.25 * core}) 18%, rgba(5,11,28,0) 45%)`,
        }}
      />
    </AbsoluteFill>
  );
};
