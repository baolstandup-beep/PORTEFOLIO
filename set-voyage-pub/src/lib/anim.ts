import { Easing, interpolate, spring } from 'remotion';

export const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Spring standard « premium » : rapide, sans rebond excessif. */
export const springIn = (frame: number, fps: number, delay = 0, config = {}) =>
  spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.8, ...config } });

/** Spring avec léger rebond pour les éléments « pop ». */
export const springPop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 120, mass: 0.7 } });

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Interpolation 0→1 entre deux frames, avec easing. */
export const progress = (frame: number, from: number, to: number, easing = easeOut) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing });

/** Sortie : renvoie 1 → 0 sur les `dur` dernières frames de la scène. */
export const outro = (frame: number, total: number, dur = 15) =>
  interpolate(frame, [total - dur, total], [1, 0], { ...clamp, easing: Easing.in(Easing.cubic) });

/** Bruit déterministe léger (flottement, turbulences). */
export const wobble = (frame: number, speed = 0.05, amp = 1, phase = 0) =>
  Math.sin(frame * speed + phase) * amp;
