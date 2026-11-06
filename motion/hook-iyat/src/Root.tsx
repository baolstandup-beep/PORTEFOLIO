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

const siege: HookReelProps = {
  videoSrc: 'siege.mp4',
  audioSrc: 'siege-audio.wav',
  durationInSeconds: 134.3,
  // Pics d'énergie de la voix (fenêtres de 0,5 s, espacés de 12 s minimum)
  punches: [
    { at: 20.0, scale: 1.1 },
    { at: 38.5, scale: 1.12 },
    { at: 50.5, scale: 1.1 },
    { at: 66.5, scale: 1.14 },
    { at: 88.5, scale: 1.12 },
    { at: 109.0, scale: 1.14 },
    { at: 123.0, scale: 1.12 },
  ],
  kicker: 'Qui paie le siège ?',
  hookLines: ['Le financement', 'du siège', 'de PAS-PAS'],
  highlight: ['financement', 'PAS-PAS'],
  titleSize: 104,
  badge: 'En direct · IYAT TV',
  teaser: 'La réponse en vidéo 👀',
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
    <Composition
      id="SiegeFinancement"
      component={HookReel}
      durationInFrames={Math.ceil(siege.durationInSeconds * FPS)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={siege}
      calculateMetadata={fromSource}
    />
  </>
);
