import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme";
import timeline from "../timeline.json";

// Fond continu sur toute la vidéo : dégradé profond, faisceaux volumétriques,
// particules avec profondeur de champ, vignette et grain.
export const Atmosphere: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const intro = interpolate(frame, [0, 60], [0, 1], { extrapolateRight: "clamp" });

  // Dérive lente de la caméra (parallaxe des particules).
  const camX = Math.sin(frame / 140) * 40;
  const camY = Math.cos(frame / 190) * 24;

  // Teinte de la lumière : verte, puis plus dorée sur les scènes d'appel à l'action.
  const warm = interpolate(frame, [480, 560, 880, 960], [0, 1, 1, 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.night, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${colors.deep} 0%, ${colors.night} 70%)`,
          opacity: intro,
        }}
      />
      <Beams frame={frame} warm={warm} width={width} height={height} opacity={intro} />
      <Particles frame={frame} camX={camX} camY={camY} width={width} height={height} opacity={intro} />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />
      <Grain frame={frame} />
    </AbsoluteFill>
  );
};

const Beams: React.FC<{ frame: number; warm: number; width: number; height: number; opacity: number }> = ({
  frame,
  warm,
  width,
  height,
  opacity,
}) => {
  const diag = Math.hypot(width, height);
  const beams = [
    { angle: -24, x: 0.22, w: 0.16, speed: 1, color: colors.green },
    { angle: -18, x: 0.5, w: 0.1, speed: 1.4, color: colors.accent },
    { angle: -30, x: 0.78, w: 0.2, speed: 0.8, color: colors.green },
  ];
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "screen" }}>
      {beams.map((b, i) => {
        const sway = Math.sin(frame / (90 * b.speed) + i * 2) * 6;
        const pulse = 0.55 + 0.25 * Math.sin(frame / 50 + i);
        const tint = i === 1 ? colors.accent : warm > 0.5 && i === 2 ? colors.accent : b.color;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: width * b.x - (diag * b.w) / 2,
              top: -diag * 0.3,
              width: diag * b.w,
              height: diag * 1.6,
              transform: `rotate(${b.angle + sway}deg)`,
              transformOrigin: "50% 0%",
              background: `linear-gradient(90deg, transparent, ${tint}33 35%, ${tint}55 50%, ${tint}33 65%, transparent)`,
              filter: `blur(${diag * 0.025}px)`,
              opacity: pulse * (i === 1 ? 0.35 + warm * 0.4 : 0.5),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const PARTICLE_COUNT = 90;

const Particles: React.FC<{ frame: number; camX: number; camY: number; width: number; height: number; opacity: number }> = ({
  frame,
  camX,
  camY,
  width,
  height,
  opacity,
}) => {
  const items = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const depth = random(`z${i}`); // 0 = loin, 1 = près
    const speed = 0.15 + depth * 0.6;
    const x0 = random(`x${i}`) * (width + 200) - 100;
    const y0 = random(`y${i}`) * (height + 200);
    const y = ((y0 - frame * speed * 1.4) % (height + 200) + height + 200) % (height + 200) - 100;
    const x = x0 + Math.sin(frame / 60 + i) * 12 + camX * (depth * 1.5 - 0.3);
    const size = 2 + depth * depth * 10;
    // Profondeur de champ : nettes au milieu, floues au premier plan et au loin.
    const blur = Math.abs(depth - 0.45) * 9;
    const twinkle = 0.5 + 0.5 * Math.sin(frame / (12 + random(`t${i}`) * 20) + i);
    const appear = interpolate(frame, [random(`a${i}`) * 50, random(`a${i}`) * 50 + 30], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const hue = random(`c${i}`);
    const color = hue < 0.55 ? colors.accentLight : hue < 0.85 ? "#FFFFFF" : colors.greenLight;
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y + camY * depth,
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 ${size * 2}px ${color}`,
          filter: `blur(${blur}px)`,
          opacity: appear * (0.25 + twinkle * 0.55) * (0.4 + depth * 0.6),
        }}
      />,
    );
  }
  return <AbsoluteFill style={{ opacity }}>{items}</AbsoluteFill>;
};

const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
    <svg width="100%" height="100%">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

// Éclair lumineux de transition centré sur chaque changement de scène.
export const LightTransitions: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  let strength = 0;
  for (const at of timeline.transitions) {
    const d = frame - at;
    if (d > -8 && d < 12) {
      strength = Math.max(strength, d < 0 ? interpolate(d, [-8, 0], [0, 1]) : interpolate(d, [0, 12], [1, 0]));
    }
  }
  if (strength <= 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${colors.accentLight} 0%, ${colors.accent}88 30%, transparent 70%)`,
          opacity: strength * 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
          height: width * 0.006,
          transform: `translateY(-50%) scaleX(${0.3 + strength * 0.9})`,
          background: `linear-gradient(90deg, transparent, #fff, transparent)`,
          boxShadow: `0 0 ${width * 0.03}px ${colors.accentLight}`,
          opacity: strength,
        }}
      />
    </AbsoluteFill>
  );
};
