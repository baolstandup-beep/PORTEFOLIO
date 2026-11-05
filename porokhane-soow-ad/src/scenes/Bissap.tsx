import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { StudioBackground, Haze } from "../components/Background";
import { Particles } from "../components/Particles";
import { Bottle } from "../components/Bottle";
import { FloatingField, FloatItem } from "../components/FloatingField";
import { HibiscusPetal } from "../components/Fruits";
import { TitleReveal, Subtitle } from "../components/Text";
import { Camera } from "../components/Transitions";
import { useSceneCamera } from "../components/useSceneCamera";
import { ASSETS, BOTTLE_RATIO, PALETTE, SCENES } from "../theme";

const ITEMS: FloatItem[] = [0, 1, 2].map((shade) => ({ el: (s: number) => <HibiscusPetal size={s * 0.8} shade={shade} /> }));

export const Bissap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const D = SCENES.bissap.duration;
  const cam = useSceneCamera(D, { push: [1.04, 1.16], roll: [-2, 0.5], drift: [20, -20] });
  const rise = spring({ frame: frame - 2, fps, config: { damping: 20, stiffness: 55 } });
  const H = 1120;
  return (
    <AbsoluteFill>
      <StudioBackground
        inner="#C0174A"
        mid="#3A0732"
        outer="#06020A"
        glow={PALETTE.bissap.glow}
        glowY={62}
        rim={["rgba(255,40,80,0.55)", "rgba(130,60,255,0.55)"]}
      />
      <Haze colors={["rgba(200,20,70,0.9)", "rgba(110,40,220,0.8)", "rgba(170,20,110,0.8)"]} opacity={0.45} />
      <Camera {...cam}>
        <Particles count={50} seed="bis" color="255,140,190" speed={0.5} direction={-1} />
        <FloatingField items={ITEMS} count={16} seed="bis-f" layer="back" mode="fall" />
        <AbsoluteFill style={{ alignItems: "center", top: 620 }}>
          <div
            style={{
              transform: `translateY(${(1 - rise) * 1100}px) rotate(${interpolate(frame, [0, D], [-2.5, 2])}deg)`,
              transformOrigin: "50% 80%",
            }}
          >
            <Bottle
              src={ASSETS.bissap}
              ratio={BOTTLE_RATIO.bissap}
              height={H}
              glow={PALETTE.bissap.glow}
              sheen={interpolate(frame, [34, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
              seed="bis-b"
            />
          </div>
        </AbsoluteFill>
        <FloatingField items={ITEMS} count={10} seed="bis-f" layer="front" mode="fall" />
      </Camera>
      <AbsoluteFill style={{ alignItems: "center", top: 150, flexDirection: "column", justifyContent: "flex-start" }}>
        <TitleReveal
          text="BISSAP"
          delay={14}
          size={220}
          letterSpacing={18}
          out={D - 10}
          gradient="linear-gradient(180deg,#FFFFFF 0%,#FFB3C8 45%,#E0245A 100%)"
          glow="rgba(255,40,100,0.6)"
        />
        <div style={{ marginTop: 4 }}>
          <Subtitle text="Le plaisir à chaque gorgée" delay={30} out={D - 10} accent="#FF4D7A" />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
