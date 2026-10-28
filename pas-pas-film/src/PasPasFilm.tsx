// Composition principale : cinq scènes indépendantes sur une même timeline, bande sonore synchronisée.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile} from 'remotion';
import {config, scenes} from './config';
import {FONT_FACES} from './fonts';
import {BrandReveal} from './scenes/BrandReveal';
import {EndCard} from './scenes/EndCard';
import {Hero} from './scenes/Hero';
import {Opening} from './scenes/Opening';
import {Reveal} from './scenes/Reveal';

// Les polices et les images utilisées comme masques CSS ne sont pas suivies par Remotion :
// on bloque le rendu jusqu'à ce qu'elles soient chargées et décodées.
const useAssetsReady = () => {
  const [handle] = useState(() => delayRender('Polices et masques'));
  useEffect(() => {
    const images = [config.assets.bottle, config.assets.bottleSilhouette, config.assets.bottleRim].map((src) => {
      const img = new Image();
      img.src = staticFile(src);
      return img.decode();
    });
    Promise.all([...FONT_FACES.map((f) => document.fonts.load(f)), ...images])
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
};

export const PasPasFilm: React.FC = () => {
  useAssetsReady();
  return (
    <AbsoluteFill style={{backgroundColor: config.colors.background}}>
      <Sequence name="1 · Mystère" from={scenes.opening.from} durationInFrames={scenes.opening.duration}>
        <Opening />
      </Sequence>
      <Sequence name="2 · Révélation" from={scenes.reveal.from} durationInFrames={scenes.reveal.duration}>
        <Reveal />
      </Sequence>
      <Sequence name="3 · Mise en valeur" from={scenes.hero.from} durationInFrames={scenes.hero.duration}>
        <Hero />
      </Sequence>
      <Sequence name="4 · Marque" from={scenes.brand.from} durationInFrames={scenes.brand.duration}>
        <BrandReveal />
      </Sequence>
      <Sequence name="5 · Tableau final" from={scenes.endCard.from} durationInFrames={scenes.endCard.duration}>
        <EndCard />
      </Sequence>
      {config.audio.mode === 'score' ? <Audio src={staticFile(config.assets.score)} volume={config.audio.volume} /> : null}
    </AbsoluteFill>
  );
};
