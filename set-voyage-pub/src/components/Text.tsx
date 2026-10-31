import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp, springIn } from '../lib/anim';
import { FONTS } from '../theme';

/**
 * Titre révélé mot par mot (masque + montée + léger flou).
 * `delay` en frames, `stagger` entre chaque mot.
 */
export const RevealWords: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size?: number;
  color?: string;
  weight?: number;
  font?: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  highlight?: { words: string[]; color: string };
  style?: React.CSSProperties;
}> = ({
  text,
  delay = 0,
  stagger = 4,
  size = 96,
  color = '#fff',
  weight = 900,
  font = FONTS.titre,
  align = 'left',
  lineHeight = 1.05,
  highlight,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        lineHeight,
        color,
        textAlign: align,
        letterSpacing: -0.5,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        columnGap: size * 0.26,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = springIn(frame, fps, delay + i * stagger);
        const isHl = highlight?.words.includes(w.replace(/[.,!…]/g, ''));
        return (
          <span key={i} style={{ display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.08 }}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 110}%)`,
                opacity: interpolate(p, [0, 0.3], [0, 1], clamp),
                filter: `blur(${(1 - p) * 6}px)`,
                color: isHl ? highlight!.color : undefined,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Lettres qui tombent en place une à une (wordmark). */
export const RevealLetters: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  size: number;
  color: string;
  spacing?: number;
  weight?: number;
}> = ({ text, delay = 0, stagger = 2, size, color, spacing = 0, weight = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: 'flex', fontFamily: FONTS.titre, fontWeight: weight, fontSize: size, color, letterSpacing: spacing, lineHeight: 1 }}>
      {text.split('').map((c, i) => {
        const p = springIn(frame, fps, delay + i * stagger, { damping: 14, stiffness: 140 });
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              transform: `translateY(${(1 - p) * -60}px) scale(${0.6 + 0.4 * p})`,
              opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

/** Pastille (badge) qui s'étire horizontalement. */
export const Badge: React.FC<{
  children: React.ReactNode;
  delay?: number;
  bg: string;
  color: string;
  size?: number;
}> = ({ children, delay = 0, bg, color, size = 34 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, delay);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: `${size * 0.42}px ${size * 0.9}px`,
        borderRadius: 999,
        background: bg,
        color,
        fontFamily: FONTS.texte,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0 round 999px)`,
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      {children}
    </div>
  );
};
