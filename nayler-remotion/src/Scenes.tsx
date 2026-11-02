import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { circleMask, featherMask, featherSides, FLYER_SRC, FlyerCrop } from "./components/FlyerCrop";
import { LightSweep } from "./components/LightSweep";
import { LEFT_PORTRAIT_POLY, R, RIGHT_BADGE_HOLE, RIGHT_PORTRAIT_POLY } from "./regions";
import { T } from "./timeline";


const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Raccourci : spring Remotion sur la frame locale (chaque calque vit dans une <Sequence>). */
const useSpring = (delay = 0, config: Parameters<typeof spring>[0]["config"] = {}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.9, ...config } });
};

/* ─────────────────────────── SCÈNE 1 ─────────────────────────── */

export const TopLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 16 });
  const reveal = interpolate(frame, [0, 18], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <FlyerCrop
      rect={R.topLogo}
      scale={interpolate(s, [0, 1], [0.86, 1])}
      y={interpolate(s, [0, 1], [-24, 0])}
      opacity={interpolate(frame, [0, 8], [0, 1], clamp)}
      mask={featherMask(30)}
      maskComposite="intersect"
      clipPath={`inset(0 ${100 - reveal}% 0 0)`}
      filter={`blur(${interpolate(s, [0, 1], [6, 0])}px)`}
    >
      <LightSweep frame={frame} start={10} duration={26} width={110} opacity={0.9} />
    </FlyerCrop>
  );
};

/* ─────────────────────────── SCÈNE 2 ─────────────────────────── */

/** Parallaxe 2.5D : chaque profondeur se recale sur sa position d'origine à T.parallaxEnd. */
const useParallax = (from: number, amount: number) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, T.parallaxEnd - from], [amount, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });
};

export const LeftPortrait: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 20, mass: 1.1 });
  const par = useParallax(T.leftPortrait, -16);
  return (
    <FlyerCrop
      rect={R.leftPortrait}
      poly={LEFT_PORTRAIT_POLY}
      mask={featherSides(60, 10, 30, 24)}
      maskComposite="intersect"
      x={interpolate(s, [0, 1], [-150, 0]) + par}
      scale={interpolate(s, [0, 1], [1.06, 1])}
      opacity={interpolate(frame, [0, 10], [0, 1], clamp)}
      filter={`blur(${interpolate(s, [0, 0.8], [8, 0], clamp)}px)`}
      transformOrigin="50% 100%"
    >
      <LightSweep
        frame={frame}
        start={T.clothSweep - T.leftPortrait}
        duration={40}
        width={160}
        angle={-18}
        opacity={0.45}
        blend="soft-light"
      />
    </FlyerCrop>
  );
};

export const RightPortrait: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 20, mass: 1.1 });
  const par = useParallax(T.rightPortrait, 20);
  return (
    <FlyerCrop
      rect={R.rightPortrait}
      poly={RIGHT_PORTRAIT_POLY}
      hole={RIGHT_BADGE_HOLE}
      mask={featherSides(60, 10, 60, 90)}
      maskComposite="intersect"
      x={interpolate(s, [0, 1], [170, 0]) + par}
      scale={interpolate(s, [0, 1], [1.06, 1])}
      opacity={interpolate(frame, [0, 10], [0, 1], clamp)}
      filter={`blur(${interpolate(s, [0, 0.8], [8, 0], clamp)}px)`}
      transformOrigin="50% 100%"
    >
      <LightSweep
        frame={frame}
        start={T.clothSweep - T.rightPortrait + 6}
        duration={40}
        width={180}
        angle={-18}
        opacity={0.45}
        blend="soft-light"
      />
    </FlyerCrop>
  );
};

export const PasLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 13 });
  const r = R.pasLogo;
  return (
    <FlyerCrop
      rect={r}
      scale={interpolate(s, [0, 1], [0.6, 1])}
      rotate={interpolate(s, [0, 1], [-25, 0])}
      opacity={interpolate(frame, [0, 10], [0, 1], clamp)}
      mask={circleMask(r.w / 2 - 1, r.h / 2, 120, 8)}
    />
  );
};

