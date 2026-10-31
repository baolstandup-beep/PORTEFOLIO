import React from 'react';
import { Composition } from 'remotion';
import { DUREE_TOTALE, FPS, HEIGHT, WIDTH } from './config';
import { SetVoyageAd } from './SetVoyageAd';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SetVoyagePub"
    component={SetVoyageAd}
    durationInFrames={DUREE_TOTALE}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
