import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { C } from '../theme';
import { Fonts } from '../typography/Fonts';
import { Soundtrack } from '../audio/Soundtrack';
import { cutOf, CutName, FPS } from '../utils/timeline';
import { SceneProps } from '../scenes/types';
import { Scene01Hook } from '../scenes/Scene01_Hook';
import { Scene02Introduction } from '../scenes/Scene02_Introduction';
import { Scene03Statistics } from '../scenes/Scene03_Statistics';
import { Scene04Training } from '../scenes/Scene04_Training';
import { Scene05AI } from '../scenes/Scene05_AI';
import { Scene06Transformation } from '../scenes/Scene06_Transformation';
import { Scene07CTA } from '../scenes/Scene07_CTA';
import { Scene08Candidature } from '../scenes/Scene08_Candidature';
import { Scene09Partenaires } from '../scenes/Scene09_Partenaires';

const SCENES: Record<string, React.FC<SceneProps>> = {
  S01: Scene01Hook,
  S02: Scene02Introduction,
  S03: Scene03Statistics,
  S04: Scene04Training,
  S05: Scene05AI,
  S06: Scene06Transformation,
  S07: Scene07CTA,
  S08: Scene08Candidature,
  S09: Scene09Partenaires,
};

export type FilmProps = { cut: CutName; audio?: boolean };

/**
 * Composition principale : assemble automatiquement les scènes à partir de src/timeline.json.
 * Le même code produit le 60 s et le 30 s, en 16:9 et en 9:16.
 */
export const GraphiaFilm: React.FC<FilmProps> = ({ cut, audio = true }) => {
  const c = cutOf(cut);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <Fonts />
      {c.scenes.map((s: { id: string; from: number; to: number }) => {
        const Comp = SCENES[s.id];
        const from = Math.round(s.from * FPS);
        const len = Math.round((s.to - s.from) * FPS);
        const cues = c.cues[s.id] ?? {};
        return (
          <Sequence key={s.id} from={from} durationInFrames={len} name={`${s.id}`}>
            <Comp dur={s.to - s.from} cues={cues} />
          </Sequence>
        );
      })}
      {audio && <Soundtrack cut={cut} />}
    </AbsoluteFill>
  );
};
