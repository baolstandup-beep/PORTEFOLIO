import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Kinetic } from "../components/Kinetic";
import { Logo3D } from "../components/Logo";
import { colors, useLayout } from "../theme";
import timeline from "../timeline.json";

// Scène 1 (0–4 s) : fond sombre, particules, une ligne de lumière révèle une
// partie du logo, la caméra avance, puis l'accroche.
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, u } = useLayout();
  const { duration } = timeline.scenes.hook;
  const sweepAt = timeline.events.lineSweep;

  const push = interpolate(frame, [0, duration], [1, 1.14], { easing: Easing.inOut(Easing.cubic) });
  const sweep = interpolate(frame, [sweepAt, sweepAt + 34], [-0.1, 1.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.65, 0, 0.35, 1),
  });
  const logoSize = vertical ? width * 0.95 : height * 1.05;
  // Le logo n'est éclairé que dans le sillage de la ligne, puis retombe dans l'ombre.
  const revealWidth = Math.max(0, Math.min(1, sweep)) * 100;
  const logoFade = interpolate(frame, [sweepAt + 20, sweepAt + 60], [0.55, 0.16], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ transform: `scale(${push})` }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            clipPath: `inset(0 ${100 - revealWidth}% 0 ${Math.max(0, revealWidth - 45)}%)`,
            opacity: logoFade,
            filter: `blur(${3 * u}px) brightness(0.9)`,
          }}
        >
          <Logo3D size={logoSize} rotateY={-18 + sweep * 12} glint={sweep} rim={0.5} shadow={0} />
        </div>
      </AbsoluteFill>

      {/* Ligne de lumière */}
      <div
        style={{
          position: "absolute",
          left: sweep * width - 4 * u,
          top: 0,
          width: 6 * u,
          height,
          background: `linear-gradient(180deg, transparent, ${colors.goldLight}, #fff, ${colors.goldLight}, transparent)`,
          boxShadow: `0 0 ${40 * u}px ${12 * u}px ${colors.gold}88`,
          opacity: sweep > -0.05 && sweep < 1.05 ? 1 : 0,
          transform: "skewX(-8deg)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: vertical ? width * 0.1 : 0 }}>
        <Kinetic
          text={"ENVIE DE NE RIEN MANQUER\u00A0?"}
          at={52}
          exitAt={duration - 12}
          size={vertical ? 118 * u : 124 * u}
          highlight={["RIEN", "MANQUER"]}
          stagger={5}
          maxWidth={vertical ? width * 0.8 : width * 0.8}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
