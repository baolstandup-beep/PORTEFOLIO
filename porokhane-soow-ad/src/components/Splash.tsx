import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";

/**
 * Éclaboussure liquide : couronne de gouttes projetées depuis un point, avec
 * gravité, traînées étirées et onde de choc. `color` = "r,g,b".
 */
export const Splash: React.FC<{
  at?: number;
  color: string;
  x?: number;
  y?: number;
  count?: number;
  seed?: string;
  power?: number;
}> = ({ at = 0, color, x = 540, y = 1100, count = 42, seed = "s", power = 1 }) => {
  const frame = useCurrentFrame();
  const f = frame - at;
  if (f < 0 || f > 60) return null;
  const ring = interpolate(f, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* onde de choc */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: 1400 * ring * power,
          height: 420 * ring * power,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          border: `${10 * (1 - ring)}px solid rgba(${color},${0.55 * (1 - ring)})`,
          filter: "blur(3px)",
        }}
      />
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${k}-${i}`);
        const ang = -Math.PI / 2 + (r("a") - 0.5) * Math.PI * 1.5;
        const v = (14 + r("v") * 30) * power;
        const t = f;
        const px = x + Math.cos(ang) * v * t;
        const py = y + Math.sin(ang) * v * t + 0.9 * t * t;
        const vy = Math.sin(ang) * v + 1.8 * t;
        const vx = Math.cos(ang) * v;
        const speed = Math.hypot(vx, vy);
        const size = (8 + r("s") * 34) * (1 - t / 75);
        const angle = (Math.atan2(vy, vx) * 180) / Math.PI;
        const op = interpolate(t, [0, 3, 40, 60], [0, 1, 0.9, 0], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: size * (1 + speed / 22),
              height: size,
              borderRadius: "50%",
              transform: `translate(-50%,-50%) rotate(${angle}deg)`,
              background: `radial-gradient(ellipse at 65% 35%, rgba(255,255,255,0.95) 0%, rgba(${color},0.95) 30%, rgba(${color},0.7) 100%)`,
              boxShadow: `0 0 12px rgba(${color},0.6)`,
              opacity: op,
              filter: r("b") > 0.7 ? "blur(3px)" : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
