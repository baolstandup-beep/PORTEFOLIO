import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/** Une goutte d'eau réaliste (réfraction simulée par dégradés + reflet). */
export const Drop: React.FC<{ size: number; tint?: string; blur?: number; stretch?: number }> = ({
  size,
  tint = "255,255,255",
  blur = 0,
  stretch = 1,
}) => (
  <svg
    width={size}
    height={size * stretch}
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ filter: blur ? `blur(${blur}px)` : undefined, overflow: "visible" }}
  >
    <defs>
      <radialGradient id={`dg-${tint.replace(/[^0-9]/g, "")}`} cx="40%" cy="35%" r="70%">
        <stop offset="0%" stopColor={`rgba(${tint},0.05)`} />
        <stop offset="70%" stopColor={`rgba(${tint},0.18)`} />
        <stop offset="100%" stopColor={`rgba(${tint},0.75)`} />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill={`url(#dg-${tint.replace(/[^0-9]/g, "")})`} stroke={`rgba(${tint},0.55)`} strokeWidth="2" />
    <ellipse cx="36" cy="30" rx="14" ry="9" fill="rgba(255,255,255,0.95)" transform="rotate(-30 36 30)" />
    <circle cx="66" cy="72" r="5" fill="rgba(255,255,255,0.55)" />
  </svg>
);

/** Gouttelettes qui flottent / tombent dans l'espace avec parallaxe. */
export const Droplets: React.FC<{
  count?: number;
  seed?: string;
  tint?: string;
  fall?: number;
  opacity?: number;
}> = ({ count = 18, seed = "d", tint = "255,255,255", fall = 1, opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {new Array(count).fill(0).map((_, i) => {
        const z = random(`${seed}-z-${i}`);
        const size = 10 + z * z * 90;
        const blur = z > 0.8 ? (z - 0.8) * 45 : 0;
        const x = random(`${seed}-x-${i}`) * 1080 + Math.sin(frame / 25 + i) * 6;
        const y0 = random(`${seed}-y-${i}`) * 2000;
        const y = ((y0 + frame * fall * (1 + z * 4)) % 2100) - 100;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)" }}>
            <Drop size={size} tint={tint} blur={blur} stretch={1 + Math.min(0.25, fall * z * 0.15)} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
