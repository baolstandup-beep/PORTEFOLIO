// Scène 2 — La révélation (4–9 s) : le balayage lumineux dessine la bouteille, le socle apparaît,
// la lumière principale monte et l'étiquette se lit ; éclat sur le bouchon à la fin du balayage.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {shotAt} from '../camera';
import {Glint} from '../components/LightEffects';
import {Stage} from '../components/Stage';
import {scenes} from '../config';
import {BOTTLE} from '../layout';

export const Reveal: React.FC = () => {
  const frame = scenes.reveal.from + useCurrentFrame();
  return (
    <Stage
      shot={shotAt(frame)}
      frame={frame}
      inWorld={<Glint frame={frame} at={192} x={BOTTLE.cx + BOTTLE.width * 0.18} y={BOTTLE.baseY - BOTTLE.height + 6} size={110} />}
    />
  );
};
