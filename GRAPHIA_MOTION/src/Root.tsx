import React from 'react';
import { Composition } from 'remotion';
import { GraphiaFilm } from './compositions/GraphiaFilm';
import { cutOf, FPS } from './utils/timeline';
import { SceneProps } from './scenes/types';
import { Scene01Hook } from './scenes/Scene01_Hook';
import { Scene02Introduction } from './scenes/Scene02_Introduction';
import { Scene03Statistics } from './scenes/Scene03_Statistics';
import { Scene04Training } from './scenes/Scene04_Training';
import { Scene05AI } from './scenes/Scene05_AI';
import { Scene06Transformation } from './scenes/Scene06_Transformation';
import { Scene07CTA } from './scenes/Scene07_CTA';
import { Fonts } from './typography/Fonts';

const FORMATS = [
  { id: 'H', width: 1920, height: 1080 },
  { id: 'V', width: 1080, height: 1920 },
] as const;

const SCENE_COMPS: [string, React.FC<SceneProps>][] = [
  ['S01', Scene01Hook], ['S02', Scene02Introduction], ['S03', Scene03Statistics], ['S04', Scene04Training],
  ['S05', Scene05AI], ['S06', Scene06Transformation], ['S07', Scene07CTA],
];

/** Une scène seule (prévisualisation / correction indépendante), avec les repères du 60 s. */
const SceneSolo: React.FC<{ id: string }> = ({ id }) => {
  const comp = SCENE_COMPS.find(([k]) => k === id)![1];
  const s = cutOf('long').scenes.find((x) => x.id === id)!;
  const cues = (cutOf('long').cues as Record<string, Record<string, unknown>>)[id];
  const Comp = comp;
  return (
    <>
      <Fonts />
      <Comp dur={s.to - s.from} cues={cues} />
    </>
  );
};

export const Root: React.FC = () => (
  <>
    {FORMATS.map((f) => (
      <React.Fragment key={f.id}>
        <Composition id={`GRAPHIA-60-${f.id}`} component={GraphiaFilm} durationInFrames={cutOf('long').duration * FPS} fps={FPS} width={f.width} height={f.height} defaultProps={{ cut: 'long' as const }} />
        <Composition id={`GRAPHIA-30-${f.id}`} component={GraphiaFilm} durationInFrames={cutOf('short').duration * FPS} fps={FPS} width={f.width} height={f.height} defaultProps={{ cut: 'short' as const }} />
        {SCENE_COMPS.map(([id]) => {
          const s = cutOf('long').scenes.find((x) => x.id === id)!;
          return <Composition key={id} id={`${id}-${f.id}`} component={SceneSolo} durationInFrames={Math.round((s.to - s.from) * FPS)} fps={FPS} width={f.width} height={f.height} defaultProps={{ id }} />;
        })}
      </React.Fragment>
    ))}
  </>
);
