import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp, drift, mulberry32 } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Particles } from '../../components/Particles';
import { Grain, Vignette } from '../../components/Grain';
import { Chip, Cursor } from '../../components/DesignUI';
import { Icon } from '../../components/Icons';
import { Kinetic } from '../../typography/Kinetic';
import { Glitch } from '../../typography/Glitch';
import { Flash } from '../../transitions/Flash';
import { Tile } from './Tiles';
import { SceneProps } from '../types';

const PROMPT = 'Affiche pour un festival à Touba, style afro-futuriste, vert et jaune';
const TOOLS = ['move', 'pen', 'brush', 'type', 'wand', 'sparkle'];

/**
 * SCÈNE 05 — L'IA AU SERVICE DES CRÉATIFS. Plan : interface d'atelier ORIGINALE (aucune fonction
 * attribuée à un logiciel réel), en légère orbite 3D qui se redresse (dolly-in). Prompt → génération →
 * retouche → workflow. Puis la fenêtre recule dans le noir et la typographie prend le relais, sur le temps.
 */
export const Scene05AI: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, u } = useFormat();
  const short = !!cues.short;

  const enter = prog(t, 0, short ? 0.7 : 1.2, EASE.out);
  const recede = prog(t, short ? cues.line2[0] - 0.4 : cues.line1 - 0.3, 0.7, EASE.inOut);
  const orbit = lerp(v ? -10 : -16, 0, prog(t, 0, short ? 1.5 : 3, EASE.out)) + drift(t, 3, 1.2);
  const tilt = lerp(10, 3, enter);

  const winW = v ? 900 * u : 1320 * u;
  const winH = v ? 980 * u : 720 * u;
  const typeDur = short ? 0.75 : 1.8;
  const nChars = Math.floor(PROMPT.length * prog(t, cues.prompt, typeDur, [0.25, 0, 0.75, 1]));
  const caret = Math.floor(t * 2.5) % 2 === 0;
  const genP = (i: number) => prog(t, cues.gen + i * (short ? 0.12 : 0.22), short ? 0.8 : 1.1, [0.4, 0, 0.2, 1]);
  const retouch = prog(t, cues.retouch, 1.0, EASE.inOut);
  const flow = prog(t, cues.workflow, 0.9, EASE.out);
  const glitchIn = Math.max(0, 1 - t / 0.2);

  const rail = 84 * u;
  const panel = v ? 0 : 300 * u;
  const canvasW = winW - rail - panel - 40 * u;
  const tileGap = 18 * u;
  const gridTop = 130 * u;
  const tileS = v ? (canvasW - tileGap) / 2 : Math.min((canvasW - tileGap) / 2, (winH - gridTop - 120 * u - tileGap) / 2);

  // positions : hors de la fenêtre (et, en vertical, au-dessus d'elle : zone sûre des applis)
  const chips: { label: string; at: number; pos: React.CSSProperties }[] = [
    { label: 'Prompt engineering', at: cues.prompt + 0.4, pos: v ? { left: 90 * u, top: 262 * u } : { left: 150 * u, top: 92 * u } },
    { label: "Génération d'images", at: cues.gen + 0.2, pos: v ? { right: 90 * u, top: 262 * u } : { right: 150 * u, top: 92 * u } },
    { label: 'Création de visuels', at: cues.gen + 0.9, pos: v ? { left: 90 * u, top: 334 * u } : { left: 150 * u, top: 935 * u } },
    { label: 'Retouche assistée', at: cues.retouch + 0.2, pos: v ? { right: 90 * u, top: 334 * u } : { right: 150 * u, top: 935 * u } },
    { label: 'Workflows optimisés', at: cues.workflow + 0.2, pos: v ? { left: W / 2, top: 398 * u, transform: 'translateX(-50%)' } : { left: W / 2, top: 935 * u, transform: 'translateX(-50%)' } },
  ];

  const l2: number[] = cues.line2;
  const words = ['INNOVEZ.', 'EXPÉRIMENTEZ.', 'CRÉEZ.'];
  const outFlash = cues.out;

  return (
    <AbsoluteFill style={{ background: C.ink, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 55%, rgba(7,141,67,0.35), rgba(8,8,8,0) 70%)` }} />
      <Particles t={t + 20} count={v ? 50 : 70} seed={21} colors={[C.brand, C.sun, '#ffffff']} opacity={0.8} push={recede * 0.6} />

      {/* fenêtre d'atelier */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', perspective: 2200 }}>
        <Glitch
          amount={glitchIn}
          frame={frame}
          render={(col) => (
            <div
              style={{
                width: winW, height: winH, borderRadius: 22 * u, background: col ? col : '#121212', border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 60px 120px -40px rgba(0,0,0,0.9), 0 0 0 1px rgba(7,141,67,0.25), 0 0 80px -20px rgba(7,141,67,0.45)',
                transform: `rotateY(${orbit}deg) rotateX(${tilt}deg) scale(${lerp(0.9, 1, enter) * lerp(1, 0.72, recede)}) translateY(${lerp(80, 0, enter)}px)`,
                filter: `blur(${recede * 10}px) brightness(${1 - recede * 0.55})`, opacity: Math.min(1, enter * 1.5), overflow: 'hidden', position: 'relative',
              }}
            >
              {!col && (
                <>
                  {/* barre de titre */}
                  <div style={{ height: 56 * u, display: 'flex', alignItems: 'center', gap: 10 * u, padding: `0 ${22 * u}px`, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['#3a3a3a', '#3a3a3a', '#3a3a3a'].map((c, i) => <span key={i} style={{ width: 14 * u, height: 14 * u, borderRadius: 99, background: c }} />)}
                    <span style={{ marginLeft: 16 * u, fontFamily: FONT, fontWeight: 600, fontSize: 20 * u, color: 'rgba(255,255,255,0.7)' }}>Atelier IA · Jour 3</span>
                    <span style={{ marginLeft: 'auto', fontFamily: FONT, fontWeight: 700, fontSize: 18 * u, color: C.sun, letterSpacing: '0.12em' }}>GRAPHIA</span>
                  </div>
                  {/* rail d'outils */}
                  <div style={{ position: 'absolute', left: 0, top: 56 * u, bottom: 0, width: rail, borderRight: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * u, paddingTop: 22 * u }}>
                    {TOOLS.map((n, i) => {
                      const on = n === 'sparkle' ? t > cues.prompt - 0.2 && t < cues.retouch : n === 'brush' && t >= cues.retouch && t < cues.workflow;
                      return (
                        <div key={n} style={{ width: 52 * u, height: 52 * u, borderRadius: 12 * u, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? C.brand : 'transparent', opacity: prog(t, 0.2 + i * 0.06, 0.4) }}>
                          <Icon name={n} size={28 * u} color={on ? C.paper : 'rgba(255,255,255,0.65)'} />
                        </div>
                      );
                    })}
                  </div>
                  {/* zone de travail */}
                  <div style={{ position: 'absolute', left: rail + 20 * u, top: 56 * u + 20 * u, width: canvasW }}>
                    <div style={{ height: 72 * u, borderRadius: 999, border: `1.5px solid ${t > cues.prompt - 0.1 ? 'rgba(7,141,67,0.9)' : 'rgba(255,255,255,0.15)'}`, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 14 * u, padding: `0 ${10 * u}px 0 ${24 * u}px` }}>
                      <Icon name="sparkle" size={30 * u} color={C.sun} />
                      <div style={{ flex: 1, fontFamily: FONT, fontWeight: 500, fontSize: (v ? 22 : 24) * u, color: C.paper, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'clip', direction: 'rtl', textAlign: 'left' }}>
                        <span style={{ direction: 'ltr', unicodeBidi: 'bidi-override' }}>
                          {nChars === 0 ? <span style={{ color: 'rgba(255,255,255,0.35)' }}>Décrivez votre idée…</span> : PROMPT.slice(0, nChars)}
                          {caret && t < cues.gen ? <span style={{ color: C.sun }}>|</span> : null}
                        </span>
                      </div>
                      <div style={{ height: 52 * u, padding: `0 ${24 * u}px`, borderRadius: 999, background: C.brand, color: C.paper, fontFamily: FONT, fontWeight: 700, fontSize: 21 * u, display: 'flex', alignItems: 'center', gap: 8 * u, transform: `scale(${1 - 0.08 * (prog(t, cues.gen - 0.2, 0.08) - prog(t, cues.gen - 0.1, 0.12))})` }}>
                        Générer <Icon name="arrow" size={22 * u} color={C.paper} stroke={2.4} />
                      </div>
                    </div>
                    {/* grille de résultats */}
                    <div style={{ marginTop: 30 * u, display: 'grid', justifyContent: 'center', gridTemplateColumns: `repeat(2, ${tileS}px)`, gap: tileGap }}>
                      {[0, 1, 2, 3].map((i) => {
                        const g = genP(i);
                        const r = mulberry32(i + 1);
                        const pix = Math.max(1, Math.round(lerp(24, 1, g)));
                        return (
                          <div key={i} style={{ width: tileS, height: tileS, borderRadius: 14 * u, overflow: 'hidden', position: 'relative', background: '#1d1d1d', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {g > 0 && (
                              <div style={{ position: 'absolute', inset: 0, opacity: Math.min(1, g * 1.6), filter: `blur(${lerp(18, 0, g)}px)`, transform: `scale(${lerp(1.15, 1, g)})` }}>
                                <Tile i={i} s={tileS} t={t} enhanced={i === 0 ? retouch : 0} />
                              </div>
                            )}
                            {g > 0 && g < 1 && (
                              <>
                                <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(8,8,8,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(8,8,8,0.6) 1px, transparent 1px)`, backgroundSize: `${pix * 2 * u}px ${pix * 2 * u}px`, opacity: 1 - g }} />
                                <div style={{ position: 'absolute', left: 0, right: 0, top: `${g * 100}%`, height: 3 * u, background: C.sun, boxShadow: `0 0 20px ${C.sun}` }} />
                              </>
                            )}
                            {g === 0 && t > cues.gen - 0.2 && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)`, transform: `translateX(${((t * 1.5 + r()) % 1) * 200 - 100}%)` }} />}
                            {i === 0 && retouch > 0 && retouch < 1 && <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${retouch * 100}%`, width: 3 * u, background: C.paper, boxShadow: '0 0 12px rgba(255,255,255,0.9)' }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* panneau calques / workflow (horizontal seulement) */}
                  {!v && (
                    <div style={{ position: 'absolute', right: 0, top: 56 * u, bottom: 0, width: panel, borderLeft: '1px solid rgba(255,255,255,0.08)', padding: 22 * u, fontFamily: FONT }}>
                      <div style={{ fontWeight: 700, fontSize: 17 * u, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)', marginBottom: 16 * u }}>CALQUES</div>
                      {['Titre', 'Motif', 'Soleil', 'Fond'].map((n, i) => (
                        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 * u, height: 50 * u, padding: `0 ${12 * u}px`, borderRadius: 10 * u, marginBottom: 8 * u, background: i === 2 && retouch > 0 ? 'rgba(7,141,67,0.35)' : 'rgba(255,255,255,0.04)', opacity: prog(t, cues.gen + 0.6 + i * 0.12, 0.4) }}>
                          <span style={{ width: 26 * u, height: 26 * u, borderRadius: 6 * u, background: [C.paper, C.sunLogo, C.sun, C.brand][i] }} />
                          <span style={{ fontWeight: 500, fontSize: 19 * u, color: C.paper }}>{n}</span>
                        </div>
                      ))}
                      <div style={{ fontWeight: 700, fontSize: 17 * u, letterSpacing: '0.16em', color: 'rgba(255,255,255,0.5)', margin: `${30 * u}px 0 14 ${0}px` }}>WORKFLOW</div>
                      {['Brief', 'Prompt', 'Création', 'Export'].map((n, i) => {
                        const k = prog(flow, i * 0.2, 0.3);
                        return (
                          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12 * u, height: 44 * u, marginTop: 6 * u }}>
                            <span style={{ width: 26 * u, height: 26 * u, borderRadius: 99, border: `2px solid ${k > 0.5 ? C.brand : 'rgba(255,255,255,0.25)'}`, background: k > 0.5 ? C.brand : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {k > 0.5 && <Icon name="check" size={16 * u} color={C.paper} stroke={3} />}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: 20 * u, color: k > 0.5 ? C.paper : 'rgba(255,255,255,0.45)' }}>{n}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* pinceau de retouche */}
                  {retouch > 0 && retouch < 1 && (
                    <Cursor x={rail + 20 * u + retouch * tileS} y={56 * u + 20 * u + 102 * u + tileS * (0.3 + 0.4 * Math.sin(retouch * Math.PI))} scale={u * 1.3} />
                  )}
                </>
              )}
            </div>
          )}
        />
      </AbsoluteFill>

      {/* usages de l'IA */}
      {chips.map((c) => (
        <div key={c.label} style={{ position: 'absolute', ...c.pos, opacity: 1 - recede }}>
          <Chip p={prog(t, c.at, 0.6, EASE.out)} dark size={(v ? 28 : 26) * u} dot={C.sun}>
            {c.label}
          </Chip>
        </div>
      ))}

      {/* typographie */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: `0 ${v ? 90 : 140}px` }}>
        {!short && t < l2[0] - 0.05 && (
          <Kinetic text={'APPRENEZ À CRÉER AUTREMENT.'} t={t} at={cues.line1} size={(v ? 112 : 112) * u} weight={900} color={C.paper} accent={{ 3: C.sun }} mode="rise" stagger={0.09} maxWidth={v ? 880 * u : 1600 * u} outAt={l2[0] - 0.4} />
        )}
        {t >= l2[0] - 0.05 && (
          <div style={{ display: 'flex', flexDirection: v ? 'column' : 'row', alignItems: 'center', gap: v ? 6 * u : 34 * u }}>
            {words.map((w, i) => {
              const p = prog(t, l2[i], 0.35, EASE.out);
              const g = Math.max(0, 1 - Math.abs(t - l2[i] - 0.03) / 0.1);
              return (
                <div key={w} style={{ opacity: Math.min(1, p * 3), transform: `scale(${lerp(1.5, 1, p)})`, filter: `blur(${lerp(12, 0, Math.min(1, p * 1.5))}px)` }}>
                  <Glitch
                    amount={g * 0.7}
                    frame={frame}
                    render={(col) => (
                      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: (v ? 128 : 100) * u, letterSpacing: '-0.03em', lineHeight: 1.05, color: col ?? (i === 2 ? C.sun : C.paper) }}>{w}</div>
                    )}
                  />
                </div>
              );
            })}
          </div>
        )}
      </AbsoluteFill>
      <Vignette strength={0.6} />
      <Grain frame={frame} opacity={0.06} />
      <Flash t={t} at={outFlash} dur={dur - outFlash + 0.01} color={C.paper} max={1} />
    </AbsoluteFill>
  );
};
