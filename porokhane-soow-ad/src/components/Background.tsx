import { AbsoluteFill, useCurrentFrame } from "remotion";

/** Fond studio : dégradé radial + halo animé + vignettage + grain léger. */
export const StudioBackground: React.FC<{
  inner: string;
  mid: string;
  outer?: string;
  glow?: string;
  glowY?: number;
  rim?: [string, string];
}> = ({ inner, mid, outer = "#050507", glow, glowY = 52, rim }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 18) * 0.04;
  return (
    <AbsoluteFill style={{ background: outer }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 85% 60% at 50% ${glowY}%, ${inner} 0%, ${mid} 42%, ${outer} 100%)`,
        }}
      />
      {glow ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% ${glowY}%, ${glow} 0%, transparent 38%)`,
            transform: `scale(${pulse})`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
      {rim ? (
        <>
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 40% 70% at 0% 50%, ${rim[0]} 0%, transparent 70%)`,
              mixBlendMode: "screen",
              opacity: 0.8 + Math.sin(frame / 14) * 0.15,
            }}
          />
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 40% 70% at 100% 45%, ${rim[1]} 0%, transparent 70%)`,
              mixBlendMode: "screen",
              opacity: 0.8 + Math.cos(frame / 16) * 0.15,
            }}
          />
        </>
      ) : null}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)" }}
      />
    </AbsoluteFill>
  );
};

/** Rayons de lumière volumétriques qui tournent lentement. */
export const LightRays: React.FC<{ color?: string; opacity?: number; y?: number }> = ({
  color = "255,230,170",
  opacity = 0.35,
  y = 40,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "screen",
        background: `repeating-conic-gradient(from ${frame * 0.25}deg at 50% ${y}%, rgba(${color},0.0) 0deg, rgba(${color},0.22) 4deg, rgba(${color},0.0) 11deg, rgba(${color},0.0) 22deg)`,
        maskImage: `radial-gradient(circle at 50% ${y}%, black 0%, transparent 65%)`,
        WebkitMaskImage: `radial-gradient(circle at 50% ${y}%, black 0%, transparent 65%)`,
        filter: "blur(6px)",
      }}
    />
  );
};

/** Brume / fumée colorée (taches floues qui dérivent). */
export const Haze: React.FC<{ colors: string[]; opacity?: number }> = ({ colors, opacity = 0.5 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "screen", filter: "blur(70px)" }}>
      {colors.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 700,
            height: 520,
            borderRadius: "50%",
            background: c,
            left: 540 - 350 + Math.sin(frame / (50 + i * 13) + i * 2) * 320,
            top: 300 + i * 420 + Math.cos(frame / (45 + i * 7) + i) * 120,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
