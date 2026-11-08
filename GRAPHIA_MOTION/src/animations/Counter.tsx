import React from 'react';
import { EASE } from '../theme';
import { prog } from '../utils/anim';

/** Compteur 0 → valeur (chiffres tabulaires pour éviter que le nombre « danse »). */
export const Counter: React.FC<{ t: number; at: number; to: number; dur?: number; style?: React.CSSProperties; suffix?: React.ReactNode }> = ({ t, at, to, dur = 1.0, style, suffix }) => {
  const p = prog(t, at, dur, EASE.out);
  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {Math.round(to * p)}
      {suffix}
    </span>
  );
};

/** Rouleau de chiffres (machine à sous) qui se pose sur `to` avec un léger rebond. */
export const DigitRoll: React.FC<{ t: number; at: number; to: number; size: number; color: string; dur?: number }> = ({ t, at, to, size, color, dur = 0.9 }) => {
  const p = prog(t, at, dur, EASE.back);
  const y = -p * to * size;
  return (
    <span style={{ display: 'inline-block', height: size, overflow: 'hidden', verticalAlign: 'top', lineHeight: `${size}px` }}>
      <span style={{ display: 'block', transform: `translateY(${y}px)`, color }}>
        {Array.from({ length: to + 1 }, (_, i) => (
          <span key={i} style={{ display: 'block', height: size }}>
            {i}
          </span>
        ))}
      </span>
    </span>
  );
};
