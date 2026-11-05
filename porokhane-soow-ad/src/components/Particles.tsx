import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/**
 * Particules lumineuses (bokeh) avec profondeur : les plus proches sont plus
 * grosses, plus floues et bougent plus vite (parallaxe).
 */
export const Particles: React.FC<{
  count?: number;
  seed?: string;
  color?: string;
  speed?: number;
  /** -1 = monte, 1 = descend */
  direction?: number;
  /** tourbillon autour du centre (0 = aucun) */
  swirl?: number;
  opacity?: number;
}> = ({ count = 60, seed = "p", color = "255,220,150", speed = 1, direction = -1, swirl = 0, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {new Array(count).fill(0).map((_, i) => {
        const z = random(`${seed}-z-${i}`); // 0 = loin, 1 = proche
        const size = 3 + z * z * 34;
        const blur = z > 0.75 ? (z - 0.75) * 40 : z < 0.2 ? 1.5 : 0;
        const v = (0.6 + z * 2.4) * speed;
        const x0 = random(`${seed}-x-${i}`) * 1080;
        const y0 = random(`${seed}-y-${i}`) * 1920;
        let x = x0 + Math.sin(frame / (40 + i) + i) * 18 * (0.3 + z);
        let y = (((y0 + direction * frame * v) % 2100) + 2100) % 2100 - 90;
        if (swirl) {
          const cx = 540, cy = 1000;
          const ang = Math.atan2(y - cy, x - cx) + (frame / 30) * swirl * (0.4 + z);
          const r = Math.hypot(x - cx, y - cy);
          x = cx + Math.cos(ang) * r;
          y = cy + Math.sin(ang) * r;
        }
        const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(frame / (12 + (i % 9)) + i));
        const a = (0.25 + z * 0.6) * twinkle;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(${color},${a}) 0%, rgba(${color},${a * 0.5}) 45%, rgba(${color},0) 72%)`,
              filter: blur ? `blur(${blur}px)` : undefined,
              transform: "translate(-50%,-50%)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
