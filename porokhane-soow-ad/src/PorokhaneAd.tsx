import { AbsoluteFill, Audio, Sequence, interpolate } from "remotion";
import { Intro } from "./scenes/Intro";
import { CitronAnanas } from "./scenes/CitronAnanas";
import { BissapBlancGinger } from "./scenes/BissapBlancGinger";
import { Bissap } from "./scenes/Bissap";
import { Packshot } from "./scenes/Packshot";
import { FlareTransition } from "./components/Transitions";
import { ASSETS, SCENES, TOTAL_FRAMES } from "./theme";

const SFX: { src: string; at: number; volume: number }[] = [
  { src: ASSETS.sfx.riser, at: 12, volume: 0.45 },
  { src: ASSETS.sfx.shimmer, at: 12, volume: 0.5 },
  { src: ASSETS.sfx.whoosh, at: SCENES.citron.from - 10, volume: 0.6 },
  { src: ASSETS.sfx.impact, at: SCENES.citron.from, volume: 0.75 },
  { src: ASSETS.sfx.splash, at: SCENES.citron.from + 5, volume: 0.6 },
  { src: ASSETS.sfx.whoosh, at: SCENES.ginger.from - 10, volume: 0.6 },
  { src: ASSETS.sfx.shimmer, at: SCENES.ginger.from + 30, volume: 0.35 },
  { src: ASSETS.sfx.whoosh, at: SCENES.bissap.from - 10, volume: 0.6 },
  { src: ASSETS.sfx.impact, at: SCENES.bissap.from, volume: 0.45 },
  { src: ASSETS.sfx.whoosh, at: SCENES.packshot.from - 10, volume: 0.6 },
  { src: ASSETS.sfx.impact, at: SCENES.packshot.from + 13, volume: 0.5 },
  { src: ASSETS.sfx.splash, at: SCENES.packshot.from + 19, volume: 0.35 },
  { src: ASSETS.sfx.shimmer, at: SCENES.packshot.from + 62, volume: 0.4 },
  { src: ASSETS.sfx.final, at: SCENES.packshot.from + 118, volume: 0.8 },
];

export const PorokhaneAd: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Sequence from={SCENES.intro.from} durationInFrames={SCENES.intro.duration} name="1 · Intro">
      <Intro />
    </Sequence>
    <Sequence from={SCENES.citron.from} durationInFrames={SCENES.citron.duration} name="2 · Citron Ananas">
      <CitronAnanas />
    </Sequence>
    <Sequence from={SCENES.ginger.from} durationInFrames={SCENES.ginger.duration} name="3 · Bissap Blanc Ginger">
      <BissapBlancGinger />
    </Sequence>
    <Sequence from={SCENES.bissap.from} durationInFrames={SCENES.bissap.duration} name="4 · Bissap">
      <Bissap />
    </Sequence>
    <Sequence from={SCENES.packshot.from} durationInFrames={SCENES.packshot.duration} name="5 · Packshot">
      <Packshot />
    </Sequence>

    {/* transitions lumineuses posées sur chaque coupe */}
    <FlareTransition at={SCENES.citron.from} color="255,225,120" />
    <FlareTransition at={SCENES.ginger.from} color="255,200,150" />
    <FlareTransition at={SCENES.bissap.from} color="255,120,170" />
    <FlareTransition at={SCENES.packshot.from} color="255,230,180" />

    {/* musique + effets sonores */}
    <Audio
      src={ASSETS.music}
      volume={(f) => interpolate(f, [0, 6, TOTAL_FRAMES - 20, TOTAL_FRAMES], [0, 0.85, 0.85, 0], { extrapolateRight: "clamp" })}
    />
    {SFX.map((s, i) => (
      <Sequence key={i} from={s.at} name={`sfx-${i}`}>
        <Audio src={s.src} volume={s.volume} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
