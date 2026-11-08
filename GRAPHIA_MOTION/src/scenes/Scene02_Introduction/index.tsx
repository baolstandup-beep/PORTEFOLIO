import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp, drift } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Logo, LOGO_RATIO } from '../../components/Logo';
import { Chip } from '../../components/DesignUI';
import { Icon } from '../../components/Icons';
import { Kinetic } from '../../typography/Kinetic';
import { PanelWipe } from '../../transitions/PanelWipe';
import { Grain } from '../../components/Grain';
import { SceneProps } from '../types';

/**
 * SCÈNE 02 — PRÉSENTATION. Plan : le vert de l'iris se retire en rideau et découvre le papier blanc
 * (l'identité claire du site). Carte-logo en légère contre-plongée qui se pose, puis le visuel officiel
 * (main + outils + minaret de la Grande Mosquée de Touba) en léger travelling avant.
 */
export const Scene02Introduction: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, H, u } = useFormat();

  const curtain = prog(t, 0.0, 0.65, EASE.mask);
  const push = lerp(1, 1.045, prog(t, 0, dur, [0.4, 0, 0.6, 1]));
  const logoP = prog(t, cues.logo, 0.9, EASE.out);
  const logoReveal = prog(t, cues.logo + 0.1, 0.8, EASE.mask);
  const tagP = prog(t, cues.tag, 0.6, EASE.back);
  const visP = prog(t, cues.visual, 1.1, EASE.mask);
  const placeP = prog(t, cues.place, 0.6, EASE.out);
  const outP = prog(t, cues.out, dur - cues.out, [0.7, 0, 0.3, 1]);

  const logoW = v ? 600 * u : 600 * u;
  const cardPadX = logoW * 0.08;
  const cardW = logoW + cardPadX * 2;

  // visuel recadré (main + outils + minaret) : 1400 × 1360
  const visH = v ? 640 * u : 800 * u;
  const visW = visH * (1400 / 1360);
  const visX = v ? (W - visW) / 2 : W - 130 * u - visW;
  const visY = v ? 1000 * u : (H - visH) / 2;

  const leftX = v ? (W - cardW) / 2 : 150 * u;
  const logoY = v ? 250 * u : 210 * u;

  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${push})`, transformOrigin: v ? '50% 40%' : '30% 50%' }}>
        {/* fond : halos doux de marque (comme les .blob du site) */}
        <div style={{ position: 'absolute', width: 900 * u, height: 900 * u, left: -200 * u + drift(t, 1, 30), top: -300 * u, borderRadius: '50%', background: C.brand50, filter: `blur(${60 * u}px)` }} />
        <div style={{ position: 'absolute', width: 700 * u, height: 700 * u, right: -150 * u, bottom: -250 * u + drift(t, 3, 30), borderRadius: '50%', background: 'rgba(245,229,0,0.18)', filter: `blur(${60 * u}px)` }} />

        {/* visuel officiel */}
        <div
          style={{
            position: 'absolute', left: visX, top: visY + drift(t, 4, 6 * u) - (1 - visP) * 40 * u, width: visW, height: visH,
            borderRadius: 28 * u, overflow: 'hidden', boxShadow: '0 40px 90px -30px rgba(8,8,8,0.45)',
            clipPath: `inset(${(1 - visP) * 100}% 0 0 0 round ${28 * u}px)`,
          }}
        >
          <Img src={staticFile('images/visuel-graphia-crop.webp')} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${lerp(1.18, 1.02, prog(t, cues.visual, dur - cues.visual, [0.2, 0.6, 0.3, 1]))})` }} />
        </div>
        {/* lieu */}
        <div style={{ position: 'absolute', left: v ? visX + 30 * u : visX - 120 * u, top: v ? visY - 40 * u : visY + visH - 140 * u }}>
          <Chip p={placeP} size={v ? 30 * u : 28 * u}>
            <Icon name="pin" size={(v ? 32 : 30) * u} color={C.brand} stroke={2.2} />
            Touba · Mbacké — Sénégal
          </Chip>
        </div>

        {/* carte-logo */}
        <div
          style={{
            position: 'absolute', left: leftX, top: logoY,
            transform: `perspective(1400px) rotateX(${lerp(24, 0, logoP)}deg) translateY(${lerp(60, 0, logoP) * u}px) scale(${lerp(0.92, 1, logoP)})`,
            opacity: Math.min(1, logoP * 2), transformOrigin: '50% 100%',
          }}
        >
          <div style={{ background: C.paper, borderRadius: 26 * u, padding: `${logoW * 0.06}px ${cardPadX}px`, boxShadow: '0 1px 2px rgb(8 8 8 / 0.04), 0 30px 70px -28px rgb(8 8 8 / 0.35)', border: `1px solid ${C.line}` }}>
            <Logo width={logoW} reveal={logoReveal} />
          </div>
          {/* étiquette 2026 (même pavé jaune que « IA » du logo) */}
          <div
            style={{
              position: 'absolute', right: -24 * u, bottom: -34 * u, background: C.sunLogo, color: C.ink, fontFamily: FONT, fontWeight: 900,
              fontSize: 64 * u, lineHeight: 1, padding: `${10 * u}px ${22 * u}px`, borderRadius: 10 * u, letterSpacing: '-0.02em',
              transform: `rotate(${lerp(-14, -4, tagP)}deg) scale(${tagP})`, boxShadow: '0 16px 30px -12px rgba(8,8,8,0.35)',
            }}
          >
            2026
          </div>
        </div>

        {/* accroche */}
        <div style={{ position: 'absolute', left: v ? 90 * u : leftX, top: v ? logoY + logoW * LOGO_RATIO + logoW * 0.12 + 80 * u : logoY + logoW * LOGO_RATIO + logoW * 0.12 + 120 * u, width: v ? W - 180 * u : 820 * u }}>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: (v ? 26 : 24) * u, letterSpacing: '0.2em', color: C.brand, marginBottom: 18 * u, opacity: prog(t, cues.sub - 0.2, 0.5), textAlign: v ? 'center' : 'left' }}>
            BOOTCAMP · 5 JOURS · 50 TALENTS
          </div>
          <Kinetic
            text="Le bootcamp de l'infographie et de l'intelligence artificielle."
            t={t} at={cues.sub} size={(v ? 62 : 58) * u} weight={800} color={C.ink} align={v ? 'center' : 'left'}
            accent={{ 6: C.brand, 7: C.brand }} lineHeight={1.12} stagger={0.06} tracking={-0.025}
          />
        </div>
      </div>
      <Grain frame={frame} opacity={0.035} />
      <PanelWipe p={1 - curtain} dir="in" n={v ? 3 : 5} />
      <PanelWipe p={outP} dir="in" n={v ? 3 : 5} vertical />
    </AbsoluteFill>
  );
};
