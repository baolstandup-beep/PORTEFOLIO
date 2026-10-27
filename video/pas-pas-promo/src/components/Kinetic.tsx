import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

type Props = {
  text: string;
  at: number; // image d'apparition (relative à la séquence)
  exitAt?: number;
  size: number;
  weight?: number;
  color?: string;
  highlight?: string[]; // mots en or
  gradient?: boolean;
  stagger?: number;
  tracking?: number;
  style?: React.CSSProperties;
  maxWidth?: number;
};

// Typographie cinétique : chaque mot monte, se défloute et se met au point.
export const Kinetic: React.FC<Props> = ({
  text,
  at,
  exitAt,
  size,
  weight = 900,
  color = colors.white,
  highlight = [],
  gradient = false,
  stagger = 4,
  tracking = 0.01,
  style,
  maxWidth,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const words = text.split(" ");
  const exit =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        columnGap: size * 0.28,
        rowGap: size * 0.05,
        // Par défaut, le texte reste dans la zone de sécurité (88 % de la largeur).
        maxWidth: maxWidth ?? width * 0.88,
        fontFamily: fonts.display,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.04,
        letterSpacing: `${tracking}em`,
        textAlign: "center",
        opacity: 1 - exit,
        filter: `blur(${exit * 14}px)`,
        transform: `scale(${1 + exit * 0.06})`,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = spring({ frame: frame - at - i * stagger, fps, config: { damping: 18, stiffness: 140, mass: 0.7 } });
        const clean = w.replace(/[!?,.…\u00A0🔔]/gu, "");
        const gold = highlight.includes(clean);
        const paint: React.CSSProperties = gradient
          ? {
              backgroundImage: `linear-gradient(180deg, #FFFFFF 0%, ${colors.accentLight} 55%, ${colors.accent} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }
          : { color: gold ? colors.accent : color };
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.55}px) scale(${1.12 - p * 0.12})`,
              filter: `blur(${(1 - p) * 10}px) drop-shadow(0 ${size * 0.06}px ${size * 0.18}px rgba(0,0,0,0.65))`,
              whiteSpace: "nowrap",
              ...paint,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// Petit sur-titre espacé.
export const Eyebrow: React.FC<{ text: string; at: number; size: number; exitAt?: number; color?: string }> = ({
  text,
  at,
  size,
  exitAt,
  color = colors.greenLight,
}) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [at, at + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const outP =
    exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        fontFamily: fonts.ui,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: `${0.42 - inP * 0.12}em`,
        color,
        opacity: inP * (1 - outP),
        textAlign: "center",
        whiteSpace: "pre-line",
        lineHeight: 1.6,
        textShadow: "0 2px 12px rgba(0,0,0,0.6)",
      }}
    >
      {text}
    </div>
  );
};
