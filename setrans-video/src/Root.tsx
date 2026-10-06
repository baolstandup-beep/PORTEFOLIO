import React from 'react';
import { Composition } from 'remotion';
import { VIDEO } from './config/setrans.config';
import { SetransFilm } from './SetransFilm';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SetransFilm"
    component={SetransFilm}
    durationInFrames={Math.round(VIDEO.durationInSeconds * VIDEO.fps)}
    fps={VIDEO.fps}
    width={VIDEO.width}
    height={VIDEO.height}
  />
);
