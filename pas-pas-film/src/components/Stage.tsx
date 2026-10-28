// Plateau commun : empile fond, lumières, socle, produit, particules et habillage selon l'état de caméra.
// Chaque scène fournit ses propres éléments (textes, gouttes, éclats) via les emplacements prévus.
import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import type {Shot} from '../camera';
import {config} from '../config';
import {STAGE} from '../layout';
import {Backdrop, Beam, Halo, Haze, Vignette} from './LightEffects';
import {Particles} from './Particles';
import {Podium} from './Podium';
import {ProductBottle} from './ProductBottle';

type Props = {
  shot: Shot;
  frame: number; // image globale
  onProduct?: React.ReactNode; // collé au produit (gouttes)
  inWorld?: React.ReactNode; // dans le décor, devant la bouteille (éclats)
  overlay?: React.ReactNode; // à l'écran, hors caméra (textes lisibles)
};

export const Stage: React.FC<Props> = ({shot, frame, onProduct, inWorld, overlay}) => {
  const {width} = useVideoConfig();
  const k = width / STAGE.width;
  const world = `translate(${shot.x}px, ${shot.y}px) scale(${shot.zoom})`;
  return (
    <AbsoluteFill style={{backgroundColor: config.colors.background, overflow: 'hidden'}}>
      <div style={{position: 'absolute', width: STAGE.width, height: STAGE.height, transform: `scale(${k})`, transformOrigin: '0 0'}}>
        <Backdrop shot={shot} />
        <Haze shot={shot} frame={frame} depth="back" />
        <div style={{position: 'absolute', inset: 0, transform: world, transformOrigin: `${STAGE.cx}px ${STAGE.cy}px`}}>
          <Halo shot={shot} />
          <Beam shot={shot} frame={frame} />
          <Podium shot={shot} />
          <ProductBottle shot={shot}>{onProduct}</ProductBottle>
          {inWorld}
        </div>
        <Particles shot={shot} frame={frame} />
        <Haze shot={shot} frame={frame} depth="front" />
        <Vignette />
        {overlay}
        <AbsoluteFill style={{backgroundColor: '#000', opacity: 1 - shot.fade}} />
      </div>
    </AbsoluteFill>
  );
};
