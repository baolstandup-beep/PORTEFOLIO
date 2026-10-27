import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChannelCard, useCardGeometry } from "../components/ChannelCard";
import { Kinetic } from "../components/Kinetic";
import { Cursor } from "../components/Ui";
import { useLayout } from "../theme";
import timeline from "../timeline.json";

// Scène 4 (17–24 s) : en-tête de chaîne, bouton S'ABONNER, clic du curseur, état ABONNÉ.
export const Subscribe: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, vertical, u, safe } = useLayout();
  const g = useCardGeometry();
  const { from, duration } = timeline.scenes.subscribe;
  const popAt = timeline.events.buttonPop - from;
  const clickAt = timeline.events.subscribeClick - from;
  const swap = clickAt + 34;

  const cardIn = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 110 } });
  // Apparition du bouton avec rebond (dépassement du ressort).
  const pop = spring({ frame: frame - popAt, fps, config: { damping: 9, stiffness: 160, mass: 0.8 } });
  const glow = 0.5 + 0.5 * Math.sin((frame - popAt) / 6);
  const subscribed = interpolate(frame, [clickAt + 1, clickAt + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const clickBounce = interpolate(frame, [clickAt - 2, clickAt + 1, clickAt + 8], [1, 0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [duration - 8, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: 1 - exit * 0.3 }}>
      <AbsoluteFill
        style={{
          opacity: cardIn,
          transform: `translateY(${(1 - cardIn) * 80 * u}px) scale(${0.94 + cardIn * 0.06})`,
        }}
      >
        <ChannelCard pop={pop * clickBounce} subscribed={subscribed} glow={glow} />
      </AbsoluteFill>

      <Cursor
        frame={frame}
        from={{ x: width * (vertical ? 0.8 : 0.9), y: height * (vertical ? 0.74 : 0.95) }}
        to={{ x: g.btn.x + 30 * u, y: g.btn.y + 10 * u }}
        start={popAt + 14}
        arrive={clickAt - 4}
        click={clickAt}
        size={64 * u}
        leave={duration - 30}
      />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: vertical ? safe.top + 20 * u : safe.top + 40 * u, paddingRight: vertical ? safe.right - safe.left : 0 }}>
        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
          <Kinetic
            text={"ABONNE-TOI À LA CHAÎNE\u00A0!"}
            at={8}
            exitAt={swap - 10}
            size={(vertical ? 88 : 92) * u}
            highlight={["ABONNE-TOI"]}
            maxWidth={vertical ? width * 0.78 : undefined}
          />
          <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", justifyContent: "center" }}>
            <Kinetic text={"C'EST GRATUIT\u00A0!"} at={swap} size={(vertical ? 104 : 112) * u} highlight={["GRATUIT"]} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