const Badge: React.FC<{ rect: typeof R.leftBadge; fromLeft: boolean }> = ({ rect, fromLeft }) => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 16 });
  const p = interpolate(frame, [0, 16], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });
  const inset = fromLeft ? `inset(0 ${100 - p}% 0 0 round 22px)` : `inset(0 0 0 ${100 - p}% round 22px)`;
  return (
    <FlyerCrop
      rect={rect}
      x={interpolate(s, [0, 1], [fromLeft ? -40 : 40, 0])}
      clipPath={inset}
      opacity={interpolate(frame, [0, 6], [0, 1], clamp)}
    >
      <LightSweep frame={frame} start={12} duration={22} width={80} opacity={0.8} />
    </FlyerCrop>
  );
};
export const LeftBadge: React.FC = () => <Badge rect={R.leftBadge} fromLeft />;
export const RightBadge: React.FC = () => <Badge rect={R.rightBadge} fromLeft={false} />;

/* ─────────────────────────── SCÈNE 3 ─────────────────────────── */

export const TitleGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, 4, 30, 80], [0, 0.75, 0.3, 0.18], clamp);
  const sc = interpolate(frame, [0, 30], [0.6, 1.1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const r = R.title;
  return (
    <div
      style={{
        position: "absolute",
        left: r.x - 120,
        top: r.y - 80,
        width: r.w + 240,
        height: r.h + 160,
        background: "radial-gradient(closest-side, rgba(20,170,90,0.85), rgba(20,170,90,0) 75%)",
        opacity: o,
        transform: `scale(${sc})`,
        filter: "blur(10px)",
      }}
    />
  );
};

export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 11, stiffness: 140, mass: 0.8 });
  return (
    <FlyerCrop
      rect={R.title}
      scale={interpolate(s, [0, 1], [1.55, 1])}
      opacity={interpolate(frame, [0, 4], [0, 1], clamp)}
      filter={`blur(${interpolate(frame, [0, 6], [10, 0], clamp)}px)`}
      mask={featherMask(14)}
      maskComposite="intersect"
    >
      {/* overlay : blanc reste blanc, le vert des lettres s'illumine */}
      <LightSweep
        frame={frame}
        start={T.titleSweep - T.title}
        duration={30}
        width={130}
        angle={18}
        opacity={1}
        blend="overlay"
      />
    </FlyerCrop>
  );
};

export const Mic: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 9, stiffness: 120 });
  // rebond résiduel subtil après l'arrivée
  const wobble = Math.sin(frame / 5) * 4 * Math.exp(-frame / 28);
  const r = R.mic;
  return (
    <FlyerCrop
      rect={r}
      scale={interpolate(s, [0, 1], [0.2, 1])}
      rotate={interpolate(s, [0, 1], [-60, 0]) + wobble}
      opacity={interpolate(frame, [0, 5], [0, 1], clamp)}
      mask={circleMask(71, 80, 66, 4)}
      transformOrigin="71px 80px"
    />
  );
};

/* ─────────────────────────── SCÈNE 4 ─────────────────────────── */

export const BannerPlate: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const r = R.banner;
  return (
    <>
      <FlyerCrop
        rect={r}
        plateSrc={staticFile("plates/banner-clean.png")}
        clipPath={`inset(0 ${(1 - p) * 100}% 0 0 round 26px)`}
        scale={interpolate(p, [0, 1], [0.97, 1])}
      />
      {p > 0 && p < 1 && (
        <div
          style={{
            position: "absolute",
            left: r.x + p * r.w - 30,
            top: r.y - 10,
            width: 60,
            height: r.h + 20,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(220,255,235,0.9), rgba(255,255,255,0))",
            filter: "blur(8px)",
            mixBlendMode: "screen",
          }}
        />
      )}
    </>
  );
};

export const Calendar: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 10, stiffness: 150 });
  return (
    <FlyerCrop
      rect={R.calendar}
      scale={interpolate(s, [0, 1], [0, 1])}
      rotate={interpolate(s, [0, 1], [-18, 0])}
      opacity={interpolate(frame, [0, 4], [0, 1], clamp)}
      mask={featherMask(6)}
      maskComposite="intersect"
    />
  );
};

export const Mardi: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 18 });
  return (
    <FlyerCrop
      rect={R.mardi}
      innerX={interpolate(s, [0, 1], [-R.mardi.w * 0.7, 0])}
      opacity={interpolate(frame, [0, 8], [0, 1], clamp)}
      mask={featherMask(8)}
      maskComposite="intersect"
    />
  );
};

