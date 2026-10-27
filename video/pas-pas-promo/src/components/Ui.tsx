import React from "react";
import { Easing, interpolate } from "remotion";
import { colors } from "../theme";

type Pt = { x: number; y: number };

// Curseur animé : trajectoire en courbe, appui au clic, onde de clic.
export const Cursor: React.FC<{
  frame: number;
  from: Pt;
  to: Pt;
  start: number;
  arrive: number;
  click: number;
  size: number;
  leave?: number;
}> = ({ frame, from, to, start, arrive, click, size, leave }) => {
  const p = interpolate(frame, [start, arrive], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  // Arc léger plutôt qu'une ligne droite.
  const ctrl = { x: (from.x + to.x) / 2 + (to.y - from.y) * 0.25, y: (from.y + to.y) / 2 - Math.abs(to.x - from.x) * 0.15 };
  const x = (1 - p) ** 2 * from.x + 2 * (1 - p) * p * ctrl.x + p ** 2 * to.x;
  const y = (1 - p) ** 2 * from.y + 2 * (1 - p) * p * ctrl.y + p ** 2 * to.y;
  const press = interpolate(frame, [click - 3, click, click + 5], [1, 0.78, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ripple = interpolate(frame, [click, click + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const appear = interpolate(frame, [start, start + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fade = leave === undefined ? 1 : interpolate(frame, [leave, leave + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {frame >= click && ripple < 1 ? (
        <div
          style={{
            position: "absolute",
            left: to.x - size * 1.2 * ripple,
            top: to.y - size * 1.2 * ripple,
            width: size * 2.4 * ripple,
            height: size * 2.4 * ripple,
            borderRadius: "50%",
            border: `${size * 0.08}px solid rgba(255,255,255,${0.9 * (1 - ripple)})`,
            background: `rgba(255,255,255,${0.18 * (1 - ripple)})`,
          }}
        />
      ) : null}
      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 20 28"
        style={{
          position: "absolute",
          left: x - size * 0.12,
          top: y - size * 0.06,
          transform: `scale(${press})`,
          transformOrigin: "10% 5%",
          opacity: appear * fade,
          filter: `drop-shadow(0 ${size * 0.12}px ${size * 0.2}px rgba(0,0,0,0.55))`,
        }}
      >
        <path d="M2 1 L2 22 L7.2 17.2 L10.6 25.4 L14 24 L10.6 15.9 L17.6 15.9 Z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    </>
  );
};

// Icône de cloche (dessin original, non issu de l'interface YouTube).
export const BellIcon: React.FC<{ size: number; filled: boolean; color?: string; rotate?: number }> = ({
  size,
  filled,
  color = colors.white,
  rotate = 0,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ transform: `rotate(${rotate}deg)`, transformOrigin: "50% 8%", overflow: "visible" }}
  >
    <path
      d="M12 2.2c.9 0 1.6.7 1.6 1.6v.6c2.9.7 4.9 3.3 4.9 6.3v4.4l1.9 2.3c.4.5 0 1.2-.6 1.2H4.2c-.6 0-1-.7-.6-1.2l1.9-2.3v-4.4c0-3 2-5.6 4.9-6.3v-.6c0-.9.7-1.6 1.6-1.6z"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={filled ? 0 : 1.7}
      strokeLinejoin="round"
    />
    <path d="M9.4 20.2a2.7 2.7 0 0 0 5.2 0z" fill={color} />
  </svg>
);
