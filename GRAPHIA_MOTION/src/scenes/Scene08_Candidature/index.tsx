import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp, drift } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Phone } from '../../components/Phone';
import { Logo } from '../../components/Logo';
import { Icon } from '../../components/Icons';
import { Kinetic } from '../../typography/Kinetic';
import { PanelWipe } from '../../transitions/PanelWipe';
import { Grain } from '../../components/Grain';
import { SceneProps } from '../types';

const URL = 'graphia-2026.vercel.app';
/** Étapes RÉELLES du formulaire (graphia/src/app/candidater/application-form.tsx → STEPS). */
const STEPS = ['Informations personnelles', 'Profil professionnel', 'Compétences et outils', 'Motivation', 'Portfolio et disponibilité', 'Validation'];
/** Deux libellés réels de champ par étape (contenu des réponses volontairement non affiché : aucune donnée personnelle). */
const FIELDS = [
  ['Prénom', 'Numéro WhatsApp'],
  ['Quel est votre profil ?', 'Depuis combien de temps pratiquez-vous l’infographie ?'],
  ['Utilisez-vous déjà l’intelligence artificielle ?', 'Quels outils IA connaissez-vous ?'],
  ['Quelle compétence souhaitez-vous améliorer ?', 'Quel est votre principal défi ?'],
  ['Lien vers votre portfolio', 'Êtes-vous disponible pendant les cinq jours ?'],
  ['Relisez vos réponses', 'Confirmer l’envoi'],
];
const CAPTIONS = [
  { n: 1, title: 'Rendez-vous sur', strong: URL },
  { n: 2, title: 'Cliquez sur', strong: '« Candidater »' },
  { n: 3, title: 'Formulaire en 6 étapes', strong: '≈ 10 min, sur téléphone' },
  { n: 4, title: '50 participants retenus', strong: 'contactés par téléphone ou WhatsApp' },
];

/**
 * SCÈNE 08 — COMMENT CANDIDATER. Démonstration du parcours réel du site sur un téléphone :
 * adresse → bouton « Candidater maintenant » → formulaire en 6 étapes (sauvegarde automatique) → confirmation.
 * Plan : téléphone en légère rotation 3D qui se redresse, travelling avant lent ; légendes numérotées.
 */
