import React from 'react';
import { Composition } from 'remotion';
import { VIDEO } from './config/setrans.config';
import { SetransFilm } from './SetransFilm';

export const RemotionRoot: React.FC = () => (
  <>
    {/* Grand écran 16:9 */}
    <Composition
      id="SetransFilm"
      component={SetransFilm}
      durationInFrames={Math.round(VIDEO.durationInSeconds * VIDEO.fps)}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    {/* Téléphone 9:16 — mêmes scènes, mise en page verticale */}
    <Composition
      id="SetransFilmVertical"
      component={SetransFilm}
      durationInFrames={Math.round(VIDEO.durationInSeconds * VIDEO.fps)}
      fps={VIDEO.fps}
      width={VIDEO.verticalWidth}
      height={VIDEO.verticalHeight}
    />
  </>
);
