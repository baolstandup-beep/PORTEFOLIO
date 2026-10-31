import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { AGENCE, MEDIAS } from '../config';
import { clamp, springIn, springPop } from '../lib/anim';
import { COULEURS, FONTS } from '../theme';
import { RevealLetters } from './Text';

/** Rayons de soleil tournants derrière le logo. */
export const SunRays: React.FC<{ size: number; opacity?: number; color?: string }> = ({ size, opacity = 1, color = COULEURS.jauneClair }) => {
  const frame = useCurrentFrame();
  const rays = 18;
  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      style={{ position: 'absolute', transform: `rotate(${frame * 0.35}deg)`, opacity }}
    >
      <defs>
        <radialGradient id="rayfade">
          <stop offset="0.2" stopColor={color} stopOpacity="0.55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {Array.from({ length: rays }).map((_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const b = a + Math.PI / rays / 1.6;
        return (
          <path
            key={i}
            d={`M0 0 L${Math.cos(a) * 100} ${Math.sin(a) * 100} L${Math.cos(b) * 100} ${Math.sin(b) * 100}Z`}
            fill="url(#rayfade)"
          />
        );
      })}
    </svg>
  );
};

/**
 * Logo animé : emblème (fichier remplaçable) + wordmark généré.
 * `layout="stack"` = emblème au-dessus, `"row"` = côte à côte.
 */
export const Logo: React.FC<{
  delay?: number;
  emblem?: number;
  layout?: 'stack' | 'row';
  textColor?: string;
  accentColor?: string;
  showTagline?: boolean;
  rays?: boolean;
}> = ({ delay = 0, emblem = 360, layout = 'stack', textColor = '#fff', accentColor = COULEURS.jaune, showTagline = true, rays = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = springPop(frame, fps, delay);
  const spin = interpolate(springIn(frame, fps, delay), [0, 1], [-140, 0]);
  const [mot1, ...reste] = AGENCE.nom.split(' ');
  const mot2 = reste.join(' ');
  const textSize = layout === 'stack' ? emblem * 0.42 : emblem * 0.5;
  const tagP = springIn(frame, fps, delay + 30);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: layout === 'stack' ? 'column' : 'row',
        alignItems: 'center',
        gap: layout === 'stack' ? 34 : 30,
      }}
    >
      <div style={{ position: 'relative', width: emblem, height: emblem, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {rays && <SunRays size={emblem * 2.6} opacity={interpolate(pop, [0, 1], [0, 0.9], clamp)} />}
        <Img
          src={staticFile(MEDIAS.logo)}
          style={{
            width: emblem,
            height: emblem,
            objectFit: 'contain',
            transform: `scale(${pop}) rotate(${spin}deg)`,
            filter: 'drop-shadow(0 24px 40px rgba(6,26,64,0.4))',
          }}
        />
      </div>
      {!MEDIAS.logoContientTexte && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: layout === 'stack' ? 'center' : 'flex-start' }}>
          <div style={{ display: 'flex', gap: textSize * 0.3, alignItems: 'baseline' }}>
            <RevealLetters text={mot1} size={textSize} color={textColor} delay={delay + 8} spacing={4} />
            <RevealLetters text={mot2} size={textSize} color={accentColor} delay={delay + 14} spacing={4} />
          </div>
          {showTagline && (
            <div
              style={{
                marginTop: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                opacity: tagP,
                transform: `translateY(${(1 - tagP) * 20}px)`,
              }}
            >
              <div style={{ height: 3, width: 70 * tagP, background: COULEURS.rouge, borderRadius: 2 }} />
              <span
                style={{
                  fontFamily: FONTS.texte,
                  fontWeight: 600,
                  fontSize: textSize * 0.26,
                  letterSpacing: textSize * 0.05,
                  textTransform: 'uppercase',
                  color: textColor,
                }}
              >
                Agence de voyage
              </span>
              <div style={{ height: 3, width: 70 * tagP, background: COULEURS.rouge, borderRadius: 2 }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
