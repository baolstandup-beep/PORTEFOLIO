import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Chip } from '../../components/DesignUI';
import { Icon } from '../../components/Icons';
import { Logo } from '../../components/Logo';
import { Particles } from '../../components/Particles';
import { Kinetic } from '../../typography/Kinetic';
import { RingIris } from '../../transitions/RingIris';
import { Grain } from '../../components/Grain';
import { SceneProps } from '../types';

/** Offres OFFICIELLES (graphia/src/lib/partners.ts → PACKS), mêmes couleurs que les cartes du site. */
const PACKS = [
  { name: 'Pack Or', tag: 'Partenaire majeur', amount: 'À partir de 300 000 FCFA', perks: ['Logo en position prioritaire', 'Prise de parole possible'], bg: '#151515', fg: C.paper, badge: [C.sun, C.ink], ring: C.sun, accent: C.sun },
  { name: 'Pack Argent', tag: 'Partenaire officiel', amount: '200 000 à 299 000 FCFA', perks: ['Logo sur les supports officiels', 'Présence à la cérémonie finale'], bg: C.paper, fg: C.ink, badge: [C.mist, C.ink], ring: 'rgba(8,8,8,0.1)', accent: C.brand },
  { name: 'Pack Bronze', tag: 'Partenaire soutien', amount: '100 000 à 199 000 FCFA', perks: ['Logo sur une sélection de supports', 'Reconnaissance à la clôture'], bg: C.paper, fg: C.ink, badge: ['#f3e2cf', '#7a4a1c'], ring: 'rgba(8,8,8,0.1)', accent: C.brand },
  { name: 'Partenaire technique', tag: 'Contribution en nature', amount: 'Produits, services ou équipements', perks: ['Internet, impression, matériel', 'Salle, logiciels, restauration'], bg: C.brand, fg: C.paper, badge: ['rgba(255,255,255,0.15)', C.paper], ring: C.brand, accent: C.sun },
];
/** Types de partenaires (graphia/src/lib/partners.ts → PARTNER_TYPES). */
const TYPES = ['Institutionnel', 'Financier / sponsor', 'Technique', 'Média'];

/**
 * SCÈNE 09 — PARTENAIRES. Plan 1 (nuit) : la phrase du site « Investissez dans les talents créatifs de
 * Touba et Mbacké. » et les 4 types de partenaires. Plan 2 : le titre monte, les 4 offres officielles
 * se lèvent en éventail. Plan 3 : bouton « Devenir partenaire » + adresse. Plan final : iris blanc, logo.
 */