export const Scene08Candidature: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, H, u } = useFormat();

  const c = cues as { title: number; url: number; tap: number; form: number; steps: number[]; done: number; select: number; caps: number[]; out: number };
  const phoneW = v ? 430 * u : 410 * u;
  const enter = prog(t, c.title + 0.2, 1.0, EASE.out);
  const screen = t < c.tap + 0.45 ? 'site' : t < c.done ? 'form' : 'done';
  const urlN = Math.floor(URL.length * prog(t, c.url, 1.4, [0.3, 0, 0.7, 1]));
  const tapP = prog(t, c.tap, 0.12) - prog(t, c.tap + 0.12, 0.2);
  const ripple = prog(t, c.tap, 0.6);
  const stepIdx = c.steps.reduce((a, s, i) => (t >= s ? i : a), 0);
  const stepP = prog(t, c.steps[stepIdx], 0.45, EASE.out);
  const doneP = prog(t, c.done, 0.6, EASE.back);
  const outP = prog(t, c.out, dur - c.out, [0.6, 0, 0.4, 1]);
  const activeCap = c.caps.reduce((a, s, i) => (t >= s ? i : a), -1);
  const s = phoneW / 400; // échelle interne de l'écran

  const screenEl = (
    <div style={{ position: 'absolute', inset: 0, fontFamily: FONT, color: C.ink }}>
      {/* barre d'adresse */}
      <div style={{ position: 'absolute', left: 14 * s, right: 14 * s, top: 46 * s, height: 40 * s, borderRadius: 99, background: C.mist, display: 'flex', alignItems: 'center', gap: 8 * s, padding: `0 ${14 * s}px`, fontSize: 15 * s, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <span style={{ width: 9 * s, height: 9 * s, borderRadius: 9, background: C.brand }} />
        {screen === 'site' ? URL.slice(0, urlN) : screen === 'form' ? `${URL}/candidater` : `${URL}/candidater/confirmation`}
        {screen === 'site' && urlN < URL.length && <span style={{ color: C.brand }}>|</span>}
      </div>
      {screen === 'site' && (
        <div style={{ position: 'absolute', left: 22 * s, right: 22 * s, top: 104 * s, opacity: prog(t, c.url + 1.3, 0.4) }}>
          <Logo width={190 * s} />
          <div style={{ marginTop: 26 * s, fontSize: 12 * s, fontWeight: 700, letterSpacing: '0.14em', color: C.brand }}>BOOTCAMP INFOGRAPHIE &amp; IA · TOUBA ET MBACKÉ</div>
          <div style={{ marginTop: 10 * s, fontSize: 40 * s, fontWeight: 900, lineHeight: 1.04, letterSpacing: '-0.02em' }}>
            Un nouveau <span style={{ color: C.brand }}>chapitre</span> s’ouvre.
          </div>
          <div style={{ marginTop: 14 * s, fontSize: 16 * s, color: 'rgba(8,8,8,0.7)' }}>Pour les créatifs de <b>Touba et Mbacké.</b></div>
          <div style={{ position: 'relative', marginTop: 28 * s, height: 58 * s, borderRadius: 99, background: C.brand, color: C.paper, fontWeight: 800, fontSize: 17 * s, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.04em', transform: `scale(${1 - tapP * 0.06})`, boxShadow: '0 10px 15px -3px rgba(7,141,67,0.3)', overflow: 'hidden' }}>
            CANDIDATER MAINTENANT
            {t > c.tap && <span style={{ position: 'absolute', left: '50%', top: '50%', width: 30 * s, height: 30 * s, borderRadius: 99, background: 'rgba(255,255,255,0.45)', transform: `translate(-50%,-50%) scale(${1 + ripple * 14})`, opacity: 1 - ripple }} />}
          </div>
          <div style={{ marginTop: 12 * s, textAlign: 'center', fontSize: 13 * s, fontWeight: 600, color: C.brand }}>Formation 80 % gratuite</div>
          {t > c.tap - 0.6 && (
            <div style={{ position: 'absolute', left: '50%', top: 333 * s, width: 44 * s, height: 44 * s, borderRadius: 99, background: 'rgba(8,8,8,0.25)', border: `${3 * s}px solid rgba(255,255,255,0.9)`, transform: `translate(-50%,-50%) translate(${lerp(90, 0, prog(t, c.tap - 0.6, 0.5, EASE.out)) * s}px, ${lerp(120, 0, prog(t, c.tap - 0.6, 0.5, EASE.out)) * s}px) scale(${1 - tapP * 0.25})`, opacity: 1 - prog(t, c.tap + 0.25, 0.2) }} />
          )}
        </div>
      )}
      {screen === 'form' && (
        <div style={{ position: 'absolute', left: 18 * s, right: 18 * s, top: 100 * s, opacity: prog(t, c.tap + 0.45, 0.35) }}>
          <div style={{ fontSize: 11 * s, fontWeight: 700, letterSpacing: '0.16em', color: C.brand }}>CANDIDATURE · GRAPHIA</div>
          <div style={{ marginTop: 6 * s, fontSize: 24 * s, fontWeight: 900, lineHeight: 1.1 }}>Rejoignez les 50 talents de GRAPHIA</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 * s, marginTop: 12 * s }}>
            {['Environ 10 minutes', '80 % gratuit', 'Données protégées'].map((x) => (
              <span key={x} style={{ fontSize: 11 * s, fontWeight: 600, padding: `${5 * s}px ${10 * s}px`, borderRadius: 99, background: C.paper, boxShadow: '0 1px 3px rgba(8,8,8,0.12)' }}>{x}</span>
            ))}
          </div>
          <div style={{ marginTop: 18 * s, fontSize: 13 * s, fontWeight: 700 }}>
            <span style={{ color: C.brand }}>Étape {stepIdx + 1}</span> <span style={{ color: 'rgba(8,8,8,0.5)' }}>sur 6</span>
          </div>
          <div style={{ display: 'flex', gap: 4 * s, marginTop: 8 * s }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 7 * s, borderRadius: 9, background: i < stepIdx ? C.brand : i === stepIdx ? C.ink : C.mist }} />
            ))}
          </div>
          <div key={stepIdx} style={{ marginTop: 16 * s, borderRadius: 18 * s, border: '1px solid rgba(8,8,8,0.08)', background: C.paper, padding: 16 * s, boxShadow: '0 8px 24px -12px rgba(8,8,8,0.15)', opacity: stepP, transform: `translateY(${lerp(16, 0, stepP) * s}px)` }}>
            <div style={{ fontSize: 19 * s, fontWeight: 800 }}>{STEPS[stepIdx]}</div>
            {FIELDS[stepIdx].map((f, k) => {
              const fill = prog(t, c.steps[stepIdx] + 0.2 + k * 0.25, 0.5, EASE.out);
              return (
                <div key={f} style={{ marginTop: 12 * s }}>
                  <div style={{ fontSize: 12 * s, fontWeight: 600, lineHeight: 1.25 }}>{f}</div>
                  <div style={{ marginTop: 6 * s, height: 36 * s, borderRadius: 10 * s, border: `1.5px solid ${fill > 0.95 ? C.brand : 'rgba(8,8,8,0.15)'}`, display: 'flex', alignItems: 'center', padding: `0 ${10 * s}px` }}>
                    <div style={{ height: 8 * s, width: `${fill * (55 + k * 20)}%`, borderRadius: 9, background: 'rgba(8,8,8,0.18)' }} />
                    {fill > 0.95 && <Icon name="check" size={16 * s} color={C.brand} stroke={3} style={{ marginLeft: 'auto' }} />}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12 * s, display: 'flex', alignItems: 'center', gap: 6 * s, fontSize: 11 * s, fontWeight: 600, color: 'rgba(8,8,8,0.6)' }}>
            <Icon name="check" size={14 * s} color={C.brand} stroke={3} /> Vos réponses sont enregistrées automatiquement
          </div>
          <div style={{ marginTop: 14 * s, height: 50 * s, borderRadius: 99, background: C.ink, color: C.paper, fontWeight: 700, fontSize: 15 * s, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 * s }}>
            {stepIdx < 5 ? 'Continuer' : 'Envoyer ma candidature'} <Icon name="arrow" size={18 * s} color={C.paper} stroke={2.4} />
          </div>
        </div>
      )}
      {screen === 'done' && (
        <div style={{ position: 'absolute', left: 22 * s, right: 22 * s, top: 130 * s, textAlign: 'center' }}>
          <div style={{ margin: '0 auto', width: 110 * s, height: 110 * s, borderRadius: 99, background: C.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${doneP})`, boxShadow: '0 20px 40px -12px rgba(7,141,67,0.6)' }}>
            <Icon name="check" size={64 * s} color={C.paper} stroke={3} />
          </div>
          <div style={{ marginTop: 26 * s, fontSize: 26 * s, fontWeight: 900, lineHeight: 1.15, opacity: prog(t, c.done + 0.3, 0.4) }}>Félicitations !</div>
          <div style={{ marginTop: 8 * s, fontSize: 16 * s, fontWeight: 500, lineHeight: 1.35, color: 'rgba(8,8,8,0.7)', opacity: prog(t, c.done + 0.45, 0.4) }}>Votre candidature a bien été enregistrée.</div>
          <div style={{ marginTop: 26 * s, borderRadius: 16 * s, background: C.brand50, padding: 14 * s, textAlign: 'left', opacity: prog(t, c.select, 0.4) }}>
            {[
              ['learn', 'L’équipe étudie chaque dossier'],
              ['phone', '50 retenus contactés par téléphone ou WhatsApp'],
            ].map(([ic, txt], k) => (
              <div key={txt} style={{ display: 'flex', gap: 10 * s, alignItems: 'center', marginTop: k ? 10 * s : 0, fontSize: 14 * s, fontWeight: 600, opacity: prog(t, c.select + k * 0.5, 0.4) }}>
                <span style={{ width: 34 * s, height: 34 * s, flexShrink: 0, borderRadius: 99, background: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={20 * s} color={C.brand} stroke={2} />
                </span>
                {txt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const capBlock = (i: number, compact: boolean) => {
    const cap = CAPTIONS[i];
    const p = prog(t, c.caps[i], 0.5, EASE.out);
    const on = i === activeCap;
    return (
      <div key={i} style={{ display: 'flex', gap: 18 * u, alignItems: 'flex-start', opacity: Math.min(1, p * 2) * (on || compact ? 1 : 0.45), transform: `translateX(${lerp(-30, 0, p) * u}px)` }}>
        <span style={{ width: 54 * u, height: 54 * u, flexShrink: 0, borderRadius: 99, background: on ? C.brand : C.ink, color: C.paper, fontFamily: FONT, fontWeight: 800, fontSize: 24 * u, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cap.n}</span>
        <div style={{ fontFamily: FONT, lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, fontSize: (compact ? 30 : 28) * u, color: 'rgba(8,8,8,0.65)' }}>{cap.title}</div>
          <div style={{ fontWeight: 800, fontSize: (compact ? 38 : 36) * u, color: on ? C.brand : C.ink, letterSpacing: '-0.01em' }}>{cap.strong}</div>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: C.paper, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 900 * u, height: 900 * u, right: -200 * u, top: -200 * u, borderRadius: '50%', background: C.brand50, filter: `blur(${60 * u}px)` }} />
      <div style={{ position: 'absolute', width: 700 * u, height: 700 * u, left: -200 * u, bottom: -250 * u, borderRadius: '50%', background: 'rgba(245,229,0,0.16)', filter: `blur(${60 * u}px)` }} />
      {/* titre */}
      <div style={{ position: 'absolute', left: v ? 0 : 150 * u, right: v ? 0 : undefined, top: v ? 250 * u : 140 * u }}>
        <Kinetic text={"COMMENT CANDIDATER\u00A0?"} t={t} at={c.title} size={(v ? 68 : 78) * u} weight={900} color={C.ink} accent={{ 1: C.brand }} align={v ? 'center' : 'left'} mode="mask" stagger={0.1} />
      </div>
      {/* légendes */}
      {v ? (
        <div style={{ position: 'absolute', left: 90 * u, right: 90 * u, top: 370 * u, height: 130 * u }}>
          {activeCap >= 0 && <div key={activeCap}>{capBlock(activeCap, true)}</div>}
        </div>
      ) : (
        <div style={{ position: 'absolute', left: 150 * u, top: 300 * u, width: 820 * u, display: 'flex', flexDirection: 'column', gap: 44 * u }}>
          {CAPTIONS.map((_, i) => capBlock(i, false))}
        </div>
      )}
      {/* téléphone */}
      <div
        style={{
          position: 'absolute', left: v ? (W - phoneW) / 2 : W - 200 * u - phoneW, top: v ? 540 * u : (H - phoneW * 2.08) / 2 + 30 * u,
          transform: `perspective(1800px) rotateY(${lerp(v ? -12 : -22, -4, enter) + drift(t, 2, 1.5)}deg) rotateX(${lerp(14, 3, enter)}deg) translateY(${lerp(120, 0, enter) * u}px) scale(${lerp(0.94, 1.02, prog(t, 0, dur, [0.4, 0, 0.6, 1]))})`,
          opacity: Math.min(1, enter * 2),
        }}
      >
        <Phone w={phoneW}>{screenEl}</Phone>
      </div>
      <Grain frame={frame} opacity={0.03} />
      <PanelWipe p={outP} n={v ? 3 : 5} />
    </AbsoluteFill>
  );
};
