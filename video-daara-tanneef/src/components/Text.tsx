import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from './anim';
import {C, FONT} from '../theme';

type Base = {
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  charStyle?: (i: number) => React.CSSProperties | undefined;
};

/** Apparition lettre par lettre : montée, rotation 3D et défloutage. */
export const Letters: React.FC<Base & {from?: 'bottom' | 'top'}> = ({
  text,
  delay = 0,
  stagger = 2.5,
  style,
  charStyle,
  from = 'bottom',
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{fontFamily: FONT, display: 'flex', justifyContent: 'center', perspective: 900, whiteSpace: 'pre', ...style}}>
      {text.split('').map((ch, i) => {
        const s = spring({frame: f - delay - i * stagger, fps, config: {damping: 13, mass: 0.7, stiffness: 150}});
        const blur = interpolate(s, [0, 1], [14, 0], clamp);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
              transform: `translateY(${(1 - s) * (from === 'bottom' ? 90 : -90)}px) rotateX(${(1 - s) * 80}deg)`,
              filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
              ...charStyle?.(i),
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** Apparition mot par mot avec léger glissement. */
export const Words: React.FC<Base & {highlight?: string[]; highlightColor?: string}> = ({
  text,
  delay = 0,
  stagger = 5,
  style,
  highlight = [],
  highlightColor = C.goldLight,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{fontFamily: FONT, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.28em', ...style}}>
      {text.split(' ').map((w, i) => {
        const s = spring({frame: f - delay - i * stagger, fps, config: {damping: 16, mass: 0.6, stiffness: 120}});
        const blur = interpolate(s, [0, 1], [10, 0], clamp);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: interpolate(s, [0, 0.5], [0, 1], clamp),
              transform: `translateY(${(1 - s) * 40}px) scale(${0.9 + s * 0.1})`,
              filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
              color: highlight.includes(w) ? highlightColor : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Reflet doré qui balaie un texte (même texte superposé, masqué par un dégradé mobile). */
export const Shine: React.FC<{
  children: React.ReactNode;
  at: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({children, at, dur = 26, style}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [-40, 140], clamp);
  return (
    <div style={{position: 'relative', ...style}}>
      {children}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          WebkitMaskImage: `linear-gradient(105deg, transparent ${p - 18}%, black ${p}%, transparent ${p + 18}%)`,
          maskImage: `linear-gradient(105deg, transparent ${p - 18}%, black ${p}%, transparent ${p + 18}%)`,
          pointerEvents: 'none',
        }}
      >
        <div style={{color: C.goldLight, filter: 'drop-shadow(0 0 18px rgba(241,212,122,0.9))'}}>{children}</div>
      </div>
    </div>
  );
};

/** Filet doré qui se dessine depuis le centre. */
export const GoldRule: React.FC<{at: number; width?: number; dur?: number; thickness?: number; style?: React.CSSProperties}> = ({
  at,
  width = 420,
  dur = 22,
  thickness = 4,
  style,
}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  return (
    <div
      style={{
        width: width * p,
        height: thickness,
        margin: '0 auto',
        background: `linear-gradient(90deg, rgba(201,162,39,0), ${C.gold} 20%, ${C.goldLight} 50%, ${C.gold} 80%, rgba(201,162,39,0))`,
        boxShadow: '0 0 14px rgba(241,212,122,0.6)',
        ...style,
      }}
    />
  );
};