export const Scene09Partenaires: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, H, u } = useFormat();
  const c = cues as { title: number; types: number; packs: number[]; cta: number; end: number };

  const lift = prog(t, c.packs[0] - 0.5, 0.8, EASE.inOut);
  const iris = prog(t, c.end - 0.5, 0.5, [0.6, 0, 0.3, 1]);
  const cardW = v ? 430 * u : 370 * u;
  const cardH = v ? 330 * u : 380 * u;
  const gap = 24 * u;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 30%, ${C.brandDeep}, ${C.ink} 75%)` }} />
      <Particles t={t + 60} count={v ? 40 : 55} seed={31} opacity={0.6} colors={[C.sun, C.brand, '#ffffff']} />
      {/* titre */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: lerp(v ? 520 : 300, v ? 250 : 80, lift) * u, padding: `0 ${v ? 90 : 160}px`, transform: `scale(${lerp(1, v ? 0.72 : 0.66, lift)})`, transformOrigin: '50% 0' }}>
        <div style={{ textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 26 * u, letterSpacing: '0.24em', color: C.sun, opacity: prog(t, c.title - 0.2, 0.5), marginBottom: 16 * u }}>PARTENAIRES</div>
        <Kinetic text="Investissez dans les talents créatifs de Touba et Mbacké." t={t} at={c.title} size={(v ? 76 : 80) * u} weight={900} color={C.paper} accent={{ 3: C.sun, 4: C.sun }} lineHeight={1.1} stagger={0.07} maxWidth={v ? 900 * u : 1450 * u} style={{ margin: '0 auto' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 * u, marginTop: 34 * u }}>
          {TYPES.map((x, i) => (
            <Chip key={x} p={prog(t, c.types + i * 0.3, 0.5, EASE.out)} dark size={(v ? 32 : 30) * u} dot={i % 2 ? C.sun : C.brand}>
              {x}
            </Chip>
          ))}
        </div>
      </div>
      {/* offres */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: v ? 640 * u : 390 * u, display: 'grid', gridTemplateColumns: `repeat(${v ? 2 : 4}, ${cardW}px)`, gap, justifyContent: 'center' }}>
        {PACKS.map((p, i) => {
          const k = prog(t, c.packs[i], 0.7, EASE.out);
          return (
            <div
              key={p.name}
              style={{
                height: cardH, borderRadius: 26 * u, background: p.bg, color: p.fg, boxShadow: `0 0 0 ${i === 0 ? 3 : 1}px ${p.ring}, 0 40px 70px -30px rgba(0,0,0,0.7)`,
                padding: 26 * u, fontFamily: FONT, opacity: Math.min(1, k * 2), transform: `translateY(${lerp(120, 0, k) * u}px) rotate(${lerp((i - 1.5) * 6, 0, k)}deg)`,
                display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
              }}
            >
              {i === 0 && <div style={{ position: 'absolute', right: -50 * u, top: -50 * u, width: 160 * u, height: 160 * u, borderRadius: '50%', background: 'rgba(245,229,0,0.35)', filter: `blur(${40 * u}px)` }} />}
              <span style={{ alignSelf: 'flex-start', fontSize: 15 * u, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: `${5 * u}px ${12 * u}px`, borderRadius: 99, background: p.badge[0], color: p.badge[1] }}>{p.tag}</span>
              <div style={{ marginTop: 18 * u, fontSize: 36 * u, fontWeight: 900, lineHeight: 1.05 }}>{p.name}</div>
              <div style={{ marginTop: 8 * u, fontSize: 19 * u, fontWeight: 700, color: p.accent }}>{p.amount}</div>
              <div style={{ marginTop: 'auto' }}>
                {p.perks.map((x) => (
                  <div key={x} style={{ display: 'flex', gap: 8 * u, alignItems: 'flex-start', fontSize: 17 * u, fontWeight: 500, lineHeight: 1.3, marginTop: 8 * u, opacity: 0.85 }}>
                    <Icon name="check" size={18 * u} color={p.accent} stroke={3} style={{ flexShrink: 0, marginTop: 2 * u }} />
                    {x}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: v ? 1345 * u : 800 * u, textAlign: 'center', fontFamily: FONT, fontSize: 18 * u, color: 'rgba(255,255,255,0.5)', opacity: prog(t, c.packs[3] + 0.3, 0.5) }}>
        Montants indicatifs · contributions en nature bienvenues
      </div>
      {/* appel */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: v ? 1395 * u : 850 * u, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22 * u, flexDirection: v ? 'column' : 'row', opacity: prog(t, c.cta, 0.4), transform: `translateY(${lerp(30, 0, prog(t, c.cta, 0.6, EASE.out))}px)` }}>
        <div style={{ height: 86 * u, padding: `0 ${40 * u}px`, borderRadius: 99, background: C.sun, color: C.ink, fontFamily: FONT, fontWeight: 800, fontSize: 32 * u, display: 'flex', alignItems: 'center', gap: 14 * u, letterSpacing: '0.03em' }}>
          DEVENIR PARTENAIRE <Icon name="arrow" size={30 * u} color={C.ink} stroke={2.6} />
        </div>
        {!v && <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 30 * u, color: C.paper }}>graphia-2026.vercel.app/partenaires</div>}
      </div>
      {/* plan final */}
      <RingIris p={iris} color={C.paper} />
      {iris >= 1 && (
        <AbsoluteFill style={{ background: C.paper, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * u, transform: `scale(${lerp(1, 1.03, prog(t, c.end, dur - c.end))})` }}>
          <Logo width={(v ? 700 : 720) * u} reveal={prog(t, c.end - 0.05, 0.7, EASE.mask)} />
          <div style={{ display: 'flex', flexDirection: v ? 'column' : 'row', gap: (v ? 16 : 26) * u, alignItems: 'center', opacity: prog(t, c.end + 0.4, 0.5) }}>
            {[
              ['Candidater', 'graphia-2026.vercel.app', C.brand, C.paper],
              ['Partenaires', 'graphia-2026.vercel.app/partenaires', C.sun, C.ink],
            ].map(([k, url, bg, fg]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12 * u, fontFamily: FONT, fontSize: (v ? 30 : 28) * u, fontWeight: 600, color: C.ink, padding: `${10 * u}px ${22 * u}px ${10 * u}px ${10 * u}px`, borderRadius: 99, background: C.mist }}>
                <span style={{ background: bg, color: fg, fontWeight: 800, fontSize: (v ? 22 : 20) * u, padding: `${6 * u}px ${14 * u}px`, borderRadius: 99, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{k}</span>
                {url}
              </div>
            ))}
          </div>
        </AbsoluteFill>
      )}
      <Grain frame={frame} opacity={0.04} />
    </AbsoluteFill>
  );
};
