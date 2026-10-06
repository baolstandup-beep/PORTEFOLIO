import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS, FONTS, TEXTS, TYPE } from '../config/setrans.config';
import { Particles } from '../components/Base';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

/** Logo typographique de secours (utilisé si aucun fichier logo n'est fourni). */
const TypeLogo: React.FC = () => (
  <div
    style={{
      fontFamily: FONTS.title,
      fontWeight: 800,
      fontSize: TYPE.logo,
      letterSpacing: '0.14em',
      paddingLeft: '0.14em',
      lineHeight: 1,
      color: COLORS.blue,
    }}
  >
    {TEXTS.brand}
  </div>
);

/**
 * SCÈNE 16 — Révélation finale : logo officiel SETRANS sur fond clair
 * (ses couleurs gris / bleu y restent fidèles), puis signature. Maintien ~2 s.
 */
export const S16Logo: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const logo = progress(f, 0.0, 1.1, EASE.out);
  const rule = progress(f, 0.8, 1.5, EASE.inOut);
  const l1 = progress(f, 0.95, 1.45, EASE.out);
  const l2 = progress(f, 1.35, 1.85, EASE.out);
  const glow = progress(f, 0, 1.8, EASE.soft);
  const drift = progress(f, 0, 4, EASE.soft);
  const line = (t: number): React.CSSProperties => ({
    opacity: t,
    transform: `translateY(${(1 - t) * 14}px)`,
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 70% 65% at 50% 42%, ${COLORS.white} 0%, ${COLORS.white} 35%, ${COLORS.greyLight} 100%)`,
      }}
    >
      {/* Halo bleu très léger derrière le logo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 34% 26% at 50% 40%, rgba(28,63,136,${0.1 * glow}) 0%, rgba(28,63,136,0) 100%)`,
        }}
      />
      <AbsoluteFill style={{ opacity: 0.5 }}>
        <Particles count={30} seed={5} color={COLORS.blueLight} opacity={0.35} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div
          style={{
            opacity: logo,
            transform: `scale(${(0.92 + 0.08 * logo) * (1 + 0.015 * drift)})`,
            filter: `blur(${(1 - logo) * 14}px) drop-shadow(0 18px 40px rgba(11,26,58,${0.12 * logo}))`,
            marginTop: -40,
          }}
        >
          {ASSETS.logo ? (
            <Img src={staticFile(ASSETS.logo)} style={{ height: 560, objectFit: 'contain' }} />
          ) : (
            <TypeLogo />
          )}
        </div>
        <div
          style={{
            width: 560 * rule,
            height: 2,
            background: `linear-gradient(90deg, rgba(28,63,136,0), ${COLORS.blue}, rgba(28,63,136,0))`,
            margin: '26px 0 26px',
          }}
        />
        <div
          style={{
            ...line(l1),
            fontFamily: FONTS.title,
            fontWeight: 700,
            fontSize: TYPE.subtitle + 8,
            letterSpacing: '0.04em',
            color: COLORS.navy,
          }}
        >
          {TEXTS.tagline}
        </div>
        <div
          style={{
            ...line(l2),
            fontFamily: FONTS.body,
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: TYPE.subtitle - 4,
            letterSpacing: '0.04em',
            color: COLORS.blue,
            marginTop: 16,
          }}
        >
          {TEXTS.slogan}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
