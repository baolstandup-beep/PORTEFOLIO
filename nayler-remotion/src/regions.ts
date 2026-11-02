/**
 * Coordonnées des éléments dans le flyer original (960 × 1280 px).
 * Chaque calque animé est une découpe EXACTE du flyer à ces coordonnées :
 * en fin d'animation tout se superpose pixel pour pixel à l'original.
 */
export const FLYER_W = 960;
export const FLYER_H = 1280;

export type Rect = { x: number; y: number; w: number; h: number };

export const R = {
  topLogo: { x: 240, y: 6, w: 460, h: 170 },
  // Portraits : rectangles englobants + polygones (coordonnées flyer)
  leftPortrait: { x: 40, y: 150, w: 414, h: 522 },
  rightPortrait: { x: 395, y: 150, w: 545, h: 685 },
  pasLogo: { x: 362, y: 224, w: 244, h: 244 },
  leftBadge: { x: 68, y: 672, w: 306, h: 96 },
  rightBadge: { x: 558, y: 672, w: 336, h: 122 },
  title: { x: 205, y: 818, w: 665, h: 222 },
  mic: { x: 104, y: 795, w: 142, h: 166 },
  banner: { x: 88, y: 1032, w: 790, h: 140 },
  calendar: { x: 120, y: 1054, w: 98, h: 96 },
  mardi: { x: 222, y: 1068, w: 224, h: 74 },
  aPartirDe: { x: 556, y: 1046, w: 210, h: 42 },
  clock: { x: 500, y: 1082, w: 84, h: 74 },
  hour: { x: 586, y: 1076, w: 266, h: 80 },
  bottomLogo: { x: 232, y: 1166, w: 488, h: 104 },
} satisfies Record<string, Rect>;

/** Polygones en coordonnées flyer : évitent que les portraits embarquent le logo PAS-PAS. */
export const LEFT_PORTRAIT_POLY: [number, number][] = [
  [40, 150], [372, 150], [372, 468], [454, 468], [454, 672], [40, 672],
];
export const RIGHT_PORTRAIT_POLY: [number, number][] = [
  [560, 150], [940, 150], [940, 835], [395, 835], [395, 470], [560, 470],
];

/** Trou (coordonnées flyer) laissé dans le portrait droit pour que son badge ne soit pas dupliqué. */
export const RIGHT_BADGE_HOLE: [number, number][] = [
  [558, 672], [894, 672], [894, 794], [558, 794],
];
