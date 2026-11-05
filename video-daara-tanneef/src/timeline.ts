// Toutes les durées sont en frames (30 fps). 1200 frames = 40 s.
export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Chevauchement entre deux scènes (fondu enchaîné). */
export const XF = 14;

export const SCENES = {
  intro: {from: 0, dur: 120}, // 0 – 4 s
  annonce: {from: 120, dur: 150}, // 4 – 9 s
  lieu: {from: 270, dur: 210}, // 9 – 16 s
  date: {from: 480, dur: 150}, // 16 – 21 s
  impact: {from: 630, dur: 180}, // 21 – 27 s
  contact: {from: 810, dur: 240}, // 27 – 35 s
  final: {from: 1050, dur: 150}, // 35 – 40 s
} as const;

export const DURATION = 1200;

/** Instants des coupes (utilisés aussi par le sound design : scripts/generate_audio.py). */
export const CUTS = [120, 270, 480, 630, 810, 1050];
