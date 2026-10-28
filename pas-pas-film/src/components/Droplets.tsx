// Gouttelettes de condensation, uniquement sur le plastique transparent (épaule et bas du corps) :
// jamais sur l'étiquette. Positions et apparitions déterministes.
import React from 'react';
import {config} from '../config';
import {seeded} from '../lib/motion';
import {IMG_H, IMG_W} from './ProductBottle';

// Zones en fraction de la boîte de l'image : [haut, bas, gauche, droite].
const ZONES: [number, number, number, number][] = [
  [0.27, 0.33, 0.22, 0.78], // épaule
  [0.33, 0.43, 0.12, 0.88], // haut du corps, au-dessus de l'étiquette
  [0.75, 0.93, 0.1, 0.9], // bas du corps, sous l'étiquette
];

type Drop = {u: number; v: number; r: number; appear: number; slide: number; zoneBottom: number};

const drops: Drop[] = (() => {
  const rnd = seeded(7031);
  const out: Drop[] = [];
  ZONES.forEach(([top, bottom, left, right], z) => {
    const n = z === 2 ? 26 : 16;
    for (let i = 0; i < n; i++) {
      out.push({
        u: left + rnd() * (right - left),
        v: top + rnd() * (bottom - top),
        r: 1.6 + rnd() ** 2 * 4.2,
        appear: rnd() * 70,
        slide: rnd() < 0.12 ? 0.08 + rnd() * 0.12 : 0,
        zoneBottom: bottom,
      });
    }
  });
  return out;
})();

export const Droplets: React.FC<{frame: number; start: number; intensity: number}> = ({frame, start, intensity}) => {
  if (!config.effects.droplets) return null;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      {drops.map((d, i) => {
        const age = frame - start - d.appear;
        if (age <= 0) return null;
        const o = Math.min(1, age / 14) * intensity;
        const y = Math.min(d.v * IMG_H + d.slide * age, d.zoneBottom * IMG_H);
        const w = d.r * 2;
        const h = d.r * 2.25; // légère goutte, allongée par la gravité
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: d.u * IMG_W - w / 2,
              top: y - h / 2,
              width: w,
              height: h,
              borderRadius: '50% 50% 48% 48% / 46% 46% 54% 54%',
              opacity: o,
              background:
                'radial-gradient(circle at 36% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.5) 14%, rgba(255,255,255,0) 30%),' +
                'radial-gradient(circle at 55% 78%, rgba(220,235,255,0.55) 0%, rgba(220,235,255,0) 35%),' +
                'radial-gradient(circle at 50% 50%, rgba(10,18,35,0) 52%, rgba(6,10,22,0.55) 78%, rgba(255,255,255,0.25) 92%, rgba(255,255,255,0) 100%)',
              boxShadow: '0 0.5px 0.5px rgba(0,0,0,0.25)',
            }}
          />
        );
      })}
    </div>
  );
};
