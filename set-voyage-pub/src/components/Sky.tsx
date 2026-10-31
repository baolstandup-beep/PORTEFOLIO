import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COULEURS } from '../theme';

/** Nuage doux construit en CSS (aucune image requise). */
export const Cloud: React.FC<{
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
  blur?: number;
}> = ({ x, y, scale = 1, opacity = 1, blur = 0 }) => {
  const puffs = [
    { l: 0, t: 60, s: 170 },
    { l: 90, t: 10, s: 230 },
    { l: 230, t: 40, s: 190 },
    { l: 330, t: 80, s: 140 },
    { l: 60, t: 95, s: 300, w: 360, h: 120 },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 480,
        height: 240,
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        opacity,
        filter: `blur(${blur}px) drop-shadow(0 18px 24px rgba(30, 80, 150, 0.18))`,
      }}
    >
      {puffs.map((p, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: p.l,
            top: p.t,
            width: p.w ?? p.s,
            height: p.h ?? p.s,
            borderRadius: 999,
            background:
              'radial-gradient(circle at 40% 35%, #ffffff 0%, #ffffff 55%, #e6f1fb 80%, #cfe2f5 100%)',
          }}
        />
      ))}
    </div>
  );
};

type Layer = { y: number; scale: number; speed: number; opacity: number; blur: number; offset: number };

const LAYERS: Layer[] = [
  { y: 260, scale: 0.55, speed: 0.6, opacity: 0.75, blur: 2, offset: 0 },
  { y: 760, scale: 0.8, speed: 1.2, opacity: 0.9, blur: 1, offset: 380 },
  { y: 1300, scale: 1.15, speed: 2.2, opacity: 1, blur: 0, offset: 140 },
  { y: 1650, scale: 1.6, speed: 3.6, opacity: 1, blur: 3, offset: 620 },
];

/**
 * Ciel animé : dégradé + halo solaire + 4 couches de nuages en parallaxe.
 * `drift` multiplie la vitesse de défilement (caméra), `tint` assombrit/éclaircit.
 */
export const Sky: React.FC<{
  drift?: number;
  sun?: { x: number; y: number } | null;
  top?: string;
  bottom?: string;
  cloudOpacity?: number;
  layers?: number[];
}> = ({
  drift = 1,
  sun = { x: 820, y: 360 },
  top = COULEURS.bleu,
  bottom = COULEURS.cielClair,
  cloudOpacity = 1,
  layers = [0, 1, 2, 3],
}) => {
  const frame = useCurrentFrame();
  const span = 1080 + 900;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${COULEURS.bleuCiel} 55%, ${bottom} 100%)` }}>
      {sun && (
        <div
          style={{
            position: 'absolute',
            left: sun.x - 450,
            top: sun.y - 450,
            width: 900,
            height: 900,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(255,236,150,0.95) 0%, rgba(255,216,77,0.45) 22%, rgba(255,216,77,0.12) 45%, rgba(255,216,77,0) 70%)',
          }}
        />
      )}
      {layers.map((li) => {
        const l = LAYERS[li];
        return [0, 1].map((k) => {
          const raw = l.offset + k * (span / 2) - frame * l.speed * drift;
          const x = (((raw % span) + span) % span) - 600;
          return (
            <Cloud
              key={`${li}-${k}`}
              x={x}
              y={l.y + (k ? 90 : 0)}
              scale={l.scale}
              opacity={l.opacity * cloudOpacity}
              blur={l.blur}
            />
          );
        });
      })}
    </AbsoluteFill>
  );
};
