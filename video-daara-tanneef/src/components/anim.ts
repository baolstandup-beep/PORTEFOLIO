import {Easing, interpolate, spring} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const ease = (frame: number, from: number, to: number, a = 0, b = 1, easing = Easing.bezier(0.22, 1, 0.36, 1)) =>
  interpolate(frame, [from, to], [a, b], {...clamp, easing});

export const pop = (frame: number, fps: number, delay = 0, damping = 14, mass = 0.8) =>
  spring({frame: frame - delay, fps, config: {damping, mass, stiffness: 140}});
