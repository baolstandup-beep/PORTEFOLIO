import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS, FONTS } from '../config/setrans.config';
import { Clip, Label } from '../components/Base';
import { Icon } from '../components/Icons';
import { EASE, progress } from '../lib/anim';
import { useLayout } from '../lib/layout';
import type { SceneProps } from './types';

/** SCÈNE 02 — Porte-conteneurs, trajectoire maritime discrète. */
export const S02Ship: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const { W, H, V } = useLayout();
  const line = progress(f, 0.8, 4.8, EASE.inOut);
  const ui = progress(f, 0.6, 1.6, EASE.out);
  const x0 = V ? 90 : 180;
  const x1 = W - x0;
  const y = H - (V ? 300 : 150);
  const shipX = x0 + (x1 - x0) * line;
  return (
    <AbsoluteFill>
      <Clip src={ASSETS.clips.ship} zoomFrom={1.08} zoomTo={1.02} panX={-40} dim={0.08} tint={0.15} />
      <AbsoluteFill
        style={{ background: 'linear-gradient(180deg, rgba(5,11,28,0) 60%, rgba(5,11,28,0.7) 100%)' }}
      />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: ui }}>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke={COLORS.white} strokeOpacity={0.18} strokeDasharray="2 10" />
        <line x1={x0} y1={y} x2={shipX} y2={y} stroke={COLORS.blueGlow} strokeWidth={2} />
        <circle cx={shipX} cy={y} r={5} fill={COLORS.white} />
        <circle cx={shipX} cy={y} r={14} fill={COLORS.blueGlow} opacity={0.25} />
        <circle cx={x1} cy={y} r={7} fill="none" stroke={COLORS.white} strokeOpacity={0.6} />
      </svg>
      <div style={{ position: 'absolute', left: x0 - 8, top: y - 78, opacity: ui }}>
        <Icon name="ship" size={52} color={COLORS.white} draw={ui} />
      </div>
      <div style={{ position: 'absolute', right: W - x1 - 10, top: y - 76, opacity: ui }}>
        <Icon name="pin" size={44} color={COLORS.white} draw={ui} />
      </div>
      <div style={{ position: 'absolute', left: x0, top: y + 22, opacity: ui * 0.8 }}>
        <Label size={18} weight={500} color={COLORS.greyLight}>
          ATLANTIQUE · 14°41′N 17°26′W
        </Label>
      </div>
      <div
        style={{
          position: 'absolute',
          right: W - x1,
          top: y + 22,
          opacity: ui * 0.8,
          fontFamily: FONTS.body,
        }}
      >
        <Label size={18} weight={500} color={COLORS.greyLight}>
          {V ? '' : Math.round(line * 100)
            .toString()
            .padStart(2, '0')}{' '}
          {V ? '' : '%'}
        </Label>
      </div>
    </AbsoluteFill>
  );
};
