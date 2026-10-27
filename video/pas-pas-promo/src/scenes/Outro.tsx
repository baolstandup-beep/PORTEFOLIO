import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Eyebrow, Kinetic } from "../components/Kinetic";
import { Logo3D } from "../components/Logo";
import { colors, useLayout } from "../theme";
import timeline from "../timeline.json";

// Scène 6 (30–35 s) : retour du logo, recul de caméra, signature, dernier éclat.
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, vertical, u, safe } = useLayout();
  const { from, duration } = timeline.scenes.outro;
  const flashAt = timeline.events.finalFlash - from;

  const pullBack = interpolate(frame, [0, duration], [1.22, 1], { easing: Easing.out(Easing.cubic) });
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const rotY = interpolate(enter, [0, 1], [70, 0]) + Math.sin(frame / 30) * 5;
  const glint = interpolate(frame, [flashAt - 6, flashAt + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(frame, [flashAt - 4, flashAt, flashAt + 16], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Sortie : fondu au noir des 10 dernières images, sans recadrer le logo ni le texte.
  const fadeOut = interpolate(frame, [duration - 10, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoSize = vertical ? width * 0.5 : height * 0.36;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${pullBack})`,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: vertical ? 60 * u : 40 * u,
          paddingRight: vertical ? safe.right - safe.left : 0,
          paddingBottom: vertical ? height * 0.05 : 0,
        }}
      >
        <div style={{ opacity: enter, transform: `scale(${0.7 + enter * 0.3})` }}>
          <Logo3D size={logoSize} rotateY={rotY} glint={glint} rim={0.8 + flash * 0.6} />
        </div>
        <Kinetic text="PAS-PAS OFFICIEL" at={14} size={(vertical ? 118 : 108) * u} gradient stagger={6} tracking={-0.01} />
        <div style={{ height: 2 * u, width: interpolate(frame, [30, 60], [0, vertical ? 560 : 760], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * u, background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)` }} />
        <Eyebrow
          text={vertical ? "ABONNE-TOI\nACTIVE LA CLOCHE\nPARTAGE" : "ABONNE-TOI • ACTIVE LA CLOCHE • PARTAGE"}
          at={34}
          size={(vertical ? 40 : 36) * u}
          color={colors.white}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, #fff 0%, ${colors.goldLight}AA 20%, transparent 60%)`,
          opacity: flash * 0.8,
          mixBlendMode: "screen",
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};