export const APartirDe: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 18 });
  return (
    <FlyerCrop
      rect={R.aPartirDe}
      innerY={interpolate(s, [0, 1], [R.aPartirDe.h, 0])}
      opacity={interpolate(frame, [0, 8], [0, 1], clamp)}
      mask={featherMask(5)}
      maskComposite="intersect"
    />
  );
};

export const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 14 });
  return (
    <FlyerCrop
      rect={R.clock}
      scale={interpolate(s, [0, 1], [0.3, 1])}
      rotate={interpolate(s, [0, 1], [-300, 0])}
      opacity={interpolate(frame, [0, 5], [0, 1], clamp)}
      mask={circleMask(42, 37, 33, 3)}
      transformOrigin="42px 37px"
    />
  );
};

export const Hour: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 15, stiffness: 120 });
  const glowAt = T.hourGlow - T.hour;
  const pulse = interpolate(frame, [glowAt, glowAt + 10, glowAt + 28], [0, 1, 0.25], clamp);
  const scale = 1 + 0.07 * interpolate(frame, [glowAt, glowAt + 8, glowAt + 22], [0, 1, 0], clamp);
  // révélation type « compteur » : le chiffre monte depuis le bas avec un flou de mouvement
  const motionBlur = interpolate(s, [0, 0.7, 1], [6, 2, 0], clamp);
  return (
    <FlyerCrop
      rect={R.hour}
      innerY={interpolate(s, [0, 1], [R.hour.h * 1.1, 0])}
      opacity={interpolate(frame, [0, 6], [0, 1], clamp)}
      scale={scale}
      mask={featherMask(6)}
      maskComposite="intersect"
      filter={`blur(${motionBlur}px) drop-shadow(0 0 ${14 * pulse}px rgba(255,255,255,${0.9 * pulse}))`}
      style={{ overflow: "visible" }}
    >
      <LightSweep frame={frame} start={glowAt} duration={22} width={70} opacity={0.9} />
    </FlyerCrop>
  );
};

/* ─────────────────────────── SCÈNE 5 ─────────────────────────── */

export const BottomLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useSpring(0, { damping: 13 });
  return (
    <FlyerCrop
      rect={R.bottomLogo}
      scale={interpolate(s, [0, 1], [0.8, 1])}
      y={interpolate(s, [0, 1], [40, 0])}
      opacity={interpolate(frame, [0, 6], [0, 1], clamp)}
      mask={featherMask(10)}
      maskComposite="intersect"
    />
  );
};

/** Le flyer original, intact, repasse au premier plan : fidélité pixel garantie. */
export const MasterFlyer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Img
      src={FLYER_SRC}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 960,
        height: 1280,
        opacity: interpolate(frame, [0, 15], [0, 1], clamp),
      }}
    />
  );
};

export const LogoHalo: React.FC = () => {
  const frame = useCurrentFrame();
  const r = R.bottomLogo;
  const o = interpolate(frame, [0, 12, 40], [0, 0.85, 0.35], clamp) * (0.85 + 0.15 * Math.sin(frame / 9));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: r.x - 90,
          top: r.y - 50,
          width: r.w + 180,
          height: r.h + 100,
          background: "radial-gradient(closest-side, rgba(255,255,255,0.95), rgba(255,80,80,0.25) 55%, rgba(255,255,255,0) 100%)",
          mixBlendMode: "screen",
          opacity: o,
          filter: "blur(14px)",
        }}
      />
      {/* reflet qui traverse le logo, posé sur une découpe identique au flyer */}
      <FlyerCrop rect={R.bottomLogo} mask={featherMask(10)} maskComposite="intersect">
        <LightSweep frame={frame} start={4} duration={26} width={90} opacity={0.95} />
      </FlyerCrop>
    </>
  );
};

export const FinalSweep: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <LightSweep frame={frame} start={0} duration={40} width={300} angle={22} opacity={0.35} blend="soft-light" />
    </AbsoluteFill>
  );
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: "#ffffff",
        opacity: interpolate(frame, [0, 16], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) }),
      }}
    />
  );
};
