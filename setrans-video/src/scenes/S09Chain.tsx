import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, TEXTS } from '../config/setrans.config';
import { Grid, Label, LightBackground } from '../components/Base';
import { Icon, IconName } from '../components/Icons';
import { EASE, progress } from '../lib/anim';
import { useLayout } from '../lib/layout';
import type { SceneProps } from './types';

const ICONS: IconName[] = ['ship', 'port', 'customs', 'container', 'truck', 'client'];

/**
 * SCÈNE 09 — La chaîne logistique complète, étape par étape.
 * 16:9 : chaîne horizontale. 9:16 : chaîne verticale, libellés à droite.
 */
export const S09Chain: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const { W, H, V } = useLayout();
  const n = TEXTS.chain.length;
  const flow = progress(f, 0.5, 4.8, EASE.inOut);
  const pan = progress(f, 0, duration, EASE.soft);
  const R = 62;
  // Axe de la chaîne : de (ax0, ay0) à (ax1, ay1)
  const ax0 = V ? 300 : 230;
  const ay0 = V ? 300 : 520;
  const ax1 = V ? 300 : W - 230;
  const ay1 = V ? H - 300 : 520;
  const px = (t: number) => ax0 + (ax1 - ax0) * t;
  const py = (t: number) => ay0 + (ay1 - ay0) * t;
  const drift = V ? `translateY(${30 - 60 * pan}px)` : `translateX(${30 - 60 * pan}px)`;
  return (
    <LightBackground>
      <Grid color={COLORS.blue} opacity={0.04} />
      <AbsoluteFill style={{ transform: drift }}>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <line x1={ax0} y1={ay0} x2={ax1} y2={ay1} stroke={COLORS.greyDark} strokeOpacity={0.15} strokeWidth={2} />
          <line x1={ax0} y1={ay0} x2={px(flow)} y2={py(flow)} stroke={COLORS.blue} strokeWidth={3} />
          <circle cx={px(flow)} cy={py(flow)} r={7} fill={COLORS.blue} opacity={flow < 1 ? 1 : 0} />
        </svg>
        {TEXTS.chain.map((label, i) => {
          const at = i / (n - 1);
          const on = progress(f, 0.5 + at * 4.3 - 0.15, 0.5 + at * 4.3 + 0.35, EASE.out);
          const cx = px(at);
          const cy = py(at);
          const circle = (
            <div
              style={{
                width: R * 2,
                height: R * 2,
                flex: 'none',
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
          );
          const label_ = (
            <Label
              size={V ? 30 : 24}
              weight={700}
              color={on > 0.3 ? COLORS.blue : COLORS.grey}
              spacing="0.2em"
              style={V ? { marginLeft: 44 } : { marginTop: 28 }}
            >
              {label}
            </Label>
          );
          return V ? (
            <div
              key={label}
              style={{ position: 'absolute', left: cx - R, top: cy - R, display: 'flex', alignItems: 'center' }}
            >
              {circle}
              {label_}
            </div>
          ) : (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: cx - 140,
                top: cy - R,
                width: 280,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {circle}
              {label_}
              <div style={{ marginTop: 10, width: 30 * on, height: 2, backgroundColor: COLORS.blue }} />
            </div>
          );
        })}
      </AbsoluteFill>
    </LightBackground>
  );
};
