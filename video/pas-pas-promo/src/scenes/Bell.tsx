import React from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChannelCard, useCardGeometry } from "../components/ChannelCard";
import { Kinetic } from "../components/Kinetic";
import { BellIcon, Cursor } from "../components/Ui";
import { colors, useLayout } from "../theme";
import timeline from "../timeline.json";

// Scène 5 (24–30 s) : la caméra plonge dans l'icône de cloche, clic, balancement, ondes.
export const Bell: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, vertical, u, safe } = useLayout();
  const g = useCardGeometry();
  const { from, duration } = timeline.scenes.bell;
  const clickAt = timeline.events.bellClick - from;

  // Zoom caméra vers la cloche du bouton ABONNÉ.
  const zoom = interpolate(frame, [0, 24], [1, 5], { extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const cardFade = interpolate(frame, [10, 22], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const center = { x: vertical ? g.cx : width / 2, y: vertical ? height * 0.45 : height * 0.5 };
  const bellSize = vertical ? 330 * u : 300 * u;
  const bellIn = spring({ frame: frame - 14, fps, config: { damping: 14, stiffness: 120 } });

  const since = frame - clickAt;
  const swing = since > 0 ? 26 * Math.sin(since * 0.55) * Math.exp(-since / 16) : 0;
  const active = since > 0;
  const press = interpolate(frame, [clickAt - 2, clickAt + 1, clickAt + 8], [1, 0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(frame, [duration - 10, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {cardFade > 0 ? (
        <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${g.bell.x}px ${g.bell.y}px`, opacity: cardFade }}>
          <ChannelCard pop={1} subscribed={1} glow={0} />
        </AbsoluteFill>
      ) : null}

      {/* Ondes d'alerte */}
      {active
        ? [0, 12, 24].map((d) => {
            const p = interpolate(since - d, [0, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (p <= 0 || p >= 1) return null;
            const s = bellSize * (1.3 + p * 1.8);
            return (
              <div
                key={d}
                style={{
                  position: "absolute",
                  left: center.x - s / 2,
                  top: center.y - s / 2,
                  width: s,
                  height: s,
                  borderRadius: "50%",
                  border: `${8 * u * (1 - p)}px solid ${colors.accent}`,
                  opacity: (1 - p) * 0.9,
                  boxShadow: `0 0 ${40 * u}px ${colors.accent}66`,
                }}
              />
            );
          })
        : null}

      {/* Médaillon de la cloche */}
      <div
        style={{
          position: "absolute",
          left: center.x - (bellSize * 1.3) / 2,
          top: center.y - (bellSize * 1.3) / 2,
          width: bellSize * 1.3,
          height: bellSize * 1.3,
          borderRadius: "50%",
          background: active
            ? `radial-gradient(circle at 50% 35%, ${colors.greenLight}, ${colors.green} 55%, #1E6B33)`
            : "radial-gradient(circle at 50% 35%, #3A423D, #161B18)",
          boxShadow: active
            ? `0 0 ${120 * u}px ${colors.green}AA, inset 0 ${-10 * u}px ${30 * u}px rgba(0,0,0,0.3)`
            : `0 ${30 * u}px ${70 * u}px rgba(0,0,0,0.6)`,
          border: `${3 * u}px solid rgba(255,255,255,0.18)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${bellIn * press})`,
          opacity: bellIn,
        }}
      >
        <BellIcon size={bellSize * 0.72} filled={active} color={"#FFFFFF"} rotate={swing} />
      </div>

      <Cursor
        frame={frame}
        from={{ x: width * (vertical ? 0.82 : 0.86), y: height * (vertical ? 0.75 : 0.92) }}
        to={{ x: center.x + bellSize * 0.18, y: center.y + bellSize * 0.2 }}
        start={24}
        arrive={clickAt - 4}
        click={clickAt}
        size={64 * u}
        leave={clickAt + 40}
      />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: vertical ? safe.top + 20 * u : safe.top + 10 * u, paddingRight: vertical ? safe.right - safe.left : 0 }}>
        <Kinetic text={"ACTIVE LA CLOCHE\u00A0🔔"} at={16} size={(vertical ? 96 : 100) * u} highlight={["CLOCHE"]} maxWidth={vertical ? width * 0.78 : undefined} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: vertical ? safe.bottom + 30 * u : safe.bottom + 30 * u,
          paddingRight: vertical ? safe.right - safe.left : 0,
        }}
      >
        <Kinetic
          text="POUR NE RATER AUCUNE NOUVELLE VIDÉO"
          at={clickAt + 6}
          size={(vertical ? 60 : 58) * u}
          weight={800}
          highlight={["NOUVELLE", "VIDÉO"]}
          stagger={3}
          maxWidth={vertical ? width * 0.76 : undefined}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
