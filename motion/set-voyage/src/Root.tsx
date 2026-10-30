import React from 'react';
import {Composition} from 'remotion';
import {SetVoyageComposition} from './Composition';
import {DURATION, FPS} from './layout';

const FORMATS = [
  {id: 'SetVoyage-16x9', width: 1920, height: 1080},
  {id: 'SetVoyage-9x16', width: 1080, height: 1920},
];

export const RemotionRoot: React.FC = () => (
  <>
    {FORMATS.flatMap(({id, width, height}) =>
      [false, true].map((transparent) => (
        <Composition
          key={`${id}-${transparent}`}
          id={transparent ? `${id}-Alpha` : id}
          component={SetVoyageComposition}
          durationInFrames={DURATION}
          fps={FPS}
          width={width}
          height={height}
          defaultProps={{transparent}}
        />
      )),
    )}
  </>
);
