import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS, FONTS, TEXTS, TYPE } from '../config/setrans.config';
import { Particles } from '../components/Base';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

/** Logo typographique de secours (utilisé tant qu'aucun fichier logo n'est fourni). */
const TypeLogo: React.FC<{ sweep: number }> = ({ sweep }) => (
  <div style={{ position: 'relative' }}>
    <div
      style={{
        fontFamily: FONTS.title,
        fontWeight: 800,
        fontSize: TYPE.logo,
        letterSpacing: '0.14em',
        paddingLeft: '0.14em',
        lineHeight: 1,
        backgroundImage: `linear-gradient(100deg, ${COLORS.white} 0%, ${COLORS.white} ${sweep * 100 - 12}%, #CFE0FF ${sweep * 100}%, ${COLORS.white} ${sweep * 100 + 12}%, ${COLORS.white} 100%)`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
    >
      {TEXTS.brand}
    </div>
  </div>
);

/** SCÈNE 16 — Révélation finale du logo + signature. Maintien ~2 s. */
export const S16Logo: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const logo = progress(f, 0.0, 1.0, EASE.out);
  const sweep = progress(f, 0.4, 1.6, EASE.inOut);
  const rule = progress(f, 0.6, 1.3, EASE.inOut);
  const l1 = progress(f, 0.7, 1.2, EASE.out);
  const l2 = progress(f, 1.05, 1.55, EASE.out);
  const l3 = progress(f, 1.4, 1.9, EASE.out);
  const glow = progress(f, 0, 1.6, EASE.soft);
  const line = (t: number): React.CSSProperties => ({
    opacity: t,
    transform: `translateY(${(1 - t) * 14}px)`,
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 55% 50% at 50% 42%, rgba(28,63,136,${0.75 * glow}) 0%, ${COLORS.navy} 55%, ${COLORS.night} 100%)`,
      }}
    >
      <Particles count={40} seed={5} opacity={0.25} />
      {/* Lumière derrière le logo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 30% 18% at 50% 40%, rgba(160,190,255,${0.28 * glow}) 0%, rgba(160,190,255,0) 100%)`,
        }}
      />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div
          style={{
            opacity: logo,
            transform: `scale(${0.94 + 0.06 * logo})`,
            filter: `blur(${(1 - logo) * 12}px)`,
            marginTop: -60,
          }}
        >
          {ASSETS.logo ? (
            <Img src={staticFile(ASSETS.logo)} style={{ height: 300, objectFit: 'contain' }} />
          ) : (
            <TypeLogo sweep={sweep} />
          )}
        </div>
        <div style={{ width: 640 * rule, height: 2, background: `linear-gradient(90deg, rgba(127,162,232,0), ${COLORS.blueGlow}, rgba(127,162,232,0))`, margin: '34px 0 30px' }} />
        <div style={{ ...line(l1), fontFamily: FONTS.title, fontWeight: 700, fontSize: TYPE.subtitle + 4, letterSpacing: '0.3em', color: COLORS.white }}>
          {TEXTS.tagline}
        </div>
        <div style={{ ...line(l2), fontFamily: FONTS.title, fontWeight: 500, fontSize: TYPE.label, letterSpacing: '0.34em', color: COLORS.blueGlow, marginTop: 22 }}>
          {TEXTS.polesLine}
        </div>
        <div style={{ ...line(l3), fontFamily: FONTS.body, fontWeight: 300, fontStyle: 'italic', fontSize: TYPE.subtitle, letterSpacing: '0.04em', color: COLORS.greyLight, marginTop: 36 }}>
          {TEXTS.slogan}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
