// Scène 4 — L'affirmation de la marque (16–23 s) : le logo de l'étiquette au centre, puis la caméra
// recule et le nom PAS-PAS se compose en tête d'écran ; l'accroche (optionnelle) suit.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {shotAt} from '../camera';
import {Droplets} from '../components/Droplets';
import {Stage} from '../components/Stage';
import {FONT_SERIF, Line, Wordmark} from '../components/Typography';
import {config, cues, scenes} from '../config';
import {DROPLETS_START} from './Hero';

export const TAGLINE_STYLE: React.CSSProperties = {fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 52, letterSpacing: '0.01em'};

export const BrandReveal: React.FC = () => {
  const frame = scenes.brand.from + useCurrentFrame();
  return (
    <Stage
      shot={shotAt(frame)}
      frame={frame}
      onProduct={<Droplets frame={frame} start={DROPLETS_START} intensity={0.9} />}
      overlay={
        <>
          <Wordmark frame={frame} at={cues.titleIn} />
          {config.text.showTagline ? (
          <Line frame={frame} at={cues.taglineIn} out={cues.taglineOut} y={938} style={TAGLINE_STYLE}>
            {config.text.tagline}
          </Line>
          ) : null}
        </>
      }
    />
  );
};
