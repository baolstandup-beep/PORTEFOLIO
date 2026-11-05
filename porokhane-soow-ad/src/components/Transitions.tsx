import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

/**
 * Transition lumineuse « flare » centrée sur une frame de coupe : éclair
 * anamorphique horizontal + flash + fuite de lumière colorée. Masque la coupe
 * entre deux scènes (technique classique des pubs de boissons).
 */
export const FlareTransition: React.FC<{ at: number; color?: string; duration?: number }> = ({
  at,
  color = "255,220,150",
  duration = 16,
}) => {
  const frame = useCurrentFrame();
  const h = duration / 2;
  const p = interpolate(frame, [at - h, at, at + h], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  if (p <= 0) return null;
  const sweep = interpolate(frame, [at - h, at + h], [-60, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      <AbsoluteFill style={{ background: `rgba(${color},${p * 0.85})` }} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(100deg, transparent ${sweep - 30}%, rgba(255,255,255,${p}) ${sweep}%, transparent ${sweep + 30}%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 960 - 6,
          height: 12,
          background: `linear-gradient(90deg, transparent, rgba(160,210,255,${p}), rgba(255,255,255,${p}), rgba(160,210,255,${p}), transparent)`,
          filter: "blur(4px)",
          transform: `scaleY(${1 + p * 6})`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Wrapper caméra : applique zoom / rotation / translation à toute la scène. */
export const Camera: React.FC<{
  scale?: number;
  rotate?: number;
  x?: number;
  y?: number;
  blur?: number;
  children: React.ReactNode;
}> = ({ scale = 1, rotate = 0, x = 0, y = 0, blur = 0, children }) => (
  <AbsoluteFill
    style={{
      transform: `translate(${x}px, ${y}px) scale(${scale}) rotate(${rotate}deg)`,
      filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
    }}
  >
    {children}
  </AbsoluteFill>
);
