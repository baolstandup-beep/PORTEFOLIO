import { Easing, interpolate } from 'remotion';
import { VIDEO } from '../config/setrans.config';

/** Easing utilisés dans tout le film (mouvements doux, jamais agressifs). */
export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
};

export const sec = (s: number) => Math.round(s * VIDEO.fps);

/**
 * Progression 0→1 entre deux instants (en secondes, relatifs à la scène).
 */
export const progress = (
  frame: number,
  fromSec: number,
  toSec: number,
  easing: (t: number) => number = EASE.inOut,
) =>
  interpolate(frame, [sec(fromSec), sec(toSec)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Apparition / disparition en fondu. */
export const fadeInOut = (
  frame: number,
  durationSec: number,
  inSec = 0.6,
  outSec = 0.6,
) => {
  const a = progress(frame, 0, inSec, EASE.soft);
  const b = 1 - progress(frame, durationSec - outSec, durationSec, EASE.soft);
  return Math.min(a, b);
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Générateur pseudo-aléatoire déterministe (rendu identique à chaque export). */
export const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
