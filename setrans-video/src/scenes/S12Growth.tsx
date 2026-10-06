import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS, TEXTS } from '../config/setrans.config';
import { Clip, Label } from '../components/Base';
import { Icon, IconName } from '../components/Icons';
import { EASE, progress, sec } from '../lib/anim';
import { useLayout } from '../lib/layout';
import type { SceneProps } from './types';

const ICONS: IconName[] = ['store', 'building', 'warehouse', 'boxes', 'chart'];

/** Pictogrammes posés sur une courbe de progression très subtile. */
const GrowthOverlay: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, V } = useLayout();
  const pts: [number, number][] = V
    ? [0, 1, 2, 3, 4].map((i) => [130 + i * ((W - 260) / 4), H - 300 - i * 110 - (i === 4 ? 60 : 0)])
    : [
        [260, 870],
        [600, 820],
        [940, 760],
        [1280, 680],
        [1640, 560],
      ];
  const curve = progress(f, 0.2, 2.6, EASE.inOut);
  const xL = pts[0][0];
  const xR = pts[pts.length - 1][0];
  const d = `M ${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(([x, y]) => `L ${x} ${y}`).join(' ');
  const area = `${d} L ${pts[pts.length - 1][0]} ${H} L ${pts[0][0]} ${H} Z`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(5,11,28,0) 35%, rgba(5,11,28,0.82) 100%)' }} />
      <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={COLORS.blueGlow} stopOpacity={0.22} />
            <stop offset="1" stopColor={COLORS.blueGlow} stopOpacity={0} />
          </linearGradient>
          <clipPath id="growthClip">
            <rect x={0} y={0} width={xL + (xR - xL) * curve} height={H} />
          </clipPath>
        </defs>
        <path d={area} fill="url(#growthArea)" clipPath="url(#growthClip)" />
        <path d={d} fill="none" stroke={COLORS.blueGlow} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - curve} />
      </svg>
      {pts.map(([x, y], i) => {
        const t = progress(f, 0.4 + i * 0.45, 1.0 + i * 0.45, EASE.out);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - (V ? 80 : 90),
              top: y - 150,
              width: V ? 160 : 180,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: t,
              transform: `translateY(${(1 - t) * 16}px)`,
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                background: 'rgba(28,63,136,0.75)',
                border: `1.5px solid ${COLORS.blueGlow}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={ICONS[i]} size={46} color={COLORS.white} draw={t} />
            </div>
            <Label size={V ? 15 : 17} weight={600} spacing={V ? '0.06em' : '0.16em'} style={{ marginTop: 10 }}>
              {TEXTS.activities[i].toUpperCase()}
            </Label>
            <div style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.white, marginTop: 14 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** SCÈNE 12 — Mission & croissance : la logistique soutient les activités. */
export const S12Growth: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const cut = 2.8;
  const xf = progress(f, cut, cut + 0.6, EASE.soft);
  return (
    <AbsoluteFill>
      <Clip src={ASSETS.clips.handshake} zoomFrom={1.02} zoomTo={1.08} dim={0.06} tint={0.08} />
      <Sequence from={sec(cut)} durationInFrames={sec(duration - cut)}>
        <AbsoluteFill style={{ opacity: xf }}>
          <Clip src={ASSETS.clips.delivery} zoomFrom={1.03} zoomTo={1.09} dim={0.12} tint={0.08} />
          <GrowthOverlay />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
