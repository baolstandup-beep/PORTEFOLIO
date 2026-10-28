// Scène 3 — La mise en valeur (9–16 s) : travelling latéral, reflets qui tournent autour du produit,
// gouttelettes de condensation hors étiquette, puis retour face caméra en gros plan.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {shotAt} from '../camera';
import {Droplets} from '../components/Droplets';
import {Glint} from '../components/LightEffects';
import {Stage} from '../components/Stage';
import {scenes} from '../config';
import {BOTTLE} from '../layout';

export const DROPLETS_START = scenes.hero.from + 12;

export const Hero: React.FC = () => {
  const frame = scenes.hero.from + useCurrentFrame();
  return (
    <Stage
      shot={shotAt(frame)}
      frame={frame}
      onProduct={<Droplets frame={frame} start={DROPLETS_START} intensity={0.9} />}
      inWorld={<Glint frame={frame} at={300} x={BOTTLE.cx + BOTTLE.width * 0.44} y={BOTTLE.baseY - BOTTLE.height * 0.66} size={90} />}
    />
  );
};
