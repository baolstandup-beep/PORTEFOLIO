import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { StudioBackground, LightRays } from "../components/Background";
import { Particles } from "../components/Particles";
import { Droplets } from "../components/Droplets";
import { Bottle } from "../components/Bottle";
import { Splash } from "../components/Splash";
import { FloatingField, FloatItem } from "../components/FloatingField";
import { LemonSlice, PineappleChunk } from "../components/Fruits";
import { TitleReveal, Subtitle } from "../components/Text";
import { Camera } from "../components/Transitions";
import { useSceneCamera } from "../components/useSceneCamera";
import { ASSETS, BOTTLE_RATIO, PALETTE, SCENES } from "../theme";

const ITEMS: FloatItem[] = [
  { el: (s) => <LemonSlice size={s} /> },
  { el: (s) => <PineappleChunk size={s * 0.85} /> },
];

export const CitronAnanas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D = SCENES.citron.duration;
  const cam = useSceneCamera(D, { push: [1, 1.12], roll: [-1.5, 1.5] });
  const enter = spring({ frame: frame - 2, fps, config: { damping: 14, stiffness: 80, mass: 1 } });
  const H = 1160;
  const bob = Math.sin(frame / 14) * 8;
  return (
    <AbsoluteFill>
      <StudioBackground inner="#FFD84A" mid="#7A4C00" outer="#0E0700" glow={PALETTE.citron.glow} glowY={60} />
      <LightRays color="255,236,160" opacity={0.4} y={58} />
      <Camera {...cam}>
        <Particles count={55} seed="cit" color="255,236,150" speed={1.1} />
        <FloatingField items={ITEMS} count={16} seed="cit-f" layer="back" mode="burst" delay={6} center={[540, 1150]} />
        <Splash at={5} color="255,210,40" y={1180} seed="cit-s" power={1.1} />
        <AbsoluteFill style={{ alignItems: "center", top: 600 }}>
          <div
            style={{
              transform: `translateY(${(1 - enter) * 700 + bob}px) scale(${0.45 + enter * 0.55}) rotate(${interpolate(enter, [0, 1], [-16, 0]) + interpolate(frame, [0, D], [-3, 3])}deg)`,
              transformOrigin: "50% 60%",
            }}
          >
            <Bottle
              src={ASSETS.citron}
              ratio={BOTTLE_RATIO.citron}
              height={H}
              glow={PALETTE.citron.glow}
              sheen={interpolate(frame, [26, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              seed="cit-b"
            />
          </div>
        </AbsoluteFill>
        <FloatingField items={ITEMS} count={10} seed="cit-f2" layer="front" mode="burst" delay={6} center={[540, 1150]} />
        <Droplets count={16} seed="cit-d" fall={1.2} tint="255,250,220" />
      </Camera>
      <AbsoluteFill style={{ alignItems: "center", top: 170, gap: 18, flexDirection: "column", justifyContent: "flex-start" }}>
        <TitleReveal
          text="CITRON ANANAS"
          delay={14}
          size={156}
          out={D - 10}
          gradient="linear-gradient(180deg,#FFFFFF 0%,#FFF2A6 45%,#FFC400 100%)"
          glow="rgba(255,200,0,0.55)"
        />
        <Subtitle text="Une explosion de fraîcheur !" delay={30} out={D - 10} accent="#FFE45C" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
