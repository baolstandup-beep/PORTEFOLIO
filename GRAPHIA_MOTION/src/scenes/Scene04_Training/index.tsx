import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp, drift } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Kinetic } from '../../typography/Kinetic';
import { Chip } from '../../components/DesignUI';
import { Grain } from '../../components/Grain';
import { MiniAI, MiniBrand, MiniChallenge, MiniDigital, MiniProduction } from './Minis';
import { SceneProps } from '../types';

/** Programme officiel (site, section « Cinq jours, cinq étapes »), formulé comme dans le brief. */
export const DAYS = [
  { day: 'Jour 1', title: 'Design graphique & identité visuelle', Mini: MiniBrand },
  { day: 'Jour 2', title: 'Création & production graphique', Mini: MiniProduction },
  { day: 'Jour 3', title: 'IA & prompt engineering', Mini: MiniAI },
  { day: 'Jour 4', title: 'Design digital & entrepreneuriat créatif', Mini: MiniDigital },
  { day: 'Jour 5', title: 'Challenge créatif final', Mini: MiniChallenge },
];

/**
 * SCÈNE 04 — LES COMPÉTENCES. Plan 1 : titre plein cadre (« 5 jours. 5 étapes. »).
 * Plan 2 : le titre monte (tilt up) et les cinq journées entrent une à une, en rythme avec la voix off ;
 * la carte active passe au premier plan (mise au point), les autres reculent.
 * Sortie : la carte « IA » s'ouvre jusqu'à remplir l'écran (morphing vers la scène 05).
 */
export const Scene04Training: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, H, u } = useFormat();
  const items: number[] = cues.items;

  const lift = prog(t, cues.programme - 0.45, 0.8, EASE.inOut);
  const titleY = v ? lerp(H * 0.33, 200 * u, lift) : lerp(H * 0.36, 95 * u, lift);
  const titleScale = lerp(1, v ? 0.62 : 0.55, lift);

  // géométrie des cartes
  const n = 5;
  const gap = (v ? 16 : 22) * u;
  const cardW = v ? W - 180 * u : (W - 260 * u - gap * (n - 1)) / n;
  const cardH = v ? 196 * u : cardW + 200 * u;
  const top0 = v ? 470 * u : (H - cardH) / 2 + 60 * u;
  const rect = (i: number) => (v ? { x: 90 * u, y: top0 + i * (cardH + gap), w: cardW, h: cardH } : { x: 130 * u + i * (cardW + gap), y: top0, w: cardW, h: cardH });
  const mini = v ? cardH - 28 * u : cardW - 28 * u;

  // actif = dernier item annoncé
  const active = items.reduce((a, at, i) => (t >= at - 0.1 ? i : a), -1);
  const outP = prog(t, cues.out, dur - cues.out, [0.7, 0, 0.25, 1]);
  const r3 = rect(2);

  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${C.line} ${1.6 * u}px, transparent ${1.6 * u}px)`, backgroundSize: `${34 * u}px ${34 * u}px`, opacity: 0.8, transform: `translateY(${-t * 8 * u}px)` }} />
      {/* titre */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: titleY, transform: `scale(${titleScale})`, transformOrigin: '50% 0' }}>
        <Kinetic text={"5\u00A0JOURS. 5\u00A0ÉTAPES."} maxWidth={v ? 900 * u : undefined} style={{ margin: "0 auto" }} t={t} at={cues.title} size={(v ? 150 : 170) * u} weight={900} color={C.ink} accent={{ 1: C.brand }} mode="mask" stagger={0.1} dur={0.8} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18 * u, marginTop: 34 * u, opacity: 1 - lift, flexWrap: 'wrap' }}>
          {['Apprendre', 'Expérimenter', 'Développer'].map((w, i) => (
            <Chip key={w} p={prog(t, cues.verbs + i * 0.55, 0.6, EASE.out)} size={(v ? 40 : 38) * u} dot={[C.brand, C.sun, C.brand][i]}>
              {w}
            </Chip>
          ))}
        </div>
      </div>
      {/* cartes */}
      {DAYS.map((d, i) => {
        const r = rect(i);
        const p = prog(t, items[i] - 0.12, 0.7, EASE.out);
        if (p <= 0) return null;
        const isActive = i === active;
        const focus = isActive ? 1 : 0;
        const k = isActive ? prog(t, items[i] - 0.1, 0.4) : 1 - prog(t, items[Math.min(i + 1, 4)] - 0.1, 0.4);
        const Mini = d.Mini;
        const flip = v ? `rotateX(${lerp(-75, 0, p)}deg)` : `rotateY(${lerp(70, 0, p)}deg)`;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: r.x, top: r.y + drift(t, i, 3 * u), width: r.w, height: r.h, perspective: 1600,
              opacity: Math.min(1, p * 2) * (1 - (i === 2 ? 0 : outP)),
            }}
          >
            <div
              style={{
                width: '100%', height: '100%', transform: `${flip} translateY(${lerp(60, 0, p)}px) scale(${1 + 0.035 * focus * k})`, transformOrigin: v ? '50% 0' : '0 50%',
                background: C.paper, borderRadius: 24 * u, border: `${(isActive ? 3 : 1) * u}px solid ${isActive ? C.brand : C.line}`,
                boxShadow: isActive ? '0 30px 60px -25px rgba(7,141,67,0.45)' : '0 1px 2px rgb(8 8 8 / 0.04), 0 8px 24px -12px rgb(8 8 8 / 0.12)',
                padding: 14 * u, display: 'flex', flexDirection: v ? 'row' : 'column', gap: 18 * u, overflow: 'hidden',
              }}
            >
              <div style={{ position: 'relative', width: mini, height: mini, borderRadius: 16 * u, overflow: 'hidden', flexShrink: 0 }}>
                <Mini t={t} at={items[i]} s={mini} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 * u, justifyContent: v ? 'center' : 'flex-start', padding: v ? 0 : `0 ${6 * u}px` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 * u }}>
                  <span style={{ width: 40 * u, height: 40 * u, borderRadius: 99, background: isActive ? C.brand : C.ink, color: C.paper, fontFamily: FONT, fontWeight: 800, fontSize: 20 * u, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                  <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 20 * u, letterSpacing: '0.16em', color: C.brand, textTransform: 'uppercase' }}>{d.day}</span>
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: (v ? 36 : 29) * u, lineHeight: 1.15, color: C.ink, letterSpacing: '-0.015em' }}>{d.title}</div>
              </div>
            </div>
          </div>
        );
      })}
      {/* morphing de sortie : la carte IA s'ouvre en plein écran */}
      {outP > 0 && (
        <div
          style={{
            position: 'absolute', left: lerp(r3.x, 0, outP), top: lerp(r3.y, 0, outP), width: lerp(r3.w, W, outP), height: lerp(r3.h, H, outP),
            background: C.ink, borderRadius: lerp(24, 0, outP) * u,
          }}
        />
      )}
      <Grain frame={frame} opacity={0.03} />
    </AbsoluteFill>
  );
};
