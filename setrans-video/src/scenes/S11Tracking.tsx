import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS, FONTS, TEXTS } from '../config/setrans.config';
import { Clip } from '../components/Base';
import { Icon } from '../components/Icons';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

/** SCÈNE 11 — Interface de suivi logistique (fictive, réaliste). */
export const S11Tracking: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const card = progress(f, 0.1, 1.0, EASE.out);
  const steps = TEXTS.tracking;
  const n = steps.length;
  const stepAt = (i: number) => 1.0 + i * 0.85;
  const bar = progress(f, stepAt(0), stepAt(n - 1), EASE.inOut);
  const current = steps.reduce((acc, _s, i) => (f / 30 >= stepAt(i) ? i : acc), 0);
  const W = 1240;
  const H = 600;
  const pad = 70;
  const trackPad = 150; // marge pour les libellés des extrémités
  const trackW = W - trackPad * 2;
  return (
    <AbsoluteFill>
      <Clip src={ASSETS.clips.office} zoomFrom={1.06} zoomTo={1.12} dim={0.55} blur={5} tint={0.3} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: W,
            height: H,
            borderRadius: 24,
            backgroundColor: 'rgba(255,255,255,0.97)',
            boxShadow: '0 40px 120px rgba(3,7,18,0.55)',
            opacity: card,
            transform: `translateY(${(1 - card) * 50}px) scale(${0.97 + 0.03 * card})`,
            fontFamily: FONTS.body,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* En-tête */}
          <div
            style={{
              height: 96,
              backgroundColor: COLORS.navy,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `0 ${pad}px`,
            }}
          >
            <div style={{ fontFamily: FONTS.title, fontWeight: 800, fontSize: 30, letterSpacing: '0.2em', color: COLORS.white }}>
              {TEXTS.brand}
              <span style={{ fontWeight: 400, fontSize: 20, letterSpacing: '0.15em', color: COLORS.blueGlow, marginLeft: 22 }}>
                SUIVI
              </span>
            </div>
            <div style={{ color: COLORS.greyLight, fontSize: 20, letterSpacing: '0.08em' }}>
              Réf. <b style={{ color: COLORS.white }}>{TEXTS.trackingRef}</b>
            </div>
          </div>
          {/* Ligne d'itinéraire */}
          <div style={{ padding: `44px ${pad}px 0`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: FONTS.title, fontSize: 34, fontWeight: 700, color: COLORS.navy, letterSpacing: '0.1em' }}>
              {TEXTS.trackingRoute}
            </div>
            <div style={{ fontSize: 20, color: COLORS.greyDark }}>
              Conteneur 40′ · <span style={{ color: COLORS.blue, fontWeight: 600 }}>Scellé n° 0084217</span>
            </div>
          </div>
          {/* Barre de statut */}
          <div style={{ position: 'absolute', left: trackPad, top: 290, width: trackW }}>
            <div style={{ height: 4, borderRadius: 2, backgroundColor: COLORS.greyLight }} />
            <div style={{ position: 'absolute', top: 0, height: 4, borderRadius: 2, width: trackW * bar, backgroundColor: COLORS.blue }} />
            {steps.map((label, i) => {
              const on = progress(f, stepAt(i) - 0.1, stepAt(i) + 0.3, EASE.out);
              const x = (trackW / (n - 1)) * i;
              return (
                <div key={label} style={{ position: 'absolute', left: x - 110, top: -26, width: 220, textAlign: 'center' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      margin: '0 auto',
                      backgroundColor: on > 0.5 ? COLORS.blue : COLORS.white,
                      border: `3px solid ${on > 0.05 ? COLORS.blue : COLORS.greyLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: `scale(${0.9 + 0.1 * on})`,
                    }}
                  >
                    <svg width={26} height={26} viewBox="0 0 26 26">
                      <path
                        d="M5 13.5 L10.5 19 L21 7.5"
                        fill="none"
                        stroke={COLORS.white}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength={1}
                        strokeDasharray={1}
                        strokeDashoffset={1 - on}
                      />
                    </svg>
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      fontFamily: FONTS.title,
                      fontSize: 19,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      color: on > 0.3 ? COLORS.navy : COLORS.grey,
                    }}
                  >
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Statut courant */}
          <div
            style={{
              position: 'absolute',
              left: pad,
              right: pad,
              bottom: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${COLORS.greyLight}`,
              paddingTop: 34,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <Icon name={current >= n - 1 ? 'check' : 'truck'} size={46} color={COLORS.blue} strokeWidth={2} />
              <div>
                <div style={{ fontSize: 16, color: COLORS.grey, letterSpacing: '0.14em' }}>STATUT</div>
                <div style={{ fontFamily: FONTS.title, fontSize: 30, fontWeight: 800, color: COLORS.blue, letterSpacing: '0.08em' }}>
                  {steps[current]}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, color: COLORS.grey, letterSpacing: '0.14em' }}>PROGRESSION</div>
              <div style={{ fontFamily: FONTS.title, fontSize: 30, fontWeight: 800, color: COLORS.navy }}>
                {Math.round(bar * 100)} %
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
