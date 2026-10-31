import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import type { TransitionPresentation, TransitionPresentationComponentProps } from '@remotion/transitions';
import { clamp } from '../lib/anim';
import { COULEURS } from '../theme';

type Empty = Record<string, never>;

/**
 * « Traversée » : la scène sortante s'envole vers la caméra en se floutant,
 * la scène entrante arrive de l'arrière-plan. Effet de vitesse cinématographique.
 */
const ZoomThrough: React.FC<TransitionPresentationComponentProps<Empty>> = ({ children, presentationDirection, presentationProgress: p }) => {
  const entering = presentationDirection === 'entering';
  const scale = entering ? interpolate(p, [0, 1], [0.82, 1]) : interpolate(p, [0, 1], [1, 1.7]);
  const blur = entering ? interpolate(p, [0, 1], [14, 0]) : interpolate(p, [0, 1], [0, 18]);
  const opacity = entering ? interpolate(p, [0, 0.5], [0, 1], clamp) : interpolate(p, [0.4, 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity }}>{children}</AbsoluteFill>
  );
};

export const zoomThrough = (): TransitionPresentation<Empty> => ({ component: ZoomThrough, props: {} as Empty });

/**
 * « Bandes » : trois bandes diagonales aux couleurs de la marque balayent l'écran
 * et révèlent la scène suivante.
 */
const Bands: React.FC<TransitionPresentationComponentProps<Empty>> = ({ children, presentationDirection, presentationProgress: p }) => {
  if (presentationDirection === 'exiting') {
    return <AbsoluteFill style={{ transform: `translateX(${interpolate(p, [0, 1], [0, -220])}px)` }}>{children}</AbsoluteFill>;
  }
  const colors = [COULEURS.jaune, COULEURS.rouge, COULEURS.bleu];
  const reveal = interpolate(p, [0.45, 1], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `polygon(${120 - reveal * 160}% 0, 140% 0, 140% 100%, ${100 - reveal * 160}% 100%)` }}>{children}</AbsoluteFill>
      {colors.map((c, i) => {
        const local = interpolate(p, [i * 0.12, 0.55 + i * 0.12], [0, 1], clamp);
        const x = interpolate(local, [0, 1], [130, -170]);
        return (
          <AbsoluteFill
            key={i}
            style={{
              background: c,
              clipPath: `polygon(${x}% 0, ${x + 30}% 0, ${x + 10}% 100%, ${x - 20}% 100%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const bands = (): TransitionPresentation<Empty> => ({ component: Bands, props: {} as Empty });
