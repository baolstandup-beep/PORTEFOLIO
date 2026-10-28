// Scène 1 — Le mystère (0–4 s) : sortie du noir, faisceau, particules, silhouette qui se dessine.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {shotAt} from '../camera';
import {Stage} from '../components/Stage';
import {scenes} from '../config';

export const Opening: React.FC = () => {
  const frame = scenes.opening.from + useCurrentFrame();
  return <Stage shot={shotAt(frame)} frame={frame} />;
};
