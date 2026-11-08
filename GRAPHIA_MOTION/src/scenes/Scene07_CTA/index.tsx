import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp, mulberry32 } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Logo, LOGO_RATIO } from '../../components/Logo';
import { Cursor } from '../../components/DesignUI';
import { Icon } from '../../components/Icons';
import { Particles } from '../../components/Particles';
import { Kinetic } from '../../typography/Kinetic';
import { RingIris } from '../../transitions/RingIris';
import { Flash } from '../../transitions/Flash';
import { Grain } from '../../components/Grain';
import { SceneProps } from '../types';

const URL = 'graphia-2026.vercel.app';

/**
 * SCÈNE 07 — APPEL À CANDIDATER. Plan 1 (nuit) : « 50 PLACES. » sur la grille de 50 points (rappel de la
 * scène 03). Plan 2 : l'anneau s'ouvre en blanc, retour au logo, bouton CANDIDATER cliqué, adresse du site.
 * Plan final : logo officiel sur fond papier, tenu jusqu'à la dernière image.
 */
export const Scene07CTA: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, H, u } = useFormat();

  const iris = prog(t, cues.logo - 0.6, 0.5, [0.6, 0, 0.3, 1]);
  const dark = iris < 1;
  const logoP = prog(t, cues.logo - 0.12, 0.9, EASE.out);
  const btnP = prog(t, cues.button, 0.7, EASE.back);
  const urlN = Math.floor(URL.length * prog(t, cues.url, 1.1, [0.3, 0, 0.7, 1]));
  const press = prog(t, cues.click - 0.05, 0.08) - prog(t, cues.click + 0.05, 0.18);
  const shine = prog(t, cues.click, 0.7, EASE.inOut);
  const endP = prog(t, cues.end, 0.9, EASE.out);
  const hold = lerp(1, 1.035, prog(t, cues.logo, dur - cues.logo, [0.4, 0, 0.6, 1]));

  const dots = useMemo(() => {
    const r = mulberry32(77);
    return Array.from({ length: 50 }, () => r());
  }, []);
  const cols = v ? 5 : 10;
  const gap = v ? 150 * u : 150 * u;

  const logoW = v ? 700 * u : 760 * u;
  const centerY = v ? 600 * u : 230 * u;
  const btnY = centerY + logoW * LOGO_RATIO + (v ? 270 * u : 210 * u);
  const btnW = (v ? 760 : 640) * u;
  const btnH = (v ? 120 : 104) * u;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
      {/* PLAN 1 : 50 places */}
      {dark && (
        <AbsoluteFill>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${C.brandDeep}, ${C.ink} 75%)` }} />
          <div style={{ position: 'absolute', left: (W - (cols - 1) * gap) / 2, top: (H - ((50 / cols - 1) * gap)) / 2 }}>
            {dots.map((r, i) => {
              const k = prog(t, r * 0.6, 0.6, EASE.out);
              return <div key={i} style={{ position: 'absolute', left: (i % cols) * gap - 9 * u, top: Math.floor(i / cols) * gap - 9 * u, width: 18 * u, height: 18 * u, borderRadius: 99, background: r > 0.85 ? C.sun : C.brand, opacity: k * 0.5, transform: `scale(${k})` }} />;
            })}
          </div>
          <Particles t={t + 40} count={40} seed={7} opacity={0.6} />
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 * u }}>
            <Kinetic text="50 PLACES." t={t} at={cues.places} size={(v ? 200 : 210) * u} weight={900} color={C.paper} accent={{ 0: C.sun }} mode="slam" stagger={0.1} dur={0.5} />
            <Kinetic text="UNE OPPORTUNITÉ." t={t} at={cues.opportunite} size={(v ? 84 : 90) * u} weight={800} color={C.paper} mode="rise" stagger={0.1} />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      <Flash t={t} at={cues.places + 0.02} dur={0.2} max={0.35} color={C.paper} />
      <RingIris p={iris} color={C.paper} />

      {/* PLAN 2 + PLAN FINAL */}
      {iris >= 1 && (
        <AbsoluteFill style={{ background: C.paper, transform: `scale(${hold})` }}>
          <div style={{ position: 'absolute', width: 1000 * u, height: 1000 * u, left: -300 * u, top: -400 * u, borderRadius: '50%', background: C.brand50, filter: `blur(${70 * u}px)` }} />
          <div style={{ position: 'absolute', width: 800 * u, height: 800 * u, right: -250 * u, bottom: -300 * u, borderRadius: '50%', background: 'rgba(245,229,0,0.2)', filter: `blur(${70 * u}px)` }} />
          {/* logo */}
          <div style={{ position: 'absolute', left: (W - logoW) / 2, top: centerY + lerp(40, 0, logoP) * u, opacity: Math.min(1, logoP * 2) }}>
            <Logo width={logoW} reveal={prog(t, cues.logo - 0.1, 0.7, EASE.mask)} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: centerY + logoW * LOGO_RATIO + 60 * u }}>
            <Kinetic text="REJOIGNEZ GRAPHIA 2026." t={t} at={cues.join} size={(v ? 66 : 60) * u} weight={800} color={C.ink} accent={{ 1: C.brand, 2: C.brand }} mode="rise" stagger={0.08} />
          </div>
          {/* bouton CANDIDATER (style du bouton principal du site : pilule verte + ombre verte) */}
          <div
            style={{
              position: 'absolute', left: (W - btnW) / 2, top: btnY, width: btnW, height: btnH, borderRadius: 999, background: C.brand,
              boxShadow: '0 10px 15px -3px rgba(7,141,67,0.3), 0 4px 6px -4px rgba(7,141,67,0.3), 0 30px 60px -20px rgba(7,141,67,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 * u, overflow: 'hidden',
              transform: `scale(${btnP * (1 - press * 0.06)})`, opacity: Math.min(1, btnP * 2),
            }}
          >
            <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: (v ? 44 : 38) * u, color: C.paper, letterSpacing: '0.04em' }}>CANDIDATEZ MAINTENANT</span>
            <span style={{ width: 56 * u, height: 56 * u, borderRadius: 99, background: C.sun, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="arrow" size={32 * u} color={C.ink} stroke={2.6} />
            </span>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)', transform: `translateX(${lerp(-120, 120, shine)}%)` }} />
            {press > 0 || (t > cues.click && t < cues.click + 0.8) ? (
              <div style={{ position: 'absolute', left: '62%', top: '50%', width: 40 * u, height: 40 * u, borderRadius: 99, border: `3px solid ${C.paper}`, transform: `translate(-50%,-50%) scale(${1 + prog(t, cues.click, 0.7) * 12})`, opacity: 1 - prog(t, cues.click, 0.7) }} />
            ) : null}
          </div>
          {/* adresse */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: btnY + btnH + 44 * u, display: 'flex', justifyContent: 'center', opacity: prog(t, cues.url - 0.2, 0.4) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 * u, padding: `${14 * u}px ${30 * u}px`, borderRadius: 999, background: C.mist, border: `1px solid ${C.line}`, fontFamily: FONT, fontWeight: 600, fontSize: (v ? 40 : 36) * u, color: C.ink }}>
              <span style={{ width: 14 * u, height: 14 * u, borderRadius: 99, background: C.brand }} />
              <span>
                {URL.slice(0, urlN)}
                <span style={{ opacity: urlN < URL.length && Math.floor(t * 3) % 2 === 0 ? 1 : 0, color: C.brand }}>|</span>
              </span>
            </div>
          </div>
          {/* curseur */}
          <Cursor
            x={lerp(W * 0.85, W / 2 + btnW * 0.12, prog(t, cues.click - 0.9, 0.8, EASE.out))}
            y={lerp(H * 0.95, btnY + btnH * 0.55, prog(t, cues.click - 0.9, 0.8, EASE.out))}
            scale={u * 1.8} press={press} opacity={prog(t, cues.click - 0.9, 0.3) * (1 - prog(t, cues.end - 0.2, 0.4))}
          />
          {/* signature */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: v ? 1395 * u : 985 * u, padding: `0 ${90 * u}px`, textAlign: 'center', lineHeight: 1.5, fontFamily: FONT, fontWeight: 500, fontSize: (v ? 26 : 24) * u, color: 'rgba(8,8,8,0.6)', opacity: endP, transform: `translateY(${lerp(14, 0, endP)}px)` }}>
            Bootcamp Infographie &amp; IA · Touba et Mbacké{v ? <br /> : ' · '}Organisé par Baol Up Graphic – Agence Digitale
          </div>
        </AbsoluteFill>
      )}
      <Grain frame={frame} opacity={0.035} />
    </AbsoluteFill>
  );
};
