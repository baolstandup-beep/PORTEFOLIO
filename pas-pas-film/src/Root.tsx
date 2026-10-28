import React from 'react';
import {Composition} from 'remotion';
import {config} from './config';
import './fonts';
import {PasPasFilm} from './PasPasFilm';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PasPasFilm"
      component={PasPasFilm}
      durationInFrames={config.durationInFrames}
      fps={config.fps}
      width={config.resolution.width}
      height={config.resolution.height}
    />
    <Composition
      id="PasPasFilm4K"
      component={PasPasFilm}
      durationInFrames={config.durationInFrames}
      fps={config.fps}
      width={config.resolution4k.width}
      height={config.resolution4k.height}
    />
  </>
);
