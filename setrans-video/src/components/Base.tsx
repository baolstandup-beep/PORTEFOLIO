import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { COLORS, FONTS, TYPE } from '../config/setrans.config';
import { EASE, progress, seeded } from '../lib/anim';

/** Fond sombre institutionnel : dégradé bleu nuit + halo discret. */
export const DarkBackground: React.FC<{ glow?: number; children?: React.ReactNode }> = ({
  glow = 0.35,
  children,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 70% 60% at 50% 45%, rgba(28,63,136,${glow}) 0%, ${COLORS.navy} 45%, ${COLORS.night} 100%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Fond clair (scènes « process »). */
export const LightBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 80% 70% at 50% 40%, ${COLORS.white} 0%, ${COLORS.greyLight} 100%)`,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Grille technique très légère, en parallaxe. */
export const Grid: React.FC<{ color?: string; opacity?: number; drift?: number }> = ({
  color = COLORS.blueGlow,
  opacity = 0.06,
  drift = 20,
}) => {
  const frame = useCurrentFrame();
  const offset = (frame * drift) / 300;
  return (
    <AbsoluteFill
      style={{
        opacity,
        backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        backgroundSize: '96px 96px',
        backgroundPosition: `${-offset}px ${offset / 3}px`,
      }}
    />
  );
};

/**
 * Plan vidéo (Higgsfield). Étalonnage institutionnel, lent zoom avant,
 * voile bleu optionnel pour accueillir le motion design par-dessus.
 */
export const Clip: React.FC<{
  src: string;
  /** Début dans le fichier source (s). */
  trimStart?: number;
  playbackRate?: number;
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;
  /** 0 = image brute, 1 = très assombrie. */
  dim?: number;
  blur?: number;
  tint?: number;
}> = ({
  src,
  trimStart = 0,
  playbackRate = 1,
  zoomFrom = 1.04,
  zoomTo = 1.12,
  panX = 0,
  dim = 0.15,
  blur = 0,
  tint = 0.18,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const t = Math.min(1, frame / durationInFrames);
  const scale = zoomFrom + (zoomTo - zoomFrom) * EASE.soft(t);
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: COLORS.night }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateX(${panX * t}px)`,
          filter: `saturate(0.82) contrast(1.06) brightness(0.96) ${blur ? `blur(${blur}px)` : ''}`,
        }}
      >
        <OffthreadVideo
          src={staticFile(src)}
          muted
          startFrom={Math.round(trimStart * fps)}
          playbackRate={playbackRate}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
      {/* Étalonnage : voile bleu SETRANS + assombrissement */}
      <AbsoluteFill style={{ backgroundColor: COLORS.blue, opacity: tint, mixBlendMode: 'soft-light' }} />
      <AbsoluteFill style={{ backgroundColor: COLORS.night, opacity: dim }} />
    </AbsoluteFill>
  );
};

/**
 * Vignettage + grain très léger, posés sur tout le film.
 * `lightFromSec` : à partir de cet instant (fond clair du logo), le vignettage s'efface.
 */
export const FilmFinish: React.FC<{ lightFromSec?: number }> = ({ lightFromSec }) => {
  const frame = useCurrentFrame();
  const vignette =
    lightFromSec === undefined ? 1 : 1 - 0.85 * progress(frame, lightFromSec - 0.6, lightFromSec + 0.2, EASE.soft);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill
        style={{
          opacity: vignette,
          background:
            'radial-gradient(ellipse 85% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(3,7,18,0.55) 100%)',
        }}
      />
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.05, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Particules lumineuses discrètes. `converge` (0→1) les attire au centre. */
export const Particles: React.FC<{
  count?: number;
  seed?: number;
  converge?: number;
  color?: string;
  opacity?: number;
}> = ({ count = 70, seed = 7, converge = 0, color = COLORS.blueGlow, opacity = 0.7 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const pts = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, () => ({
      x: r() * width,
      y: r() * height,
      s: 0.8 + r() * 2.2,
      vx: (r() - 0.5) * 0.25,
      vy: -0.1 - r() * 0.25,
      ph: r() * Math.PI * 2,
    }));
  }, [count, seed, width, height]);
  const cx = width / 2;
  const cy = height / 2;
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      {pts.map((p, i) => {
        const fx = p.x + p.vx * frame;
        const fy = ((p.y + p.vy * frame) % height + height) % height;
        const x = fx + (cx - fx) * converge;
        const y = fy + (cy - fy) * converge;
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(frame / 25 + p.ph));
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={p.s * (1 - converge * 0.5)}
            fill={color}
            opacity={opacity * tw}
            style={{ filter: `drop-shadow(0 0 ${3 + p.s * 2}px ${color})` }}
          />
        );
      })}
    </svg>
  );
};

/** Petit libellé typographique (sur-titre, étiquettes). */
export const Label: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  spacing?: string;
  style?: React.CSSProperties;
}> = ({ children, size = TYPE.label, color = COLORS.white, weight = 600, spacing = TYPE.letterSpacingWide, style }) => (
  <div
    style={{
      fontFamily: FONTS.title,
      fontSize: size,
      fontWeight: weight,
      letterSpacing: spacing,
      color,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Texte révélé par masque (glisse vers le haut depuis une ligne invisible). */
export const MaskReveal: React.FC<{
  t: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ t, children, style }) => (
  <div style={{ overflow: 'hidden', display: 'inline-block', ...style }}>
    <div style={{ transform: `translateY(${(1 - t) * 110}%)`, opacity: Math.min(1, t * 1.6) }}>{children}</div>
  </div>
);

/** Ligne horizontale qui se trace (utile pour souligner, relier). */
export const DrawLine: React.FC<{
  t: number;
  width: number;
  color?: string;
  thickness?: number;
  style?: React.CSSProperties;
}> = ({ t, width, color = COLORS.blueGlow, thickness = 2, style }) => (
  <div
    style={{
      width: width * t,
      height: thickness,
      background: `linear-gradient(90deg, ${color}00, ${color} 30%, ${color})`,
      ...style,
    }}
  />
);

export { progress, EASE };
