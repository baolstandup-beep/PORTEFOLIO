import React from 'react';
import { Img, staticFile } from 'remotion';
import { C } from '../theme';

/** Ratio exact du logo officiel (569 × 175). Jamais déformé : seule la largeur est fixée. */
export const LOGO_RATIO = 175 / 569;

/**
 * Logo officiel (public/logos/logo-graphia.png). Les lettres « RAPH » sont noires : sur fond sombre,
 * on suit la règle du site (composant Logo `light`) → logo posé sur un pavé blanc.
 * La source fait 569 px de large : on la garde ≤ 1,35× pour rester net.
 */
export const Logo: React.FC<{ width: number; pad?: boolean; style?: React.CSSProperties; reveal?: number }> = ({ width, pad = false, style, reveal = 1 }) => {
  const img = (
    <Img
      src={staticFile('logos/logo-graphia.png')}
      style={{ width, height: width * LOGO_RATIO, display: 'block', clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)` }}
    />
  );
  if (!pad) return <div style={style}>{img}</div>;
  return (
    <div style={{ background: C.paper, borderRadius: width * 0.06, padding: `${width * 0.06}px ${width * 0.08}px`, boxShadow: '0 30px 80px -20px rgba(0,0,0,0.55)', ...style }}>
      {img}
    </div>
  );
};
