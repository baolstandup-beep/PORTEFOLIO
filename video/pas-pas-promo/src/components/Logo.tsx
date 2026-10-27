import React from "react";
import { Img } from "remotion";
import { logoSrc } from "../brand";
import { colors, fonts } from "../theme";

type Props = {
  size: number;
  rotateY?: number; // degrés
  rotateX?: number;
  glint?: number; // 0 → 1 : position du reflet balayant le logo
  rim?: number; // 0 → 1 : intensité de la lumière de contour
  shadow?: number; // 0 → 1
};

// Logo en « 3D » : perspective, reflet spéculaire, liseré lumineux, ombre portée.
// Si public/brand/logo.png existe, le logo original est utilisé tel quel (aucune
// retouche) ; sinon un remplacement typographique temporaire est affiché.
export const Logo3D: React.FC<Props> = ({ size, rotateY = 0, rotateX = 0, glint = -1, rim = 1, shadow = 1 }) => {
  const src = logoSrc();
  return (
    <div style={{ position: "relative", width: size, height: size, perspective: size * 3 }}>
      {/* Ombre au sol */}
      <div
        style={{
          position: "absolute",
          left: size * 0.1,
          right: size * 0.1,
          bottom: -size * 0.16,
          height: size * 0.12,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.75)",
          filter: `blur(${size * 0.06}px)`,
          opacity: shadow * (0.6 + 0.4 * Math.cos((rotateY * Math.PI) / 180)),
        }}
      />
      {/* Halo de contour */}
      <div
        style={{
          position: "absolute",
          inset: -size * 0.08,
          borderRadius: "50%",
          background: `conic-gradient(from ${rotateY * 2}deg, ${colors.gold}, ${colors.green}, ${colors.goldLight}, ${colors.green}, ${colors.gold})`,
          filter: `blur(${size * 0.07}px)`,
          opacity: rim * 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {/* Tranche : quelques couches empilées donnent l'épaisseur */}
        {[6, 4, 2].map((d) => (
          <div
            key={d}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              transform: `translateZ(${-d * size * 0.004}px)`,
              background: `linear-gradient(135deg, ${colors.goldLight}, #7A5A0A)`,
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            overflow: "hidden",
            boxShadow: `0 0 0 ${size * 0.018}px ${colors.gold}, 0 ${size * 0.04}px ${size * 0.12}px rgba(0,0,0,0.6)`,
            backfaceVisibility: "hidden",
          }}
        >
          {src ? (
            <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Wordmark size={size} />
          )}
          {/* Reflet spéculaire */}
          <div
            style={{
              position: "absolute",
              top: -size * 0.5,
              bottom: -size * 0.5,
              width: size * 0.35,
              left: `${-40 + glint * 160}%`,
              transform: "rotate(20deg)",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              mixBlendMode: "screen",
            }}
          />
          {/* Éclairage directionnel */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at ${50 - rotateY * 0.6}% 25%, rgba(255,255,255,0.22), transparent 55%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Remplacement temporaire : ce n'est PAS le logo officiel. Il disparaît dès que
// public/brand/logo.png est fourni.
const Wordmark: React.FC<{ size: number }> = ({ size }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(circle at 50% 35%, #0F5B33 0%, #06311B 70%)`,
    }}
  >
    <div style={{ display: "flex", gap: size * 0.025, marginBottom: size * 0.05 }}>
      {[colors.green, colors.gold, colors.red].map((c) => (
        <div key={c} style={{ width: size * 0.1, height: size * 0.022, borderRadius: size, background: c }} />
      ))}
    </div>
    <div
      style={{
        fontFamily: fonts.display,
        fontWeight: 900,
        fontSize: size * 0.2,
        letterSpacing: "-0.02em",
        color: colors.white,
        lineHeight: 1,
      }}
    >
      PAS-PAS
    </div>
    <div
      style={{
        fontFamily: fonts.ui,
        fontWeight: 700,
        fontSize: size * 0.065,
        letterSpacing: "0.38em",
        color: colors.gold,
        marginTop: size * 0.04,
        marginRight: -size * 0.025,
      }}
    >
      OFFICIEL
    </div>
  </div>
);
