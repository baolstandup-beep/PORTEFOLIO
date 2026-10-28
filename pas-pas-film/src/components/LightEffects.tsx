// Lumières et atmosphère : fond, halo, faisceau volumétrique, brume, vignettage, éclats.
// Tout est dessiné avec des dégradés (pas de vidéo ni d'image externe) et dépend uniquement de l'image courante.
import React from 'react';
import type {Shot} from '../camera';
import {config} from '../config';
import {BOTTLE, PODIUM, STAGE} from '../layout';

const c = config.colors;
const L = config.lights;

// Fond de scène : anthracite bleuté, légère lueur centrale, décalé par l'orbite (plan le plus lointain).
export const Backdrop: React.FC<{shot: Shot}> = ({shot}) => (
  <div
    style={{
      position: 'absolute',
      inset: -80,
      transform: `translateX(${-shot.orbit * 18 + shot.x * 0.15}px)`,
      background: `radial-gradient(ellipse 60% 70% at 50% 46%, ${c.backgroundGlow} 0%, ${c.background} 70%)`,
      opacity: 0.55 + 0.45 * shot.halo,
    }}
  />
);

// Halo derrière la bouteille : bleu et vert de l'étiquette, très diffus.
export const Halo: React.FC<{shot: Shot}> = ({shot}) => {
  const k = shot.halo * L.halo * L.master;
  const shift = -shot.orbit * 40;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: BOTTLE.cx - 620 + shift,
          top: BOTTLE.baseY - BOTTLE.height * 0.62 - 420,
          width: 1240,
          height: 840,
          background: `radial-gradient(ellipse at 50% 50%, ${hexA(c.accentBlue, 0.42 * k)} 0%, ${hexA(c.accentBlue, 0.12 * k)} 38%, rgba(0,0,0,0) 68%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: BOTTLE.cx - 380 + shift * 1.6,
          top: BOTTLE.baseY - BOTTLE.height * 0.45 - 260,
          width: 760,
          height: 520,
          background: `radial-gradient(ellipse at 50% 60%, ${hexA(c.accentGreen, 0.22 * k)} 0%, rgba(0,0,0,0) 65%)`,
          mixBlendMode: 'screen',
        }}
      />
      {/* Cœur lumineux, juste derrière le produit : il traverse le plastique transparent. */}
      <div
        style={{
          position: 'absolute',
          left: BOTTLE.cx - 230 + shift * 0.5,
          top: BOTTLE.baseY - BOTTLE.height * 0.6 - 300,
          width: 460,
          height: 600,
          background: `radial-gradient(ellipse at 50% 50%, rgba(${c.beam},${0.5 * k}) 0%, rgba(${c.beam},${0.12 * k}) 40%, rgba(0,0,0,0) 70%)`,
        }}
      />
    </>
  );
};

// Faisceau volumétrique tombant sur le socle.
export const Beam: React.FC<{shot: Shot; frame: number}> = ({shot, frame}) => {
  const k = shot.beam * L.beam * L.master;
  if (k <= 0.001) return null;
  const flicker = 1 + 0.03 * Math.sin(frame * 0.21) + 0.02 * Math.sin(frame * 0.077 + 1.3);
  // Le flou est porté par un parent : appliqué au même élément que clip-path, il serait recoupé net.
  const cone = (topW: number, bottomW: number, alpha: number, blur: number) => (
    <div style={{position: 'absolute', inset: 0, filter: `blur(${blur}px)`}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: -140,
          width: STAGE.width,
          height: PODIUM.topY + 180,
          clipPath: `polygon(${STAGE.cx - topW / 2}px 0, ${STAGE.cx + topW / 2}px 0, ${STAGE.cx + bottomW / 2}px 100%, ${STAGE.cx - bottomW / 2}px 100%)`,
          background: `linear-gradient(to bottom, rgba(${c.beam},${alpha * k * flicker}) 0%, rgba(${c.beam},${alpha * 0.45 * k}) 55%, rgba(${c.beam},${alpha * 0.15 * k}) 100%)`,
        }}
      />
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${-shot.orbit * 25}px)`, mixBlendMode: 'screen'}}>
      {cone(260, 820, 0.16, 40)}
      {cone(120, 480, 0.2, 18)}
      {cone(40, 220, 0.18, 8)}
      {/* Tache de lumière sur le plateau. */}
      <div
        style={{
          position: 'absolute',
          left: PODIUM.cx - PODIUM.rx * 0.9,
          top: PODIUM.topY - PODIUM.ry * 0.9,
          width: PODIUM.rx * 1.8,
          height: PODIUM.ry * 1.8,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 50% 50%, rgba(${c.beam},${0.32 * k}) 0%, rgba(0,0,0,0) 70%)`,
        }}
      />
    </div>
  );
};

// Brume : grandes nappes floues qui dérivent lentement (déterministe).
export const Haze: React.FC<{shot: Shot; frame: number; depth: 'back' | 'front'}> = ({shot, frame, depth}) => {
  const k = shot.haze * L.master * (depth === 'front' ? 0.45 : 1);
  const blobs = depth === 'back' ? [[0.22, 0.62, 900, 0], [0.78, 0.58, 1000, 2.1], [0.5, 0.82, 1400, 4.2]] : [[0.3, 0.95, 1200, 1.1], [0.75, 0.9, 1100, 3.3]];
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${-shot.orbit * (depth === 'front' ? 70 : 30)}px)`}}>
      {blobs.map(([x, y, size, phase], i) => {
        const dx = Math.sin(frame / 160 + phase) * 60 * config.motion.particleSpeed;
        const dy = Math.cos(frame / 210 + phase) * 20 * config.motion.particleSpeed;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x * STAGE.width - size / 2 + dx,
              top: y * STAGE.height - size * 0.25 + dy,
              width: size,
              height: size * 0.5,
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 50% 50%, rgba(120,150,210,${0.075 * k}) 0%, rgba(0,0,0,0) 70%)`,
            }}
          />
        );
      })}
    </div>
  );
};

// Vignettage discret (cadre cinéma).
export const Vignette: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse 75% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
      pointerEvents: 'none',
    }}
  />
);

// Éclat en étoile, bref, pour ponctuer un instant (dévoilement, finale).
export const Glint: React.FC<{x: number; y: number; frame: number; at: number; size?: number}> = ({x, y, frame, at, size = 120}) => {
  if (!config.effects.glints) return null;
  const t = (frame - at) / 22;
  if (t < -1 || t > 1) return null;
  const k = Math.cos((t * Math.PI) / 2) ** 2;
  const s = size * (0.6 + 0.4 * k);
  const ray = (rot: number, len: number) => (
    <div
      style={{
        position: 'absolute',
        left: -len / 2,
        top: -1,
        width: len,
        height: 2,
        transform: `rotate(${rot}deg)`,
        background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,${0.9 * k}) 50%, rgba(255,255,255,0) 100%)`,
      }}
    />
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, mixBlendMode: 'screen'}}>
      {ray(0, s * 2)}
      {ray(90, s * 1.3)}
      {ray(45, s * 0.5)}
      {ray(-45, s * 0.5)}
      <div
        style={{
          position: 'absolute',
          left: -s * 0.25,
          top: -s * 0.25,
          width: s * 0.5,
          height: s * 0.5,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255,255,255,${k}) 0%, rgba(${c.beam},${0.4 * k}) 25%, rgba(0,0,0,0) 70%)`,
        }}
      />
    </div>
  );
};

function hexA(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, alpha))})`;
}
