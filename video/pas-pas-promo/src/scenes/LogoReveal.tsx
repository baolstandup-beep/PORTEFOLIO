import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Eyebrow, Kinetic } from "../components/Kinetic";
import { Logo3D } from "../components/Logo";
import { colors, useLayout } from "../theme";
import timeline from "../timeline.json";

// Scène 2 (4–9 s) : entrée 3D du logo, impact lumineux, nom de la chaîne.
export const LogoReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, vertical, u } = useLayout();
  const { from, duration } = timeline.scenes.logo;
  const impact = timeline.events.logoImpact - from;

  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 90, mass: 0.9 } });
  const rotY = interpolate(enter, [0, 1], [-95, 0]) + Math.sin(frame / 28) * 7 * enter;
  const rotX = interpolate(enter, [0, 1], [18, 0]) + Math.cos(frame / 36) * 3;
  const depth = interpolate(enter, [0, 1], [0.35, 1]);
  const blur = interpolate(enter, [0, 0.7], [18, 0], { extrapolateRight: "clamp" });
  const glint = interpolate(frame, [impact + 8, impact + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rim = interpolate(frame, [0, impact, impact + 30], [0.1, 0.6, 1], { extrapolateRight: "clamp" });
  // Caméra : léger travelling avant puis recul pour laisser la place au texte.
  const cam = interpolate(frame, [0, duration], [1.06, 0.98], { easing: Easing.inOut(Easing.quad) });

  const shock = interpolate(frame, [impact, impact + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoSize = vertical ? width * 0.62 : height * 0.44;
  const exit = interpolate(frame, [duration - 12, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ transform: `scale(${cam})`, opacity: 1 - exit * 0.6 }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: vertical ? 70 * u : 46 * u,
        }}
      >
        <div style={{ position: "relative", transform: `scale(${depth})`, filter: `blur(${blur}px)`, opacity: enter }}>
          {/* Onde de choc à l'impact */}
          {shock > 0 && shock < 1 ? (
            <div
              style={{
                position: "absolute",
                left: (-logoSize * shock * 1.6) / 2,
                top: (-logoSize * shock * 1.6) / 2,
                width: logoSize * (1 + shock * 1.6),
                height: logoSize * (1 + shock * 1.6),
                borderRadius: "50%",
                border: `${6 * u * (1 - shock)}px solid ${colors.goldLight}`,
                opacity: 1 - shock,
                boxShadow: `0 0 ${60 * u}px ${colors.gold}`,
              }}
            />
          ) : null}
          <Logo3D size={logoSize} rotateY={rotY} rotateX={rotX} glint={glint} rim={rim} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * u }}>
          <Eyebrow text="BIENVENUE SUR" at={16} size={(vertical ? 40 : 34) * u} />
          <Kinetic
            text="PAS-PAS OFFICIEL"
            at={24}
            size={(vertical ? 128 : 112) * u}
            gradient
            stagger={6}
            tracking={-0.01}
            maxWidth={vertical ? width * 0.86 : undefined}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
