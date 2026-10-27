import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { thumbSrc, VIDEOS } from "../brand";
import { Kinetic } from "../components/Kinetic";
import { colors, fonts, useLayout } from "../theme";
import timeline from "../timeline.json";

// Scène 3 (9–17 s) : les publications réelles de la chaîne en panneaux flottants.
export const Videos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { width, height, vertical, u, safe } = useLayout();
  const { from, duration } = timeline.scenes.videos;
  const cardsAt = timeline.events.cards.map((f) => f - from);

  // Travelling latéral et orbite lente de la caméra autour des panneaux.
  const travel = interpolate(frame, [0, duration], [1, -1], { easing: Easing.inOut(Easing.sin) });
  const camRotY = travel * (vertical ? 6 : 10);
  const camRotX = vertical ? interpolate(frame, [0, duration], [5, -3]) : 4;
  const camX = travel * (vertical ? 0 : width * 0.03);
  const camY = vertical ? travel * height * 0.02 : 0;
  const exit = interpolate(frame, [duration - 12, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cardW = vertical ? width * 0.56 : width * 0.27;
  const swap = 132;

  // Disposition : en ligne (16:9) ou en colonne décalée (9:16).
  const slots = vertical
    ? [
        { x: -width * 0.05, y: -height * 0.12, z: 0, r: 6 },
        { x: width * 0.05, y: height * 0.015, z: -40, r: -6 },
        { x: -width * 0.03, y: height * 0.15, z: 20, r: 4 },
      ]
    : [
        { x: -width * 0.3, y: height * 0.05, z: -80, r: 16 },
        { x: 0, y: height * 0.02, z: 40, r: 0 },
        { x: width * 0.3, y: height * 0.05, z: -80, r: -16 },
      ];

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, filter: `blur(${exit * 8}px)` }}>
      <AbsoluteFill style={{ perspective: width * 1.2, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            transformStyle: "preserve-3d",
            transform: `translate(${camX}px, ${camY + (vertical ? height * 0.02 : height * 0.02)}px) rotateX(${camRotX}deg) rotateY(${camRotY}deg)`,
          }}
        >
          {VIDEOS.map((v, i) => {
            const s = slots[i];
            const p = spring({ frame: frame - cardsAt[i], fps, config: { damping: 16, stiffness: 80, mass: 1 } });
            const float = Math.sin((frame + i * 25) / 30) * 10 * u;
            return (
              <div
                key={v.id}
                style={{
                  position: "absolute",
                  left: -cardW / 2,
                  top: -(cardW * 9) / 16 / 2,
                  transform: `translate3d(${s.x}px, ${s.y + float + (1 - p) * 220 * u}px, ${s.z - (1 - p) * 900}px) rotateY(${s.r + (1 - p) * 35}deg)`,
                  opacity: p,
                }}
              >
                <Card video={v} width={cardW} frame={frame - cardsAt[i]} />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          alignItems: "center",
          paddingTop: vertical ? safe.top : safe.top + 10 * u,
          paddingLeft: safe.left,
          paddingRight: vertical ? safe.right : safe.left,
        }}
      >
        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
          <Kinetic text="DÉCOUVREZ NOS VIDÉOS" at={6} exitAt={swap - 10} size={(vertical ? 84 : 92) * u} highlight={["VIDÉOS"]} />
          <div style={{ position: "absolute", top: 0, width: "100%", display: "flex", justifyContent: "center" }}>
            <Kinetic
              text="DE NOUVEAUX CONTENUS À EXPLORER"
              at={swap}
              size={(vertical ? 76 : 80) * u}
              highlight={["EXPLORER"]}
              stagger={3}
              maxWidth={vertical ? width * 0.8 : undefined}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Card: React.FC<{ video: (typeof VIDEOS)[number]; width: number; frame: number }> = ({ video, width, frame }) => {
  const h = (width * 9) / 16;
  const src = thumbSrc(video.id);
  const sheen = interpolate(frame, [10, 40], [-0.5, 1.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        width,
        borderRadius: width * 0.03,
        overflow: "hidden",
        background: "rgba(14,24,18,0.92)",
        border: `1px solid rgba(242,194,48,0.35)`,
        boxShadow: `0 ${width * 0.06}px ${width * 0.12}px rgba(0,0,0,0.6), 0 0 ${width * 0.08}px rgba(0,133,63,0.25)`,
      }}
    >
      <div style={{ position: "relative", width, height: h, overflow: "hidden" }}>
        {src ? (
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ThumbPlaceholder width={width} height={h} index={VIDEOS.indexOf(video)} />
        )}
        <div
          style={{
            position: "absolute",
            right: width * 0.025,
            bottom: width * 0.025,
            padding: `${width * 0.006}px ${width * 0.014}px`,
            borderRadius: width * 0.01,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            fontFamily: fonts.ui,
            fontWeight: 600,
            fontSize: width * 0.034,
          }}
        >
          {video.duration}
        </div>
        <div
          style={{
            position: "absolute",
            left: width * 0.025,
            top: width * 0.025,
            padding: `${width * 0.006}px ${width * 0.016}px`,
            borderRadius: width * 0.01,
            background: video.kind === "SHORT" ? colors.red : colors.green,
            color: "#fff",
            fontFamily: fonts.ui,
            fontWeight: 700,
            fontSize: width * 0.028,
            letterSpacing: "0.12em",
          }}
        >
          {video.kind}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
            transform: `translateX(${sheen * 100}%)`,
          }}
        />
      </div>
      <div
        style={{
          padding: `${width * 0.03}px ${width * 0.035}px ${width * 0.035}px`,
          fontFamily: fonts.ui,
          fontWeight: 600,
          fontSize: width * 0.042,
          lineHeight: 1.3,
          color: colors.white,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          height: width * 0.042 * 1.3 * 2,
          boxSizing: "content-box",
        }}
      >
        {video.title}
      </div>
    </div>
  );
};

// Remplacement de miniature tant que public/thumbs/<id>.jpg n'est pas fourni.
const ThumbPlaceholder: React.FC<{ width: number; height: number; index: number }> = ({ width, height, index }) => {
  const tints = [
    [colors.green, "#03361C"],
    ["#0B4A2B", "#1E1405"],
    ["#5C0F12", "#140606"],
  ][index % 3];
  return (
    <div
      style={{
        width,
        height,
        background: `radial-gradient(circle at 30% 30%, ${tints[0]}, ${tints[1]})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: width * 0.2,
          color: "rgba(255,255,255,0.08)",
          letterSpacing: "-0.03em",
        }}
      >
        PAS-PAS
      </div>
      <div
        style={{
          width: height * 0.32,
          height: height * 0.32,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.14)",
          border: `2px solid ${colors.gold}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            marginLeft: height * 0.03,
            borderTop: `${height * 0.065}px solid transparent`,
            borderBottom: `${height * 0.065}px solid transparent`,
            borderLeft: `${height * 0.1}px solid ${colors.goldLight}`,
          }}
        />
      </div>
    </div>
  );
};
