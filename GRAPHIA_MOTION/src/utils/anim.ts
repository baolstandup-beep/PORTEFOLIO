import { Easing, interpolate } from 'remotion';
import { EASE } from '../theme';

type Bez = readonly [number, number, number, number];
export const bez = (b: Bez) => Easing.bezier(b[0], b[1], b[2], b[3]);

/** Progression 0→1 entre a et b secondes (temps local t), avec courbe. */
export const prog = (t: number, a: number, dur: number, curve: Bez = EASE.out) =>
  interpolate(t, [a, a + dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: bez(curve) });

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));

/** Valeur qui monte puis redescend (in, hold, out). */
export const inOut = (t: number, a: number, b: number, fi = 0.4, fo = 0.4) =>
  Math.min(prog(t, a, fi, EASE.rise), 1 - prog(t, b - fo, fo, EASE.inOut));

/** Mulberry32 : pseudo-aléatoire déterministe (rendu image par image reproductible). */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Bruit 1D lisse et déterministe (somme de sinus) pour les micro-mouvements « caméra à l'épaule ». */
export const drift = (t: number, seed = 1, amp = 1) =>
  amp * (Math.sin(t * 0.73 + seed * 1.7) * 0.6 + Math.sin(t * 1.31 + seed * 4.1) * 0.3 + Math.sin(t * 2.17 + seed) * 0.1);
