import React from "react";
import { Easing, interpolate } from "remotion";

type Props = {
  /** Frame locale courante et fenêtre du balayage. */
  frame: number;
  start: number;
  duration: number;
  width?: number;
  angle?: number;
  opacity?: number;
  color?: string;
  blend?: React.CSSProperties["mixBlendMode"];
};

/** Bande de lumière diagonale qui traverse son conteneur (reflet « premium »). */
export const LightSweep: React.FC<Props> = ({
  frame,
  start,
  duration,
  width = 140,
  angle = 20,
  opacity = 0.8,
  color = "255,255,255",
  blend = "screen",
}) => {
  const p = interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  if (p <= 0 || p >= 1) return null;
  const fade = Math.sin(p * Math.PI);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        mixBlendMode: blend,
        opacity: opacity * fade,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-50%",
          height: "200%",
          width,
          left: `calc(${-20 + p * 140}% - ${width / 2}px)`,
          transform: `rotate(${angle}deg)`,
          background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(${color},0.55) 40%, rgba(${color},0.95) 50%, rgba(${color},0.55) 60%, rgba(${color},0) 100%)`,
          filter: "blur(6px)",
        }}
      />
    </div>
  );
};
