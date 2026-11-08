import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp, drift } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Chip } from '../../components/DesignUI';
import { Icon } from '../../components/Icons';
import { Kinetic } from '../../typography/Kinetic';
import { PanelWipe } from '../../transitions/PanelWipe';
import { Grain } from '../../components/Grain';
import { SceneProps } from '../types';

const STEPS = [
  { label: 'Idée', icon: 'idea' },
  { label: 'Apprentissage', icon: 'learn' },
  { label: 'Création', icon: 'create' },
  { label: 'Portfolio', icon: 'portfolio' },
  { label: 'Opportunités', icon: 'rocket' },
];
const PROFILES = ['Designer', 'Infographiste', 'Étudiant', 'Jeune passionné'];

/** Petites scènes illustrées au-dessus de chaque étape (personnages géométriques, sans visage inventé). */
const Vignette: React.FC<{ i: number; p: number; s: number; t: number }> = ({ i, p, s, t }) => {
  const person = (x: number, y: number, c: string, k: number) => (
    <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${k})`}>
      <circle cx="0" cy="-14" r="8" fill={c} />
      <path d="M-14 12 C-14 -2 14 -2 14 12 Z" fill={c} />
    </g>
  );
  const box: React.CSSProperties = { width: s, height: s * 0.78, borderRadius: s * 0.1, overflow: 'hidden', position: 'relative', transform: `translateY(${lerp(30, 0, p)}px) scale(${lerp(0.8, 1, p)})`, opacity: Math.min(1, p * 2), boxShadow: '0 20px 40px -20px rgba(8,8,8,0.35)' };
  if (i === 0)
    return (
      <div style={{ ...box, background: C.ink }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: s * 0.5, height: s * 0.5, borderRadius: '50%', background: C.sun, filter: `blur(${s * 0.12}px)`, opacity: 0.55 + 0.25 * Math.sin(t * 4), transform: 'translate(-50%,-50%)' }} />
        <Icon name="idea" size={s * 0.42} color={C.paper} stroke={1.6} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }} />
      </div>
    );
  if (i === 1)
    return (
      <div style={{ ...box, background: C.brand50 }}>
        <svg viewBox="0 0 120 94" width="100%" height="100%">
          <rect x="35" y="30" width="50" height="30" rx="3" fill={C.ink} />
          <rect x="39" y="34" width="42" height="22" rx="2" fill={C.brand} />
          <rect x="15" y="62" width="90" height="8" rx="4" fill={C.brandDark} />
          {person(22, 58, C.brand, 1)}
          {person(98, 58, C.sun, 1)}
          {person(45, 86, C.ink, 0.9)}
          {person(75, 86, C.brandDark, 0.9)}
        </svg>
      </div>
    );
  if (i === 2)
    return (
      <div style={{ ...box, background: C.mist }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ position: 'absolute', left: '50%', top: '52%', width: s * 0.36, height: s * 0.5, borderRadius: 6, background: [C.brandDark, C.sunLogo, C.brand][k], transform: `translate(-50%,-50%) rotate(${(k - 1) * 14 * p}deg) translateX(${(k - 1) * s * 0.12 * p}px)`, boxShadow: '0 8px 16px -8px rgba(0,0,0,0.4)' }}>
            {k === 2 && <div style={{ position: 'absolute', left: '18%', top: '14%', width: '64%', aspectRatio: '1', borderRadius: '50%', border: `${s * 0.025}px solid ${C.sunLogo}` }} />}
          </div>
        ))}
      </div>
    );
  if (i === 3)
    return (
      <div style={{ ...box, background: C.paper, border: `1px solid ${C.line}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: s * 0.04, padding: s * 0.07 }}>
        {[C.brand, C.sunLogo, C.ink, C.brand50, C.brandDark, C.sun].map((c, k) => (
          <div key={k} style={{ borderRadius: 6, background: c, transform: `scale(${prog(p, k * 0.1, 0.5, EASE.back)})` }} />
        ))}
      </div>
    );
  return (
    <div style={{ ...box, background: `linear-gradient(160deg, ${C.brand}, ${C.brandDark})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: s * 0.05 }}>
      {['Clients', 'Projets', 'Réseau'].map((w, k) => (
        <div key={w} style={{ fontFamily: FONT, fontWeight: 700, fontSize: s * 0.1, color: k === 1 ? C.ink : C.paper, background: k === 1 ? C.sun : 'rgba(255,255,255,0.15)', borderRadius: 99, padding: `${s * 0.015}px ${s * 0.07}px`, opacity: prog(p, 0.2 + k * 0.15, 0.4) }}>
          {w}
        </div>
      ))}
    </div>
  );
};

/**
 * SCÈNE 06 — TRANSFORMATION. Plan : travelling latéral (vertical en 9:16) qui suit le parcours,
 * même langage que l'animation « Parcours IA » du site (nœuds verts numérotés, pastille noire).
 * Puis un rideau vert découvre la phrase-manifeste.
 */
export const Scene06Transformation: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, H, u } = useFormat();
  const nodes: number[] = cues.nodes;
  const profs: number[] = cues.profiles;

  // progression continue le long du parcours (0 → 4)
  let pos = 0;
  for (let i = 0; i < 4; i++) pos += prog(t, nodes[i] + 0.15, nodes[i + 1] - nodes[i], EASE.inOut);
  const start = v ? { x: 200 * u, y: 520 * u } : { x: 230 * u, y: 720 * u };
  const span = v ? 900 * u : W - 460 * u;
  const pt = (k: number) => (v ? { x: start.x, y: start.y + (span * k) / 4 } : { x: start.x + (span * k) / 4, y: start.y });
  const cur = pt(pos);
  const pan = v ? 0 : 0;

  const wipe = prog(t, cues.punch - 0.35, 0.6, EASE.mask);
  const outP = prog(t, cues.out, dur - cues.out, [0.6, 0, 0.4, 1]);
  const vs = v ? 200 * u : 280 * u;

  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${pan}px) scale(${lerp(1.06, 1, prog(t, 0, 1.2, EASE.out))})` }}>
        {/* profils */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: v ? 250 * u : 150 * u, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 14 * u, padding: `0 ${90 * u}px` }}>
          {PROFILES.map((pname, i) => (
            <Chip key={pname} p={prog(t, profs[i] - 0.05, 0.5, EASE.out)} size={(v ? 34 : 32) * u} dot={i % 2 ? C.sun : C.brand}>
              {pname}
            </Chip>
          ))}
        </div>
        {/* tracé */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <line x1={pt(0).x} y1={pt(0).y} x2={pt(4).x} y2={pt(4).y} stroke={C.brand50} strokeWidth={14 * u} strokeLinecap="round" />
          <line x1={pt(0).x} y1={pt(0).y} x2={cur.x} y2={cur.y} stroke={C.brand} strokeWidth={14 * u} strokeLinecap="round" />
        </svg>
        {STEPS.map((s, i) => {
          const p = pt(i);
          const k = prog(t, nodes[i], 0.5, EASE.back);
          const vp = prog(t, nodes[i] + 0.05, 0.7, EASE.out);
          return (
            <React.Fragment key={s.label}>
              <div style={{ position: 'absolute', left: p.x - 34 * u, top: p.y - 34 * u, width: 68 * u, height: 68 * u, borderRadius: 99, background: k > 0 ? C.brand : C.brand50, transform: `scale(${0.6 + 0.4 * k})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: k > 0 ? '0 10px 24px -8px rgba(7,141,67,0.6)' : 'none' }}>
                <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: 28 * u, color: C.paper }}>{i + 1}</span>
              </div>
              <div
                style={{
                  position: 'absolute', fontFamily: FONT, fontWeight: 800, fontSize: (v ? 40 : 30) * u, color: C.ink, letterSpacing: '0.02em', textTransform: 'uppercase',
                  ...(v ? { left: p.x + 70 * u, top: p.y - 26 * u } : { left: p.x, top: p.y + 60 * u, transform: 'translateX(-50%)' }),
                  opacity: Math.min(1, k * 2),
                }}
              >
                {s.label}
              </div>
              <div style={{ position: 'absolute', ...(v ? { left: p.x + 470 * u, top: p.y - vs * 0.39 } : { left: p.x - vs / 2, top: p.y - vs * 0.78 - 80 * u }) }}>
                <Vignette i={i} p={vp} s={vs} t={t} />
              </div>
            </React.Fragment>
          );
        })}
        {/* pastille du créatif (comme sur le site) */}
        <div style={{ position: 'absolute', left: cur.x - 46 * u, top: cur.y - 46 * u + drift(t, 2, 2), width: 92 * u, height: 92 * u, borderRadius: 99, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 30px -10px rgba(8,8,8,0.6)', opacity: prog(t, nodes[0] - 0.1, 0.4) }}>
          <svg width={46 * u} height={46 * u} viewBox="0 0 24 24" fill="none" stroke={C.sun} strokeWidth={2} strokeLinecap="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
        </div>
      </div>

      {/* manifeste */}
      <PanelWipe p={wipe} n={v ? 3 : 5} />
      {wipe > 0.5 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: `0 ${v ? 90 : 160}px`, transform: `scale(${lerp(1, 1.25, outP)})`, filter: `blur(${outP * 14}px)`, opacity: 1 - outP }}>
          <Kinetic text={"TRANSFORMEZ VOTRE PASSION EN\u00A0COMPÉTENCE."} t={t} at={cues.punch} size={(v ? 90 : 104) * u} weight={900} color={C.paper} accent={{ 3: C.sun }} mode="rise" stagger={0.09} maxWidth={v ? 900 * u : 1500 * u} />
        </AbsoluteFill>
      )}
      <Grain frame={frame} opacity={0.035} />
      {outP > 0 && <div style={{ position: 'absolute', inset: 0, background: C.ink, opacity: outP }} />}
    </AbsoluteFill>
  );
};
