import {Easing, interpolate, staticFile} from 'remotion';
import layout from './layout.json';

// Géométrie mesurée sur le logo source par scripts/extract_layers.py.
export const LOGO = layout;
export const LOGO_W = layout.width;
export const LOGO_H = layout.height;

// Centre visuel du logo (zone encrée, pas le cadre du JPG).
export const CONTENT = {x0: 155, y0: 34, x1: 1014, y1: 490};
export const CONTENT_CX = (CONTENT.x0 + CONTENT.x1) / 2;
export const CONTENT_CY = (CONTENT.y0 + CONTENT.y1) / 2;

export const COLORS = {
  blue: 'rgb(25, 63, 136)',
  blueGlow: 'rgba(52, 110, 220, 1)',
  gray: 'rgb(89, 84, 81)',
};

export const FPS = 30;
export const DURATION = 10 * FPS;

// Minutage en images (30 i/s).
export const T = {
  bloom: [0, 45],
  lightLine: [6, 44],
  globe: [12, 58],
  dome: [34, 104],
  plane: [56, 112],
  planeLand: [104, 118],
  set: [120, 152],
  voyage: [136, 178],
  slogan: [182, 226],
  sheen: [206, 246],
  push: [228, 300],
  sheen2: [258, 292],
} as const;

export const layer = (name: string) => staticFile(`assets/layers/${name}.png`);

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Progression 0→1 entre deux images, avec courbe. */
export const progress = (
  frame: number,
  [start, end]: readonly [number, number],
  easing: (t: number) => number = ease,
) =>
  interpolate(frame, [start, end], [0, 1], {
    easing,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
