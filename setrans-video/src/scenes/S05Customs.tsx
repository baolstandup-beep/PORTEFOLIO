import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS, FONTS, TEXTS } from '../config/setrans.config';
import { Clip, Label } from '../components/Base';
import { Icon, IconName } from '../components/Icons';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

const STEP_ICONS: IconName[] = ['folder', 'search', 'check', 'stamp'];

/** SCÈNE 05 — Univers administratif & douanier : DOSSIER → CONTRÔLE → VALIDATION → AUTORISATION. */
export const S05Customs: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const panel = progress(f, 0, 0.9, EASE.out);
  const x = 1080;
  const top = 250;
  const gap = 150;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      <AbsoluteFill style={{ width: 1200 }}>
        <Clip src={ASSETS.clips.documents} zoomFrom={1.05} zoomTo={1.12} dim={0.2} />
      </AbsoluteFill>
      {/* Panneau bleu SETRANS */}
      <AbsoluteFill
        style={{
          left: 1920 - 1000 * panel,
          width: 1000,
          background: `linear-gradient(90deg, rgba(11,26,58,0) 0%, ${COLORS.navy} 22%, ${COLORS.navy} 100%)`,
        }}
      />
      {/* Ligne verticale de progression */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <line x1={x + 36} y1={top + 36} x2={x + 36} y2={top + 36 + gap * 3} stroke={COLORS.white} strokeOpacity={0.12} strokeWidth={2} />
        <line
          x1={x + 36}
          y1={top + 36}
          x2={x + 36}
          y2={top + 36 + gap * 3 * progress(f, 0.7, 4.3, EASE.inOut)}
          stroke={COLORS.blueGlow}
          strokeWidth={2}
        />
      </svg>
      {TEXTS.customs.map((label, i) => {
        const t = progress(f, 0.7 + i * 1.1, 1.4 + i * 1.1, EASE.out);
        const active = progress(f, 1.1 + i * 1.1, 1.5 + i * 1.1, EASE.soft);
        return (
          <div
            key={label}
            style={{
              position: 'absolute',
              left: x,
              top: top + i * gap,
              display: 'flex',
              alignItems: 'center',
              gap: 36,
              opacity: 0.25 + 0.75 * t,
              transform: `translateX(${(1 - t) * 40}px)`,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                border: `2px solid ${active > 0.5 ? COLORS.blueGlow : 'rgba(255,255,255,0.25)'}`,
                backgroundColor: `rgba(28,63,136,${active})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: active > 0.5 ? `0 0 30px rgba(127,162,232,${0.35 * active})` : 'none',
              }}
            >
              <Icon name={STEP_ICONS[i]} size={38} color={COLORS.white} draw={t} />
            </div>
            <div>
              <Label size={34} weight={700} spacing="0.18em">
                {label}
              </Label>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 18,
                  color: COLORS.grey,
                  marginTop: 6,
                  letterSpacing: '0.08em',
                  opacity: active,
                }}
              >
                {['Réception des pièces', 'Vérification conforme', 'Dossier validé', 'Mainlevée accordée'][i]}
              </div>
            </div>
          </div>
        );
      })}
      {/* Sceau de sécurité final */}
      <div
        style={{
          position: 'absolute',
          left: 1600,
          top: top + gap * 3 - 4,
          opacity: progress(f, 4.6, 5.2, EASE.out),
          transform: `scale(${0.8 + 0.2 * progress(f, 4.6, 5.2, EASE.out)})`,
        }}
      >
        <Icon name="customs" size={80} color={COLORS.blueGlow} strokeWidth={1.4} draw={progress(f, 4.6, 5.4)} />
      </div>
    </AbsoluteFill>
  );
};
