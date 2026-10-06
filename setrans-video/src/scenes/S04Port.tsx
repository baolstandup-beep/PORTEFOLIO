import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS } from '../config/setrans.config';
import { Clip } from '../components/Base';
import { EASE, progress, sec } from '../lib/anim';
import { useLayout } from '../lib/layout';
import type { SceneProps } from './types';

/** Lignes de flux très lentes (activité portuaire). */
const FlowLines: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H } = useLayout();
  const rows = [0.72, 0.76, 0.8, 0.84].map((r) => r * H);
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
      {rows.map((y, i) => {
        const speed = 2 + i * 0.7;
        const x = ((f * speed + i * 420) % (W + 480)) - 400;
        return (
          <g key={i}>
            <line x1={0} y1={y} x2={W} y2={y} stroke={COLORS.white} strokeOpacity={0.06} />
            <line x1={x} y1={y} x2={x + 260} y2={y} stroke={COLORS.blueGlow} strokeWidth={1.5} strokeOpacity={0.7} />
          </g>
        );
      })}
    </svg>
  );
};

/** SCÈNE 04 — Terminal portuaire actif, puis le commerçant derrière la marchandise. */
export const S04Port: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const cut = 3.2;
  const xf = progress(f, cut, cut + 0.6, EASE.soft);
  return (
    <AbsoluteFill>
      <Clip src={ASSETS.clips.port} zoomFrom={1.0} zoomTo={1.1} dim={0.1} />
      <AbsoluteFill style={{ opacity: 1 - xf }}>
        <FlowLines />
      </AbsoluteFill>
      <Sequence from={sec(cut)} durationInFrames={sec(duration - cut)}>
        <AbsoluteFill style={{ opacity: xf }}>
          <Clip src={ASSETS.clips.merchant} zoomFrom={1.03} zoomTo={1.09} dim={0.08} tint={0.1} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
