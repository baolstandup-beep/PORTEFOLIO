import React from 'react';
import { Composition } from 'remotion';
import { HookReel, hookReelSchema } from './HookReel';

const FPS = 30;
// Durée de la vidéo source : 24,82 s
const DURATION = Math.ceil(24.82 * FPS);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HookReel"
    component={HookReel}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={hookReelSchema}
  />
);
