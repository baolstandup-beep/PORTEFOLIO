import React from 'react';
import {useCurrentFrame} from 'remotion';
import {LOGO_H, LOGO_W, T, easeInOut, layer, progress} from '../layout';

const Sheen: React.FC<{p: number; strength: number}> = ({p, strength}) => {
  if (p <= 0 || p >= 1) return null;
  const x = -500 + (LOGO_W + 1000) * p;
  const mask = `url(${layer('full-mask')})`;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: LOGO_W,
        height: LOGO_H,
        background: `linear-gradient(105deg, transparent ${x - 140}px, rgba(255,255,255,${strength}) ${x}px, transparent ${x + 140}px)`,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: `${LOGO_W}px ${LOGO_H}px`,
        WebkitMaskSize: `${LOGO_W}px ${LOGO_H}px`,
      }}
    />
  );
};

/**
 * Scènes 4 et 5 : balayage lumineux sur tout le logo, puis un second reflet
 * plus discret pendant la stabilisation finale.
 */
export const Final: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Sheen p={progress(frame, T.sheen, easeInOut)} strength={0.6} />
      <Sheen p={progress(frame, T.sheen2, easeInOut)} strength={0.32} />
    </>
  );
};
