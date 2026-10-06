import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS, FONTS, TEXTS, TYPE } from '../config/setrans.config';
import { Clip, Label, MaskReveal } from '../components/Base';
import { Icon, IconName } from '../components/Icons';
import { EASE, lerp, progress } from '../lib/anim';
import type { SceneProps } from './types';

const POLE_ICONS: IconName[] = ['customs', 'truck', 'warehouse'];
const POLE_POS: [number, number][] = [
  [420, 300],
  [1500, 300],
  [960, 880],
];

/** SCÈNE 08 — Apparition de SETRANS et de ses trois pôles. */
export const S08Brand: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const veil = progress(f, 0.3, 2.0, EASE.soft);
  const name = progress(f, 0.9, 2.0, EASE.out);
  const ring = progress(f, 1.2, 2.6, EASE.inOut);
  return (
    <AbsoluteFill>
      <Clip src={ASSETS.clips.agent} zoomFrom={1.0} zoomTo={1.14} dim={lerp(0.1, 0.72, veil)} blur={veil * 6} tint={0.25} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <circle
          cx={960}
          cy={540}
          r={250}
          fill="none"
          stroke={COLORS.blueGlow}
          strokeOpacity={0.5}
          strokeWidth={1.2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ring}
          transform="rotate(-90 960 540)"
        />
        {POLE_POS.map(([px, py], i) => {
          const l = progress(f, 2.2 + i * 0.7, 3.0 + i * 0.7, EASE.inOut);
          // Point d'arrivée sur le cercle central
          const ang = Math.atan2(py - 540, px - 960);
          const ex = 960 + Math.cos(ang) * 250;
          const ey = 540 + Math.sin(ang) * 250;
          const sx = px - Math.cos(ang) * 60;
          const sy = py - Math.sin(ang) * 60;
          return (
            <g key={i}>
              <line x1={sx} y1={sy} x2={sx + (ex - sx) * l} y2={sy + (ey - sy) * l} stroke={COLORS.blueGlow} strokeWidth={1.5} />
              {l > 0.98 && <circle cx={ex} cy={ey} r={5} fill={COLORS.white} />}
            </g>
          );
        })}
      </svg>
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <MaskReveal t={name}>
          <div
            style={{
              fontFamily: FONTS.title,
              fontWeight: 800,
              fontSize: TYPE.hero,
              letterSpacing: '0.16em',
              color: COLORS.white,
              paddingLeft: '0.16em',
            }}
          >
            {TEXTS.brand}
          </div>
        </MaskReveal>
      </AbsoluteFill>
      {POLE_POS.map(([px, py], i) => {
        const t = progress(f, 1.8 + i * 0.7, 2.6 + i * 0.7, EASE.out);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - 200,
              top: py - 60,
              width: 400,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: t,
              transform: `translateY(${(1 - t) * 18}px)`,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                border: `1.5px solid ${COLORS.blueGlow}`,
                background: 'rgba(28,63,136,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                top: 0,
              }}
            >
              <Icon name={POLE_ICONS[i]} size={60} color={COLORS.white} draw={t} />
            </div>
            <Label size={30} weight={700} style={{ marginTop: 18 }}>
              {TEXTS.poles[i]}
            </Label>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
