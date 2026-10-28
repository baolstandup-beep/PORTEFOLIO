// Particules lumineuses déterministes sur trois profondeurs (bokeh lointain, poussière, éclats proches).
// La position de chaque particule est une fonction pure de l'image : aucun état, aucun hasard au rendu.
import React from 'react';
import type {Shot} from '../camera';
import {config} from '../config';
import {seeded} from '../lib/motion';
import {STAGE} from '../layout';

type P = {x: number; y: number; size: number; speed: number; sway: number; phase: number; depth: number; alpha: number};

const layers = [
  {count: 18, depth: 0.25, size: [24, 60], alpha: [0.05, 0.12], speed: 0.12},
  {count: 70, depth: 0.6, size: [2, 4.5], alpha: [0.25, 0.6], speed: 0.35},
  {count: 22, depth: 1.25, size: [3, 7], alpha: [0.25, 0.55], speed: 0.7},
];

const particles: P[] = (() => {
  const rnd = seeded(20251028);
  const out: P[] = [];
  for (const l of layers) {
    for (let i = 0; i < l.count; i++) {
      out.push({
        x: rnd(),
        y: rnd(),
        size: l.size[0] + rnd() * (l.size[1] - l.size[0]),
        speed: l.speed * (0.6 + rnd() * 0.8),
        sway: 8 + rnd() * 26,
        phase: rnd() * Math.PI * 2,
        depth: l.depth,
        alpha: l.alpha[0] + rnd() * (l.alpha[1] - l.alpha[0]),
      });
    }
  }
  return out;
})();

export const Particles: React.FC<{shot: Shot; frame: number}> = ({shot, frame}) => {
  if (!config.effects.particles || shot.particles <= 0.001) return null;
  const v = config.motion.particleSpeed;
  return (
    <div style={{position: 'absolute', inset: 0, mixBlendMode: 'screen'}}>
      {particles.map((p, i) => {
        // Montée lente, bouclée sur la hauteur de l'écran, balancement latéral.
        const travel = STAGE.height + 200;
        const y = ((p.y * travel - frame * p.speed * v) % travel + travel) % travel - 100;
        const x = p.x * STAGE.width + Math.sin(frame / 60 + p.phase) * p.sway;
        // Parallaxe : les plans proches suivent davantage la caméra.
        const px = (x - STAGE.cx) * (1 + (shot.zoom - 1) * p.depth) + STAGE.cx + (shot.x - shot.orbit * 60) * p.depth;
        const py = (y - STAGE.cy) * (1 + (shot.zoom - 1) * p.depth) + STAGE.cy + shot.y * p.depth;
        const twinkle = 0.65 + 0.35 * Math.sin(frame / 9 + p.phase * 3);
        const near = p.depth > 1;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - p.size / 2,
              top: py - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              opacity: p.alpha * twinkle * shot.particles,
              background: near
                ? `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(${config.colors.beam},0.35) 45%, rgba(0,0,0,0) 72%)`
                : `radial-gradient(circle, rgba(${config.colors.beam},0.9) 0%, rgba(${config.colors.beam},0.25) 50%, rgba(0,0,0,0) 72%)`,
            }}
          />
        );
      })}
    </div>
  );
};
