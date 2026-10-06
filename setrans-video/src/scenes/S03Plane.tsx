import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ASSETS, PLACES } from '../config/setrans.config';
import { Clip } from '../components/Base';
import { FlatWorld } from '../components/Maps';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

/** SCÈNE 03 — Avion cargo, trajectoire internationale sur fond de carte. */
export const S03Plane: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const map = progress(f, 0.3, 1.5, EASE.soft);
  const arc = (from: keyof typeof PLACES, start: number) => ({
    from: PLACES[from],
    to: PLACES.dakar,
    t: progress(f, start, start + 3, EASE.inOut),
    width: 2,
  });
  return (
    <AbsoluteFill>
      <Clip src={ASSETS.clips.plane} zoomFrom={1.02} zoomTo={1.08} dim={0.12} />
      <AbsoluteFill style={{ mixBlendMode: 'screen', opacity: 0.32 * map }}>
        <FlatWorld
          center={[-10, 25]}
          zoom={1.5}
          arcs={[arc('shanghai', 0.6), arc('paris', 1.0), arc('dubai', 1.4), arc('newYork', 1.8)]}
          dots={[{ at: PLACES.dakar, r: 5 }]}
          landColor="rgba(127,162,232,0.12)"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
