import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS, TEXTS } from '../config/setrans.config';
import { Clip, Label } from '../components/Base';
import { Icon } from '../components/Icons';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

/**
 * SCÈNE 13 — Camion vers Touba. Parallaxe : ciel (voile), paysage (plan
 * vidéo, zoom lent), indicateur de route (premier plan, glisse plus vite).
 */
export const S13RoadTouba: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const t = progress(f, 0, duration, EASE.soft);
  const ui = progress(f, 0.6, 1.5, EASE.out);
  const travel = progress(f, 0.8, duration - 0.4, EASE.inOut);
  const x0 = 320;
  const x1 = 1600;
  const y = 960;
  return (
    <AbsoluteFill>
      <Clip src={ASSETS.clips.roadTouba} zoomFrom={1.04} zoomTo={1.12} panX={-50} dim={0.04} tint={0.12} />
      {/* Ciel : léger voile chaud en haut, parallaxe inverse */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(232,194,122,0.18) 0%, rgba(232,194,122,0) 35%)`,
          transform: `translateY(${-20 * t}px)`,
        }}
      />
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,11,28,0) 70%, rgba(5,11,28,0.75) 100%)' }} />
      {/* Premier plan : indicateur d'itinéraire */}
      <AbsoluteFill style={{ opacity: ui, transform: `translateX(${40 - 80 * t}px)` }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <line x1={x0} y1={y} x2={x1} y2={y} stroke={COLORS.white} strokeOpacity={0.25} strokeDasharray="3 9" />
          <line x1={x0} y1={y} x2={x0 + (x1 - x0) * travel} y2={y} stroke={COLORS.white} strokeWidth={2.5} />
          <circle cx={x0} cy={y} r={6} fill={COLORS.white} />
          <circle cx={x1} cy={y} r={10} fill={COLORS.blue} stroke={COLORS.white} strokeWidth={2.5} />
        </svg>
        <div style={{ position: 'absolute', left: x0 + (x1 - x0) * travel - 24, top: y - 64 }}>
          <Icon name="truck" size={48} color={COLORS.white} strokeWidth={1.8} />
        </div>
        <Label size={22} style={{ position: 'absolute', left: x0 - 140, top: y - 14 }}>
          {TEXTS.cities.dakar}
        </Label>
        <Label size={26} weight={800} style={{ position: 'absolute', left: x1 + 32, top: y - 16 }}>
          {TEXTS.cities.touba}
        </Label>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
