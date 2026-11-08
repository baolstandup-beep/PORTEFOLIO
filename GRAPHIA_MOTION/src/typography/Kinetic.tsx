import React from 'react';
import { EASE, FONT } from '../theme';
import { prog, lerp } from '../utils/anim';

type Props = {
  text: string;
  t: number; // temps local (s)
  at: number; // début de l'entrée
  size: number;
  color?: string;
  weight?: number;
  stagger?: number; // s entre deux mots
  dur?: number;
  /** mots (index) mis en couleur d'accent */
  accent?: Record<number, string>;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  tracking?: number;
  maxWidth?: number;
  outAt?: number; // sortie
  mode?: 'rise' | 'slam' | 'mask';
  style?: React.CSSProperties;
};

/**
 * Typographie cinétique « à la GRAPHIA » : chaque mot monte avec un flou qui se résout
 * (même grammaire que .hero-word du site), en version « slam » (échelle + flou de bougé) ou « mask » (rideau).
 */
export const Kinetic: React.FC<Props> = ({
  text, t, at, size, color = '#fff', weight = 800, stagger = 0.07, dur = 0.7, accent = {}, align = 'center',
  lineHeight = 1.02, tracking = -0.02, maxWidth, outAt, mode = 'rise', style,
}) => {
  const words = text.split(' ');
  const out = outAt !== undefined ? prog(t, outAt, 0.35, EASE.inOut) : 0;
  return (
    <div
      style={{
        fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight, letterSpacing: `${tracking}em`,
        color, textAlign: align, maxWidth, display: 'flex', flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        columnGap: size * 0.26, ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(t, at + i * stagger, dur, mode === 'slam' ? EASE.out : EASE.out);
        let transform = '';
        let filter = '';
        let opacity = p;
        let clip: string | undefined;
        if (mode === 'rise') {
          transform = `translateY(${lerp(0.5, 0, p)}em) rotate(${lerp(2, 0, p)}deg)`;
          filter = `blur(${lerp(8, 0, p)}px)`;
        } else if (mode === 'slam') {
          const s = lerp(1.6, 1, p);
          transform = `scale(${s}) translateY(${lerp(-0.15, 0, p)}em)`;
          filter = `blur(${lerp(14, 0, Math.min(1, p * 1.4))}px)`;
          opacity = Math.min(1, p * 2.2);
        } else {
          clip = `inset(${lerp(100, -10, p)}% -10% -10% -10%)`;
          transform = `translateY(${lerp(0.35, 0, p)}em)`;
          opacity = 1;
        }
        const op = opacity * (1 - out);
        const outT = out > 0 ? ` translateY(${-out * 0.35}em)` : '';
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', color: accent[i] ?? color, transform: transform + outT,
              filter: out > 0 ? `blur(${out * 8}px)` : filter, opacity: op, clipPath: clip, willChange: 'transform',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
