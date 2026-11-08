import React from 'react';
import { Composition } from 'remotion';
import { GraphiaFilm } from './compositions/GraphiaFilm';
import { cutOf, CutName, FPS } from './utils/timeline';
import { SceneProps } from './scenes/types';
import { Scene01Hook } from './scenes/Scene01_Hook';
import { Scene02Introduction } from './scenes/Scene02_Introduction';
import { Scene03Statistics } from './scenes/Scene03_Statistics';
import { Scene04Training } from './scenes/Scene04_Training';
import { Scene05AI } from './scenes/Scene05_AI';
import { Scene06Transformation } from './scenes/Scene06_Transformation';
import { Scene07CTA } from './scenes/Scene07_CTA';
import { Scene08Candidature } from './scenes/Scene08_Candidature';
import { Scene09Partenaires } from './scenes/Scene09_Partenaires';
import { Fonts } from './typography/Fonts';

const FORMATS = [
  { id: 'H', width: 1920, height: 1080 },
  { id: 'V', width: 1080, height: 1920 },
] as const;

/** Films : identifiant de composition → montage de src/timeline.json */
const FILMS: [string, CutName][] = [
  ['GRAPHIA-60', 'long'],
  ['GRAPHIA-30', 'short'],
  ['GRAPHIA-LONG', 'full'],
  ['GRAPHIA-CANDIDATER', 'candidater'],
  ['GRAPHIA-PARTENAIRES', 'partenaires'],
];

const SCENE_COMPS: [string, React.FC<SceneProps>][] = [
  ['S01', Scene01Hook], ['S02', Scene02Introduction], ['S03', Scene03Statistics], ['S04', Scene04Training],
  ['S05', Scene05AI], ['S06', Scene06Transformation], ['S07', Scene07CTA], ['S08', Scene08Candidature], ['S09', Scene09Partenaires],
];

/** Une scène seule (prévisualisation / correction indépendante), avec les repères de la version longue. */
const sceneOf = (id: string) => {
  const c = cutOf('full');
  const s = c.scenes.find((x) => x.id === id)!;
  return { dur: s.to - s.from, cues: c.cues[id] };
};
const SceneSolo: React.FC<{ id: string }> = ({ id }) => {
  const Comp = SCENE_COMPS.find(([k]) => k === id)![1];
  const { dur, cues } = sceneOf(id);
  return (
    <>
      <Fonts />
      <Comp dur={dur} cues={cues} />
    </>
  );
};

export const Root: React.FC = () => (
  <>
    {FORMATS.map((f) => (
      <React.Fragment key={f.id}>
        {FILMS.map(([name, cut]) => (
          <Composition key={name} id={`${name}-${f.id}`} component={GraphiaFilm} durationInFrames={Math.round(cutOf(cut).duration * FPS)} fps={FPS} width={f.width} height={f.height} defaultProps={{ cut }} />
        ))}
        {SCENE_COMPS.map(([id]) => (
          <Composition key={id} id={`${id}-${f.id}`} component={SceneSolo} durationInFrames={Math.round(sceneOf(id).dur * FPS)} fps={FPS} width={f.width} height={f.height} defaultProps={{ id }} />
        ))}
      </React.Fragment>
    ))}
  </>
);
