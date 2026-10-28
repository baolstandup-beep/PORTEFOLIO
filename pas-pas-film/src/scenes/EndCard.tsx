// Scène 5 — Le tableau final (23–30 s) : produit au centre sur son socle, nom de marque, mention
// « Conférence de presse ». Caméra, produit et textes sont immobiles à partir de 25,8 s (image 644)
// jusqu’à la fin, soit plus de 4 s pour la lecture et les photos ; seules les particules restent vivantes.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {shotAt} from '../camera';
import {Droplets} from '../components/Droplets';
import {Glint} from '../components/LightEffects';
import {Stage} from '../components/Stage';
import {FONT_SANS, FONT_SERIF, Line, Rule, Wordmark} from '../components/Typography';
import {config, cues, scenes} from '../config';
import {BOTTLE} from '../layout';
import {TAGLINE_STYLE} from './BrandReveal';
import {DROPLETS_START} from './Hero';

export const EndCard: React.FC = () => {
  const frame = scenes.endCard.from + useCurrentFrame();
  const t = config.text;
  const event = [t.eventDate, t.eventPlace].filter(Boolean).join('  ·  ');
  return (
    <Stage
      shot={shotAt(frame)}
      frame={frame}
      onProduct={<Droplets frame={frame} start={DROPLETS_START} intensity={0.8} />}
      inWorld={<Glint frame={frame} at={cues.finale + 4} x={BOTTLE.cx - BOTTLE.width * 0.2} y={BOTTLE.baseY - BOTTLE.height + 8} size={130} />}
      overlay={
        <>
          <Wordmark frame={frame} at={cues.titleIn} />
          {/* L'accroche de la scène 4 finit de s'effacer ici, avant la mention « Conférence de presse ». */}
          {t.showTagline ? (
            <Line frame={frame} at={cues.taglineIn} out={cues.taglineOut} y={938} style={TAGLINE_STYLE}>
              {t.tagline}
            </Line>
          ) : null}
          <Line frame={frame} at={cues.pressLineIn} y={888} style={{fontFamily: FONT_SANS, fontWeight: 600, fontSize: 40, letterSpacing: '0.34em', paddingLeft: '0.34em', boxSizing: 'border-box'}}>
            {t.pressLine}
          </Line>
          <Rule frame={frame} at={cues.pressLineIn + 8} y={948} />
          {t.showEndLine ? (
            <Line frame={frame} at={cues.endLineIn} y={958} style={{fontFamily: FONT_SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 42, color: config.colors.textMuted}}>
              {t.endLine}
            </Line>
          ) : null}
          {event ? (
            <Line frame={frame} at={cues.endLineIn + 6} y={60} style={{fontFamily: FONT_SANS, fontWeight: 300, fontSize: 30, letterSpacing: '0.2em', color: config.colors.textMuted}}>
              {event}
            </Line>
          ) : null}
        </>
      }
    />
  );
};
