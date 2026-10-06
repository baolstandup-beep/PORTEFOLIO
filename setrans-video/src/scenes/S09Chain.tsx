import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, TEXTS } from '../config/setrans.config';
import { Grid, Label, LightBackground } from '../components/Base';
import { Icon, IconName } from '../components/Icons';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

const ICONS: IconName[] = ['ship', 'port', 'customs', 'container', 'truck', 'client'];

/** SCÈNE 09 — La chaîne logistique complète, étape par étape. */
export const S09Chain: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const n = TEXTS.chain.length;
  const x0 = 230;
  const step = (1920 - 2 * x0) / (n - 1);
  const y = 520;
  const flow = progress(f, 0.5, 4.8, EASE.inOut);
  const pan = progress(f, 0, duration, EASE.soft);
  const R = 62;
  return (
    <LightBackground>
      <Grid color={COLORS.blue} opacity={0.04} />
      <AbsoluteFill style={{ transform: `translateX(${30 - 60 * pan}px)` }}>
        <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
          <line x1={x0} y1={y} x2={1920 - x0} y2={y} stroke={COLORS.greyDark} strokeOpacity={0.15} strokeWidth={2} />
          <line x1={x0} y1={y} x2={x0 + (1920 - 2 * x0) * flow} y2={y} stroke={COLORS.blue} strokeWidth={3} />
          <circle cx={x0 + (1920 - 2 * x0) * flow} cy={y} r={7} fill={COLORS.blue} opacity={flow < 1 ? 1 : 0} />
        </svg>
        {TEXTS.chain.map((label, i) => {
          const at = i / (n - 1);
          const on = progress(f, 0.5 + at * 4.3 - 0.15, 0.5 + at * 4.3 + 0.35, EASE.out);
          const cx = x0 + i * step;
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: cx - 140,
                top: y - R,
                width: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: R * 2,
                  height: R * 2,
                  borderRadius: R,
                  backgroundColor: on > 0.5 ? COLORS.blue : COLORS.white,
                  border: `2px solid ${on > 0.05 ? COLORS.blue : 'rgba(74,86,112,0.25)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${1 + 0.08 * Math.sin(Math.PI * on)})`,
                  boxShadow: on > 0.5 ? '0 14px 40px rgba(28,63,136,0.28)' : '0 6px 18px rgba(11,26,58,0.06)',
                }}
              >
                <Icon name={ICONS[i]} size={60} color={on > 0.5 ? COLORS.white : COLORS.greyDark} strokeWidth={1.6} />
              </div>
              <Label
                size={24}
                weight={700}
                color={on > 0.3 ? COLORS.blue : COLORS.grey}
                spacing="0.2em"
                style={{ marginTop: 28 }}
              >
                {label}
              </Label>
              <div
                style={{
                  marginTop: 10,
                  width: 30 * on,
                  height: 2,
                  backgroundColor: COLORS.blue,
                }}
              />
            </div>
          );
        })}
      </AbsoluteFill>
    </LightBackground>
  );
};
