import React from "react";
import { CHANNEL } from "../brand";
import { colors, fonts, useLayout } from "../theme";
import { Logo3D } from "./Logo";
import { BellIcon } from "./Ui";

// Géométrie partagée par les scènes 4 et 5 (le curseur et le zoom visent le bouton).
export const useCardGeometry = () => {
  const { width, height, vertical, u, safe } = useLayout();
  const cx = vertical ? (safe.left + width - safe.right) / 2 : width / 2;
  const cy = vertical ? height * 0.47 : height * 0.56;
  const cardW = vertical ? 780 * u : 1340 * u;
  const cardH = vertical ? 600 * u : 270 * u;
  const btnW = 340 * u;
  const btnH = 92 * u;
  const btn = vertical
    ? { x: cx, y: cy + cardH / 2 - 70 * u - btnH / 2 }
    : { x: cx + cardW / 2 - 60 * u - btnW / 2, y: cy };
  // Icône de cloche du bouton « ABONNÉ » (moitié gauche du bouton).
  const bell = { x: btn.x - btnW / 2 + 62 * u, y: btn.y };
  return { cx, cy, cardW, cardH, btnW, btnH, btn, bell, u, vertical };
};

type Props = {
  pop: number; // 0 → 1 (+ rebond) : apparition du bouton
  subscribed: number; // 0 → 1 : transition vers l'état « ABONNÉ »
  glow: number;
};

// Représentation stylisée (non interactive) d'un en-tête de chaîne.
export const ChannelCard: React.FC<Props> = ({ pop, subscribed, glow }) => {
  const g = useCardGeometry();
  const { cx, cy, cardW, cardH, btnW, btnH, btn, u, vertical } = g;
  const avatar = vertical ? 210 * u : 170 * u;

  const textBlock = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", gap: 8 * u }}>
      <div style={{ fontFamily: fonts.display, fontWeight: 800, fontSize: (vertical ? 62 : 54) * u, color: colors.white, letterSpacing: "-0.01em" }}>
        {CHANNEL.name}
      </div>
      <div style={{ fontFamily: fonts.ui, fontWeight: 500, fontSize: 30 * u, color: colors.mist }}>{CHANNEL.handle}</div>
    </div>
  );

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - cardW / 2,
          top: cy - cardH / 2,
          width: cardW,
          height: cardH,
          borderRadius: 36 * u,
          background: "linear-gradient(160deg, rgba(30,36,33,0.96), rgba(12,16,14,0.96))",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: `0 ${40 * u}px ${90 * u}px rgba(0,0,0,0.6)`,
          display: "flex",
          flexDirection: vertical ? "column" : "row",
          alignItems: "center",
          justifyContent: vertical ? "flex-start" : "flex-start",
          padding: vertical ? `${60 * u}px 0 0` : `0 ${60 * u}px`,
          gap: vertical ? 34 * u : 40 * u,
          boxSizing: "border-box",
        }}
      >
        <Logo3D size={avatar} rim={0.35} shadow={0} />
        {textBlock}
      </div>

      {/* Bouton S'ABONNER → ABONNÉ */}
      <div
        style={{
          position: "absolute",
          left: btn.x - btnW / 2,
          top: btn.y - btnH / 2,
          width: btnW,
          height: btnH,
          transform: `scale(${pop})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -18 * u,
            borderRadius: btnH,
            background: colors.subscribe,
            filter: `blur(${26 * u}px)`,
            opacity: glow * (1 - subscribed) * 0.8,
          }}
        />
        <Pill color={colors.subscribe} textColor="#fff" opacity={1 - subscribed} height={btnH}>
          S'ABONNER
        </Pill>
        <Pill color="#3A3F3C" textColor="#F1F1F1" opacity={subscribed} height={btnH}>
          <span style={{ display: "flex", alignItems: "center", gap: 16 * u }}>
            <BellIcon size={40 * u} filled={false} color="#F1F1F1" />
            ABONNÉ
          </span>
        </Pill>
      </div>
    </>
  );
};

const Pill: React.FC<{ color: string; textColor: string; opacity: number; height: number; children: React.ReactNode }> = ({
  color,
  textColor,
  opacity,
  height,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      borderRadius: height,
      background: color,
      color: textColor,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.ui,
      fontWeight: 700,
      fontSize: height * 0.36,
      letterSpacing: "0.04em",
      opacity,
    }}
  >
    {children}
  </div>
);
