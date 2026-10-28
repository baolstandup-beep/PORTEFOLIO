// La bouteille originale (PNG extrait du fichier source) et ses lumières propres.
// Aucune déformation : seule la caméra (parent) bouge ; la bouteille n'est ni étirée ni tournée.
// Le volume est suggéré par des calques de lumière masqués par la silhouette exacte du produit.
import React from 'react';
import {Img, staticFile} from 'remotion';
import type {Shot} from '../camera';
import {config} from '../config';
import {BOTTLE} from '../layout';

const scale = BOTTLE.height / (config.assets.bottleHeight - 2 * config.assets.bottlePadding);
export const IMG_W = config.assets.bottleWidth * scale;
export const IMG_H = config.assets.bottleHeight * scale;
const PAD = config.assets.bottlePadding * scale;

// Boîte de l'image dans le repère du plateau (le culot repose exactement sur BOTTLE.baseY).
export const bottleBox = {
  left: BOTTLE.cx - IMG_W / 2,
  top: BOTTLE.baseY + PAD - IMG_H,
  width: IMG_W,
  height: IMG_H,
};

const mask = (src: string): React.CSSProperties => ({
  WebkitMaskImage: `url(${staticFile(src)})`,
  WebkitMaskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskImage: `url(${staticFile(src)})`,
  maskSize: '100% 100%',
  maskRepeat: 'no-repeat',
});

export const ProductBottle: React.FC<{shot: Shot; children?: React.ReactNode}> = ({shot, children}) => {
  const L = config.lights;
  const wipe = shot.reveal * 125 - 25; // bord du balayage, en % de la hauteur, du bas vers le haut
  const revealMask = `linear-gradient(to top, #000 ${wipe}%, rgba(0,0,0,0) ${wipe + 25}%)`;
  // Les reflets glissent avec l'orbite simulée, comme si la caméra tournait autour du produit.
  const sweepX = 50 + shot.orbit * 42;
  const rimLeft = 0.55 - shot.orbit * 0.45;
  const rimRight = 0.55 + shot.orbit * 0.45;

  return (
    <div style={{position: 'absolute', ...bottleBox}}>
      {/* Ombre chinoise : la bouteille découpée contre la lumière avant d'être éclairée. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#010207',
          opacity: shot.silhouette * (1 - shot.reveal * 0.85),
          ...mask(config.assets.bottleSilhouette),
        }}
      />
      {/* Produit original, révélé par un balayage lumineux puis éclairé par la lumière principale. */}
      <Img
        src={staticFile(config.assets.bottle)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          WebkitMaskImage: revealMask,
          maskImage: revealMask,
          filter: `brightness(${0.42 + 0.58 * shot.key}) contrast(${1 + 0.06 * shot.key})`,
        }}
      />
      {/* Bord lumineux du balayage pendant la révélation. */}
      {shot.reveal > 0 && shot.reveal < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(to top, rgba(255,255,255,0) ${wipe - 2}%, rgba(${config.colors.beam},0.55) ${wipe + 10}%, rgba(255,255,255,0) ${wipe + 24}%)`,
            mixBlendMode: 'screen',
            ...mask(config.assets.bottleSilhouette),
          }}
        />
      ) : null}
      {/* Reflet spéculaire vertical qui suit l'orbite (simule la rotation de la lumière autour du produit). */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.38 * shot.key * L.specular * L.master,
          background: `linear-gradient(100deg, rgba(255,255,255,0) ${sweepX - 14}%, rgba(255,255,255,0.75) ${sweepX - 2}%, rgba(255,255,255,0.9) ${sweepX}%, rgba(255,255,255,0) ${sweepX + 9}%)`,
          mixBlendMode: 'soft-light',
          ...mask(config.assets.bottleSilhouette),
        }}
      />
      {/* Liseré de contre-jour, plus fort du côté de la lumière. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: shot.rim * L.rim * L.master,
          background: `linear-gradient(90deg, rgba(${config.colors.beam},${rimLeft}) 0%, rgba(${config.colors.beam},0.25) 50%, rgba(${config.colors.beam},${rimRight}) 100%)`,
          mixBlendMode: 'screen',
          ...mask(config.assets.bottleRim),
        }}
      />
      {children}
    </div>
  );
};

// Reflet du produit sur le socle laqué : image retournée, très atténuée et estompée.
export const BottleReflection: React.FC<{shot: Shot}> = ({shot}) => {
  if (!config.effects.reflection) return null;
  // Symétrie autour du culot ; le fondu ne garde que le bas de la bouteille.
  const fadeMask = 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 9%)';
  return (
    <div
      style={{
        position: 'absolute',
        ...bottleBox,
        transform: 'scaleY(-1)',
        transformOrigin: `50% ${IMG_H - PAD}px`,
        opacity: 0.22 * shot.key * shot.reveal * config.lights.reflection,
      }}
    >
      <Img
        src={staticFile(config.assets.bottle)}
        style={{width: '100%', height: '100%', WebkitMaskImage: fadeMask, maskImage: fadeMask, filter: 'blur(1.5px) brightness(0.8)'}}
      />
    </div>
  );
};
