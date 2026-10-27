import React from "react";
import { AbsoluteFill, Audio, getStaticFiles, Sequence, staticFile } from "remotion";
import { loadFonts } from "./brand";
import { Atmosphere, LightTransitions } from "./components/Atmosphere";
import { Bell } from "./scenes/Bell";
import { Hook } from "./scenes/Hook";
import { LogoReveal } from "./scenes/LogoReveal";
import { Outro } from "./scenes/Outro";
import { Subscribe } from "./scenes/Subscribe";
import { Videos } from "./scenes/Videos";
import timeline from "./timeline.json";

loadFonts();

const MIX = "audio/mix.wav";

const SCENES = [
  ["hook", Hook],
  ["logo", LogoReveal],
  ["videos", Videos],
  ["subscribe", Subscribe],
  ["bell", Bell],
  ["outro", Outro],
] as const;

export const Promo: React.FC = () => {
  const hasMix = getStaticFiles().some((f) => f.name === MIX);
  return (
    <AbsoluteFill>
      <Atmosphere />
      {SCENES.map(([key, Scene]) => {
        const s = timeline.scenes[key];
        return (
          <Sequence key={key} from={s.from} durationInFrames={s.duration} name={key}>
            <Scene />
          </Sequence>
        );
      })}
      <LightTransitions />
      {/* Bande-son finale (musique + bruitages + voix off), produite par npm run audio. */}
      {hasMix ? <Audio src={staticFile(MIX)} /> : null}
    </AbsoluteFill>
  );
};
