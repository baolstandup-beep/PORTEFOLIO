import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { StudioBackground, LightRays } from "../components/Background";
import { Particles } from "../components/Particles";
import { Droplets } from "../components/Droplets";
import { Bottle } from "../components/Bottle";
import { Splash } from "../components/Splash";
import { Logo } from "../components/Logo";
import { TitleReveal } from "../components/Text";
import { Camera } from "../components/Transitions";
import { ASSETS, BOTTLE_RATIO, PALETTE } from "../theme";

const H = 980;
const BASE_Y = 1560; // ligne de pose des bouteilles sur le podium
const BOTTLES = [
  { src: ASSETS.citron, ratio: BOTTLE_RATIO.citron, cx: 235, glow: PALETTE.citron.glow, delay: 4, splash: "255,210,40" },
  { src: ASSETS.ginger, ratio: BOTTLE_RATIO.ginger, cx: 540, glow: PALETTE.ginger.glow, delay: 10, splash: "240,160,80" },
  { src: ASSETS.bissap, ratio: BOTTLE_RATIO.bissap, cx: 845, glow: PALETTE.bissap.glow, delay: 16, splash: "200,20,70" },
];

const Podium: React.FC<{ appear: number }> = ({ appear }) => (
  <div style={{ position: "absolute", left: 40, top: BASE_Y - 70 + (1 - appear) * 500, width: 1000, opacity: appear }}>
    {/* corps */}
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 0,
        width: 1000,
        height: 520,
        background: "linear-gradient(90deg,#141018 0%,#2c2433 30%,#3a3040 50%,#2c2433 70%,#141018 100%)",
        borderRadius: "0 0 40px 40px",
      }}
    />
    {/* liseré doré */}
    <div
      style={{
        position: "absolute",
        top: 78,
        left: 0,
        width: 1000,
        height: 16,
        borderRadius: "50%",
        background: "linear-gradient(90deg,#7a5a20,#F4C66A,#FFF1C4,#F4C66A,#7a5a20)",
        filter: "blur(0.5px)",
      }}
    />
    {/* plateau */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1000,
        height: 170,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 35%, #5a4c62 0%, #2a2230 60%, #17121c 100%)",
        boxShadow: "inset 0 6px 20px rgba(255,255,255,0.15), 0 0 80px rgba(244,198,106,0.25)",
      }}
    />
  </div>
);

export const Packshot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // caméra : arrivée par zoom, puis léger recul cinématique
  const inP = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const scale = interpolate(frame, [0, 90], [1.14, 1.0], { ...clamp, easing: Easing.inOut(Easing.cubic) }) * interpolate(inP, [0, 1], [1.25, 1]);
  const camY = interpolate(frame, [0, 90], [-60, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const podium = spring({ frame, fps, config: { damping: 20, stiffness: 70 } });
  const sheen = interpolate(frame, [62, 100], [0, 1], clamp);
  const finalPulse = spring({ frame: frame - 118, fps, config: { damping: 9, stiffness: 160 } });
  const flash = interpolate(frame, [118, 120, 130], [0, 0.3, 0], clamp);
  const fadeOut = interpolate(frame, [140, 150], [1, 0.85], clamp);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <StudioBackground inner="#3B2F4F" mid="#110D18" outer="#030205" glow="rgba(244,198,106,0.28)" glowY={58} />
      <LightRays color="255,226,160" opacity={0.42} y={8} />
      {/* spot zénithal */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 45% 75% at 50% 0%, rgba(255,236,190,0.32) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
      <Camera scale={scale} y={camY} blur={(1 - inP) * 14}>
        <Particles count={60} seed="pack" color="255,220,150" speed={0.45} />
        <Podium appear={podium} />
        {BOTTLES.map((b, i) => {
          const s = spring({ frame: frame - b.delay, fps, config: { damping: 13, stiffness: 120, mass: 1.1 } });
          const w = H * b.ratio;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: b.cx - w / 2,
                top: BASE_Y - H,
                transform: `translateY(${(1 - s) * -1500}px)`,
              }}
            >
              <Bottle
                src={b.src}
                ratio={b.ratio}
                height={H}
                glow={b.glow}
                reflection
                reflectionOpacity={0.22}
                sheen={interpolate(sheen, [i * 0.12, 0.76 + i * 0.12], [0, 1], clamp)}
                seed={`pack-${i}`}
              />
            </div>
          );
        })}
        {BOTTLES.map((b, i) => (
          <Splash key={i} at={b.delay + 9} color={b.splash} x={b.cx} y={BASE_Y - 10} count={18} seed={`ps-${i}`} power={0.45} />
        ))}
        <Droplets count={12} seed="pack-d" fall={0.4} opacity={0.7} />
      </Camera>
      {/* logo + signature */}
      <AbsoluteFill style={{ alignItems: "center", top: 120, flexDirection: "column", justifyContent: "flex-start" }}>
        <div style={{ transform: `scale(${1 + finalPulse * 0.06 - (finalPulse > 0.99 ? 0 : 0)})` }}>
          <Logo width={720} delay={34} glintAt={118} glow="rgba(244,198,106,0.55)" />
        </div>
        <div style={{ marginTop: 6 }}>
          <TitleReveal
            text="LE GOÛT QUI VOUS RASSEMBLE"
            delay={58}
            size={72}
            letterSpacing={3}
            gradient="linear-gradient(180deg,#FFFFFF 0%,#FCE7B2 50%,#E8B25A 100%)"
            glow="rgba(244,198,106,0.55)"
          />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `rgba(255,240,210,${flash})`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
