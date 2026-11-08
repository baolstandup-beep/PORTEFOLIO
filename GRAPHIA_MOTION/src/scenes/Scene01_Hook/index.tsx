import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE } from '../../theme';
import { prog, lerp, drift } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Particles } from '../../components/Particles';
import { Grain, Vignette } from '../../components/Grain';
import { PenPath } from '../../components/PenPath';
import { SelectionBox, Cursor } from '../../components/DesignUI';
import { Kinetic } from '../../typography/Kinetic';
import { Glitch } from '../../typography/Glitch';
import { RingIris } from '../../transitions/RingIris';
import { Flash } from '../../transitions/Flash';
import { SceneProps } from '../types';

/**
 * SCÈNE 01 — HOOK. Plan : fond nuit, push-in lent (focale simulée 35→50 mm),
 * la plume trace une ligne qui traverse l'écran, puis typographie « slam ».
 */
export const Scene01Hook: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, H, u } = useFormat();

  const push = prog(t, 0, dur, [0.3, 0, 0.6, 1]);
  const camScale = lerp(1, 1.12, push);
  const camX = drift(t, 2, 6 * u);
  const camY = drift(t, 5, 4 * u);

  // ligne graphique (plume)
  const penP = prog(t, 0.05, 1.5, EASE.inOut);
  const nodes = v
    ? [
        { x: -60, y: H * 0.36, hx: 200, hy: -160 },
        { x: W * 0.5, y: H * 0.3, hx: 220, hy: 120 },
        { x: W + 60, y: H * 0.42, hx: 160, hy: -80 },
      ]
    : [
        { x: -80, y: H * 0.66, hx: 320, hy: -220 },
        { x: W * 0.36, y: H * 0.5, hx: 260, hy: 140 },
        { x: W * 0.7, y: H * 0.62, hx: 240, hy: -120 },
        { x: W + 80, y: H * 0.38, hx: 220, hy: -60 },
      ];

  const l1 = cues.line1 as number;
  const l2 = cues.line2 as number;
  const glitchAmt = Math.max(0, 1 - Math.abs(t - (l2 - 0.05)) / 0.16);
  const showL1 = t < l2 + 0.02;
  const outP = prog(t, cues.out, dur - cues.out, [0.6, 0, 0.4, 1]);

  const size1 = v ? 132 * u : 128 * u;
  const size2 = v ? 96 * u : 88 * u;
  const glowP = prog(t, 0, 2.5, EASE.rise);

  // sélection + curseur sur la 2e ligne
  const selP = prog(t, l2 + 0.75, 0.5, EASE.out);
  const curIn = prog(t, l2 + 0.5, 0.7, EASE.out);

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${camX}px, ${camY}px) scale(${camScale})` }}>
        {/* halo vert profond */}
        <div
          style={{
            position: 'absolute', inset: 0, opacity: glowP,
            background: `radial-gradient(ellipse 70% 55% at 50% ${v ? 55 : 62}%, ${C.brandDeep} 0%, rgba(3,56,27,0.35) 40%, rgba(8,8,8,0) 75%)`,
          }}
        />
        {/* grille de plan de travail */}
        <div
          style={{
            position: 'absolute', inset: -100, opacity: 0.07 * glowP,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: `${80 * u}px ${80 * u}px`,
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          }}
        />
        <Particles t={t} count={v ? 60 : 80} seed={11} push={push * 0.6} opacity={glowP} />
        <PenPath nodes={nodes} p={penP} width={5 * u} fade={prog(t, l2 - 0.1, 0.5) * 0.65} handles={1 - prog(t, l1 + 0.6, 0.6)} />

        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: v ? '0 90px' : '0 140px' }}>
          {showL1 ? (
            <Glitch
              amount={glitchAmt}
              frame={frame}
              render={(col) => (
                <Kinetic
                  text="LE MONDE CRÉATIF CHANGE."
                  t={t} at={l1} size={size1} weight={900} mode="slam" stagger={0.14} dur={0.55}
                  color={col ?? C.paper} accent={col ? {} : { 3: C.sun }} maxWidth={v ? 900 * u : 1700 * u}
                  style={{ textShadow: col ? undefined : '0 10px 60px rgba(0,0,0,0.6)' }}
                />
              )}
            />
          ) : (
            // Le cadre de sélection entoure le texte AVEC une marge : il ne touche jamais les lettres.
            <div style={{ position: 'relative', padding: `${size2 * 0.42}px ${size2 * 0.6}px` }}>
              <Glitch
                amount={Math.max(0, 1 - Math.abs(t - l2) / 0.12) * 0.6}
                frame={frame}
                render={(col) => (
                  <Kinetic
                    text={"ET SI VOUS EN FAISIEZ PARTIE\u00A0?"}
                    t={t} at={l2} size={size2} weight={800} mode="rise" stagger={0.08} dur={0.7}
                    color={col ?? C.paper} accent={col ? {} : { 5: C.sun }} maxWidth={v ? 760 * u : 1400 * u}
                  />
                )}
              />
              <SelectionBox p={selP * (1 - outP)} color={C.sun} scale={u * 1.2} />
              <Cursor
                x={`calc(${lerp(140, 100, curIn)}% - ${20 * u}px)`} y={`calc(${lerp(160, 100, curIn)}% - ${20 * u}px)`}
                scale={u * 1.6} opacity={curIn * (1 - outP)} press={prog(t, l2 + 1.15, 0.1) - prog(t, l2 + 1.3, 0.15)}
              />
            </div>
          )}
        </AbsoluteFill>
      </div>
      <Vignette strength={0.75} />
      <Grain frame={frame} opacity={0.07} />
      <Flash t={t} at={l1 + 0.05} dur={0.22} max={0.25} color={C.paper} />
      <RingIris p={outP} />
    </AbsoluteFill>
  );
};
