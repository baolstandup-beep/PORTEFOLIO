import React from 'react';
import { AbsoluteFill } from 'remotion';
import { linearTiming, springTiming, TransitionSeries } from '@remotion/transitions';
import { wipe } from '@remotion/transitions/wipe';
import { slide } from '@remotion/transitions/slide';
import { SCENES, TRANSITION } from './config';
import { Scene1Intro } from './scenes/Scene1Intro';
import { Scene2Responsable } from './scenes/Scene2Responsable';
import { Scene3Services } from './scenes/Scene3Services';
import { Scene4Destinations } from './scenes/Scene4Destinations';
import { Scene5ServiceClient } from './scenes/Scene5ServiceClient';
import { Scene6Final } from './scenes/Scene6Final';
import { bands, zoomThrough } from './components/Transitions';
import { AudioLayer, Subtitles } from './components/AudioLayer';
import { easeInOut } from './lib/anim';

const lin = linearTiming({ durationInFrames: TRANSITION, easing: easeInOut });
const spr = springTiming({ durationInFrames: TRANSITION, config: { damping: 200 } });

/** Vignettage léger pour un rendu « cinéma ». */
const Vignette: React.FC = () => (
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(4,16,40,0.28) 100%)', pointerEvents: 'none' }} />
);

export const SetVoyageAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0A2A5E' }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES.intro} name="1 · Intro aérienne">
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomThrough()} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={SCENES.responsable} name="2 · Responsable">
          <Scene2Responsable />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={bands()} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={SCENES.services} name="3 · Services billets">
          <Scene3Services />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={zoomThrough()} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={SCENES.destinations} name="4 · Destinations">
          <Scene4Destinations />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: 'from-bottom' })} timing={spr} />

        <TransitionSeries.Sequence durationInFrames={SCENES.serviceClient} name="5 · Service client">
          <Scene5ServiceClient />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: 'from-bottom-right' })} timing={lin} />

        <TransitionSeries.Sequence durationInFrames={SCENES.final} name="6 · Écran final">
          <Scene6Final />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      <Vignette />
      <Subtitles />
      <AudioLayer />
    </AbsoluteFill>
  );
};
