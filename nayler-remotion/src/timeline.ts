/**
 * Toutes les durées sont en frames (30 fps). Modifier ici pour retimer
 * l'animation ; scripts/generate_audio.py utilise les mêmes repères.
 */
export const FPS = 30;
export const DURATION = 450; // 15 s

export const T = {
  // SCÈNE 1 — intro (0 → 2 s)
  bgIn: 0,
  ribbons: 0,
  topLogo: 18,

  // SCÈNE 2 — présentateurs (2 → 5 s)
  leftPortrait: 60,
  rightPortrait: 70,
  pasLogo: 88,
  leftBadge: 108,
  rightBadge: 118,
  clothSweep: 112,
  parallaxEnd: 150,

  // SCÈNE 3 — titre ÑAYLER (5 → 8 s)
  title: 160, // impact
  mic: 166,
  titleSweep: 186,

  // SCÈNE 4 — rendez-vous (8 → 11 s)
  banner: 240,
  calendar: 255,
  mardi: 262,
  aPartirDe: 272,
  clock: 280,
  hour: 288,
  hourGlow: 300,

  // SCÈNE 5 — signature (11 → 15 s)
  bottomLogo: 322,
  master: 335, // le flyer original intégral repasse au premier plan
  halo: 342,
  finalSweep: 352,
  zoomStart: 330,
  outro: 434,
} as const;
