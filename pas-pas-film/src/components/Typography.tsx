// Typographie animée : nom de marque en tête d'écran, accroche, lignes du tableau final.
// Le nom n'est jamais placé derrière la bouteille : le produit masquerait le trait d'union de PAS-PAS.
import React from 'react';
import {Easing, interpolate} from 'remotion';
import {config} from '../config';
import {STAGE} from '../layout';
import {progress} from '../lib/motion';

const c = config.colors;
export const FONT_SANS = 'Montserrat, sans-serif';
export const FONT_SERIF = '"Cormorant Garamond", serif';

// Nom de marque, lettre par lettre : fondu, montée, mise au point, resserrement de l'interlettrage.
export const Wordmark: React.FC<{frame: number; at: number; y?: number; size?: number}> = ({frame, at, y = 70, size = 170}) => {
  if (!config.text.showTitle) return null;
  const letters = [...config.text.title];
  const tracking = interpolate(frame, [at, at + 60], [0.5, 0.16], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: STAGE.width,
        top: y,
        height: size * 1.1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONT_SANS,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: `${tracking}em`,
        paddingLeft: `${tracking}em`, // compense l'espace ajouté après la dernière lettre
        boxSizing: 'border-box',
        filter: 'drop-shadow(0 6px 30px rgba(0,0,0,0.6))',
      }}
    >
      {letters.map((ch, i) => {
        const p = progress(frame, at + i * 4, at + i * 4 + 26, Easing.out(Easing.cubic));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * -34}px)`,
              filter: `blur(${(1 - p) * 14}px)`,
              backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(214,226,250,0.88) 55%, rgba(150,170,215,0.55) 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

// Ligne de texte à l'écran (hors caméra), apparition par fondu et léger déplacement vertical.
export const Line: React.FC<{
  frame: number;
  at: number;
  out?: number;
  y: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({frame, at, out, y, children, style}) => {
  const p = progress(frame, at, at + 24, Easing.out(Easing.cubic));
  const q = out === undefined ? 0 : progress(frame, out, out + 16);
  const o = p * (1 - q);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width: STAGE.width,
        top: y,
        textAlign: 'center',
        transform: `translateY(${(1 - p) * 18 - q * 8}px)`,
        opacity: o,
        filter: `blur(${(1 - p) * 6}px)`,
        color: c.text,
        textShadow: '0 2px 18px rgba(0,0,0,0.65)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Filet lumineux qui se déploie depuis le centre.
export const Rule: React.FC<{frame: number; at: number; y: number; width?: number}> = ({frame, at, y, width = 220}) => {
  const p = progress(frame, at, at + 30, Easing.inOut(Easing.cubic));
  return (
    <div
      style={{
        position: 'absolute',
        left: STAGE.cx - (width * p) / 2,
        top: y,
        width: width * p,
        height: 2,
        background: `linear-gradient(90deg, rgba(0,0,0,0), ${c.accentBlue} 25%, ${c.accentGreen} 75%, rgba(0,0,0,0))`,
        opacity: 0.9,
      }}
    />
  );
};
