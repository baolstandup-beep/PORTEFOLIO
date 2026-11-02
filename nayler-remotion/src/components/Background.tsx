import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, useCurrentFrame } from "remotion";
import { FLYER_H, FLYER_W } from "../regions";
import { T } from "../timeline";
import { FLYER_SRC } from "./FlyerCrop";
import { LightSweep } from "./LightSweep";

/**
 * Plaque de fond « rack focus » : le flyer original flouté. Les éléments
 * nets viennent se poser dessus ; le flyer net intégral reprend la main en
 * scène 5 (voir <MasterFlyer/>).
 */
export const BasePlate: React.FC = () => {
  const frame = useCurrentFrame();
  const blur = interpolate(frame, [0, 150, 330], [30, 24, 12], {
    extrapolateRight: "clamp",
  });
  const veil = interpolate(frame, [0, 60, 330], [0.45, 0.3, 0.12], {
    extrapolateRight: "clamp",
  });
  const fromWhite = interpolate(frame, [T.bgIn, T.bgIn + 22], [1, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  // Parallaxe : le fond bouge moins (et en sens inverse) que les portraits.
  const drift = interpolate(frame, [0, T.parallaxEnd], [10, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const zoom = interpolate(frame, [0, T.parallaxEnd], [1.08, 1.0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img
        src={FLYER_SRC}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: FLYER_W,
          height: FLYER_H,
          filter: `blur(${blur}px) saturate(1.1)`,
          transform: `translateX(${drift}px) scale(${zoom})`,
        }}
      />
      <AbsoluteFill style={{ background: `rgba(255,255,255,${veil})` }} />
      <LightSweep frame={frame} start={4} duration={42} width={260} angle={25} opacity={0.7} />
      <Bokeh frame={frame} />
      <AbsoluteFill style={{ background: "#fff", opacity: fromWhite }} />
    </div>
  );
};

/** Particules lumineuses douces qui flottent (profondeur 2.5D). */
const Bokeh: React.FC<{ frame: number }> = ({ frame }) => {
  const dots = new Array(16).fill(0).map((_, i) => {
    const x = random(`x${i}`) * FLYER_W;
    const y0 = random(`y${i}`) * FLYER_H;
    const r = 6 + random(`r${i}`) * 18;
    const speed = 0.25 + random(`s${i}`) * 0.6;
    const y = ((y0 - frame * speed) % FLYER_H + FLYER_H) % FLYER_H;
    const tw = 0.12 + 0.12 * Math.sin(frame / 18 + i);
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          background: i % 3 === 0 ? "rgba(46,190,110,0.9)" : "rgba(255,255,255,1)",
          filter: `blur(${r / 2.5}px)`,
          opacity: tw,
        }}
      />
    );
  });
  return <>{dots}</>;
};

/**
 * Formes géométriques vertes/blanches qui balayent l'écran pendant l'intro,
 * dans l'esprit des rubans du flyer.
 */
export const Ribbons: React.FC = () => {
  const frame = useCurrentFrame();
  const bands = [
    { delay: 0, w: 520, color: ["#0a6b3c", "#13a35b"], o: 0.92 },
    { delay: 6, w: 160, color: ["#ffffff", "#e8f5ee"], o: 0.95 },
    { delay: 10, w: 340, color: ["#0d8a4c", "#1fc06d"], o: 0.85 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {bands.map((b, i) => {
        const p = interpolate(frame, [b.delay, b.delay + 34], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.cubic),
        });
        if (p <= 0 || p >= 1) return null;
        const x = interpolate(p, [0, 1], [-900, 1500]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -400,
              left: x,
              width: b.w,
              height: FLYER_H + 800,
              transform: "rotate(28deg)",
              background: `linear-gradient(90deg, ${b.color[0]}, ${b.color[1]})`,
              opacity: b.o,
              boxShadow: "0 0 60px rgba(0,0,0,0.18)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
