import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { BODY, DISPLAY } from "../theme";

/** Titre : chaque lettre monte depuis un masque, avec léger flou de mouvement. */
export const TitleReveal: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  gradient?: string;
  stroke?: string;
  glow?: string;
  letterSpacing?: number;
  out?: number; // frame locale de sortie
}> = ({ text, delay = 0, size = 150, gradient = "linear-gradient(180deg,#fff 0%,#ffe9b0 100%)", glow = "rgba(255,200,80,0.5)", letterSpacing = 4, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const outP = out === undefined ? 0 : interpolate(frame, [out, out + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const chars = Array.from(text);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexWrap: "nowrap",
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 1,
        letterSpacing,
        overflow: "hidden",
        padding: "0.28em 0.1em 0.08em",
        opacity: 1 - outP,
        transform: `translateY(${-outP * 60}px)`,
        filter: `blur(${outP * 10}px) drop-shadow(0 0 30px ${glow}) drop-shadow(0 8px 16px rgba(0,0,0,0.6))`,
      }}
    >
      {chars.map((c, i) => {
        const s = spring({ frame: frame - delay - i * 1.6, fps, config: { damping: 16, stiffness: 140, mass: 0.7 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              paddingTop: "0.22em",
              marginTop: "-0.22em",
              transform: `translateY(${(1 - s) * 110}%) rotate(${(1 - s) * 8}deg)`,
              opacity: Math.min(1, s * 1.4),
              backgroundImage: gradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {c}
          </span>
        );
      })}
    </div>
  );
};

/** Sous-titre : glisse + fondu + flou, avec filets décoratifs. */
export const Subtitle: React.FC<{ text: string; delay?: number; size?: number; color?: string; accent?: string; out?: number }> = ({
  text,
  delay = 0,
  size = 46,
  color = "#fff",
  accent = "#F4C66A",
  out,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 90 } });
  const outP = out === undefined ? 0 : interpolate(frame, [out, out + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line = interpolate(s, [0, 1], [0, 70]);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        opacity: s * (1 - outP),
        transform: `translateY(${(1 - s) * 40}px)`,
        filter: `blur(${(1 - s) * 8 + outP * 8}px)`,
      }}
    >
      <div style={{ width: line, height: 3, background: accent, borderRadius: 2 }} />
      <div
        style={{
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: size,
          color,
          letterSpacing: 1,
          textShadow: "0 4px 18px rgba(0,0,0,0.7)",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
      <div style={{ width: line, height: 3, background: accent, borderRadius: 2 }} />
    </div>
  );
};
