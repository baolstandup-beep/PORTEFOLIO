import React from 'react';
import { CalculateMetadataFunction, Composition } from 'remotion';
import { HookReel, HookReelProps, hookReelSchema } from './HookReel';

const FPS = 30;

/** La durée de chaque composition suit celle de son clip source. */
const fromSource: CalculateMetadataFunction<HookReelProps> = ({ props }) => ({
  durationInFrames: Math.ceil(props.durationInSeconds * FPS),
});

const sadio: HookReelProps = {
  videoSrc: 'sadio.mp4',
  audioSrc: 'sadio-audio.wav',
  durationInSeconds: 64.83,
  // Pics d'énergie de la voix (fenêtres de 0,5 s)
  punches: [
    { at: 5.0, scale: 1.08 },
    { at: 13.0, scale: 1.12 },
    { at: 22.5, scale: 1.08 },
    { at: 31.0, scale: 1.16 },
    { at: 39.5, scale: 1.1 },
    { at: 55.0, scale: 1.16 },
  ],
  kicker: 'Bassirou SÈNE évoque',
  hookLines: ["L'état des", 'routes de Sadio'],
  highlight: ['routes', 'Sadio'],
  titleSize: 104,
  badge: 'En direct · IYAT TV',
  teaser: 'Regardez jusqu’au bout 👀',
  cta: 'Suivez PAS-PAS',
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="HookReel"
      component={HookReel}
      durationInFrames={Math.ceil(hookReelSchema.durationInSeconds * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={hookReelSchema}
      calculateMetadata={fromSource}
    />
    <Composition
      id="SadioRoutes"
      component={HookReel}
      durationInFrames={Math.ceil(sadio.durationInSeconds * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={sadio}
      calculateMetadata={fromSource}
    />
  </>
);
