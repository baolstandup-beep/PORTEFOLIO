import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ASSETS } from "../theme";

/** Logo original extrait de l'étiquette, avec entrée ressort, halo et reflet. */
export const Logo: React.FC<{ width?: number; delay?: number; glintAt?: number; glow?: string }> = ({
  width = 760,
  delay = 0,
  glintAt = 25,
  glow = "rgba(120,170,255,0.55)",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 110, mass: 0.9 } });
  const blur = interpolate(s, [0, 1], [24, 0]);
  const g = interpolate(frame, [glintAt, glintAt + 18], [-0.4, 1.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const height = width * (365 / 865);
  const mask: React.CSSProperties = {
    WebkitMaskImage: `url(${ASSETS.logo})`,
    maskImage: `url(${ASSETS.logo})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        transform: `scale(${0.55 + s * 0.45}) rotate(${(1 - s) * -6}deg)`,
        opacity: Math.min(1, s * 1.5),
        filter: `blur(${blur}px) drop-shadow(0 0 40px ${glow}) drop-shadow(0 18px 30px rgba(0,0,0,0.6))`,
      }}
    >
      <Img src={ASSETS.logo} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...mask,
          background: `linear-gradient(110deg, transparent ${(g - 0.15) * 100}%, rgba(255,255,255,0.85) ${g * 100}%, transparent ${(g + 0.15) * 100}%)`,
          mixBlendMode: "screen",
        }}
      />
    </div>
  );
};
