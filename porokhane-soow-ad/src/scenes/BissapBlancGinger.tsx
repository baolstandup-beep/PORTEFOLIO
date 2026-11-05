import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { StudioBackground, LightRays } from "../components/Background";
import { Particles } from "../components/Particles";
import { Droplets } from "../components/Droplets";
import { Bottle } from "../components/Bottle";
import { FloatingField, FloatItem } from "../components/FloatingField";
import { BissapBlancFlake, GingerSlice } from "../components/Fruits";
import { TitleReveal, Subtitle } from "../components/Text";
import { Camera } from "../components/Transitions";
import { useSceneCamera } from "../components/useSceneCamera";
import { ASSETS, BOTTLE_RATIO, PALETTE, SCENES } from "../theme";

const ITEMS: FloatItem[] = [
  { el: (s) => <GingerSlice size={s * 0.9} /> },
  { el: (s) => <BissapBlancFlake size={s * 0.75} /> },
];

export const BissapBlancGinger: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D = SCENES.ginger.duration;
  const cam = useSceneCamera(D, { push: [1.02, 1.12], roll: [3, -1.5] });
  // entrée sur une trajectoire circulaire (arc de cercle) avec rotation
  const p = spring({ frame, fps, config: { damping: 16, stiffness: 60, mass: 1 } });
  const theta = (1 - p) * Math.PI * 0.95;
  const dx = Math.sin(theta) * 760;
  const dy = (1 - Math.cos(theta)) * -160;
  const rot = (1 - p) * 38 + interpolate(frame, [0, D], [2, -2]);
  const H = 1100;
  return (
    <AbsoluteFill>
      <StudioBackground inner="#F2A35A" mid="#5E2A0B" outer="#0C0502" glow={PALETTE.ginger.glow} glowY={62} />
      <LightRays color="255,215,170" opacity={0.32} y={60} />
      <Camera {...cam}>
        <Particles count={80} seed="gin" color="255,210,150" speed={0.7} swirl={0.55} />
        <FloatingField items={ITEMS} count={14} seed="gin-f" layer="back" mode="orbit" center={[540, 1180]} />
        <AbsoluteFill style={{ alignItems: "center", top: 640 }}>
          <div
            style={{
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${0.7 + p * 0.3})`,
              transformOrigin: "50% 70%",
            }}
          >
            <Bottle
              src={ASSETS.ginger}
              ratio={BOTTLE_RATIO.ginger}
              height={H}
              glow={PALETTE.ginger.glow}
              sheen={interpolate(frame, [30, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              seed="gin-b"
            />
          </div>
        </AbsoluteFill>
        <FloatingField items={ITEMS} count={14} seed="gin-f" layer="front" mode="orbit" center={[540, 1180]} />
        <Droplets count={10} seed="gin-d" fall={0.6} tint="255,235,210" opacity={0.85} />
      </Camera>
      <AbsoluteFill style={{ alignItems: "center", top: 150, flexDirection: "column", justifyContent: "flex-start" }}>
        <TitleReveal
          text="BISSAP BLANC"
          delay={12}
          size={124}
          out={D - 10}
          gradient="linear-gradient(180deg,#FFFFFF 0%,#FBE6C8 60%,#E9C08A 100%)"
          glow="rgba(255,190,120,0.5)"
        />
        <div style={{ marginTop: -18 }}>
          <TitleReveal
            text="GINGER"
            delay={20}
            size={164}
            letterSpacing={14}
            out={D - 10}
            gradient="linear-gradient(180deg,#FFE3A8 0%,#F0A040 55%,#C8641C 100%)"
            glow="rgba(255,150,60,0.55)"
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <Subtitle text="Une saveur unique" delay={34} out={D - 10} accent="#FFC98A" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
