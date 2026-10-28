// Socle cylindrique sombre et laqué, avec reflet du produit et ombre de contact.
import React from 'react';
import type {Shot} from '../camera';
import {config} from '../config';
import {BOTTLE, PODIUM} from '../layout';
import {BottleReflection} from './ProductBottle';

export const Podium: React.FC<{shot: Shot}> = ({shot}) => {
  const {cx, topY, rx, ry, depth} = PODIUM;
  const c = config.colors;
  const lit = shot.key;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: shot.podium}}>
      {/* Flanc : ombrage de cylindre, plus clair au centre. */}
      <div
        style={{
          position: 'absolute',
          left: cx - rx,
          top: topY,
          width: rx * 2,
          height: depth + ry,
          borderRadius: `0 0 ${rx}px ${rx}px / 0 0 ${ry}px ${ry}px`,
          background: `linear-gradient(90deg, #020409 0%, ${c.podiumSide} 18%, #141c2e 50%, ${c.podiumSide} 82%, #020409 100%)`,
          boxShadow: '0 40px 80px rgba(0,0,0,0.65)',
        }}
      />
      {/* Filet de lumière sur l'arête basse. */}
      <div
        style={{
          position: 'absolute',
          left: cx - rx,
          top: topY + depth - ry,
          width: rx * 2,
          height: ry * 2,
          borderRadius: '50%',
          borderBottom: `1px solid rgba(${c.beam},${0.1 + 0.12 * lit})`,
        }}
      />
      {/* Plateau. */}
      <div
        style={{
          position: 'absolute',
          left: cx - rx,
          top: topY - ry,
          width: rx * 2,
          height: ry * 2,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 50% 35%, #263250 0%, ${c.podiumTop} 55%, #070b14 100%)`,
          boxShadow: `inset 0 1px 0 rgba(${c.beam},${0.25 + 0.3 * lit}), inset 0 -6px 14px rgba(0,0,0,0.6)`,
          overflow: 'hidden',
        }}
      />
      {/* Reflet du produit, découpé à la forme du plateau. */}
      <div style={{position: 'absolute', inset: 0, clipPath: `ellipse(${rx - 2}px ${ry - 1}px at ${cx}px ${topY}px)`}}>
        <BottleReflection shot={shot} />
      </div>
      {/* Ombre de contact sous le culot. */}
      <div
        style={{
          position: 'absolute',
          left: BOTTLE.cx - BOTTLE.width * 0.62,
          top: BOTTLE.baseY - 12,
          width: BOTTLE.width * 1.24,
          height: 26,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0) 72%)',
        }}
      />
    </div>
  );
};
