import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { StudioBackground, LightRays } from "../components/Background";
import { Particles } from "../components/Particles";
import { Droplets } from "../components/Droplets";
import { Logo } from "../components/Logo";
import { TitleReveal } from "../components/Text";
import { Camera } from "../components/Transitions";
import { useSceneCamera } from "../components/useSceneCamera";
import { SCENES } from "../theme";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = useSceneCamera(SCENES.intro.duration, { push: [1, 1.08], enter: 1, exit: 12, exitScale: 1.6 });
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [44, 64], [0, 520], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <StudioBackground inner="#1b2350" mid="#0a0c1c" outer="#030308" glow="rgba(90,140,255,0.28)" glowY={44} />
      <LightRays color="190,210,255" opacity={0.28} y={42} />
      <Camera {...cam}>
        <Particles count={70} seed="intro" color="255,215,140" speed={0.6} />
        <Droplets count={14} seed="intro-d" fall={0.35} opacity={0.8} />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", top: -120 }}>
          <Logo width={800} delay={8} glintAt={34} />
        </AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "center", top: 1180 }}>
          <TitleReveal
            text="LE GOÛT AUTHENTIQUE"
            delay={34}
            size={92}
            letterSpacing={3}
            gradient="linear-gradient(180deg,#FFFFFF 0%,#FCE7B2 55%,#E8B25A 100%)"
          />
          <div
            style={{
              marginTop: 24,
              width: lineW,
              height: 3,
              background: "linear-gradient(90deg, transparent, #F4C66A, transparent)",
            }}
          />
        </AbsoluteFill>
      </Camera>
    </AbsoluteFill>
  );
};
