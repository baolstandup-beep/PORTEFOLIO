import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { AGENCE, DESTINATIONS, MEDIAS, SCENES, SERVICES } from '../config';
import { KenBurns } from '../components/Media';
import { ICONES } from '../components/Icons';
import { RevealWords } from '../components/Text';
import { clamp, springIn, springPop } from '../lib/anim';
import { COULEURS, FONTS } from '../theme';

const D = SCENES.services;

/** Carte d'embarquement stylisée qui bascule en 3D. */
const BoardingPass: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, delay, { damping: 18, stiffness: 80 });
  const float = Math.sin(frame / 18) * 8;
  const code = (s: string) => s.slice(0, 3).toUpperCase();
  return (
    <div style={{ perspective: 1600 }}>
      <div
        style={{
          width: 820,
          height: 300,
          borderRadius: 34,
          background: '#fff',
          boxShadow: '0 40px 90px rgba(6,26,64,0.45)',
          display: 'flex',
          overflow: 'hidden',
          transform: `rotateX(${(1 - p) * 75}deg) rotateZ(${(1 - p) * -8 - 3}deg) translateY(${(1 - p) * 300 + float}px)`,
          opacity: interpolate(p, [0, 0.2], [0, 1], clamp),
        }}
      >
        <div style={{ flex: 1, padding: '34px 44px', fontFamily: FONTS.titre, color: COULEURS.bleuNuit }}>
          <div style={{ fontFamily: FONTS.texte, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: COULEURS.bleu }}>CARTE D'EMBARQUEMENT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginTop: 22 }}>
            <div>
              <div style={{ fontSize: 86, fontWeight: 900, lineHeight: 1 }}>{code(AGENCE.villeDepart)}</div>
              <div style={{ fontFamily: FONTS.texte, fontSize: 24, opacity: 0.6 }}>{AGENCE.villeDepart}</div>
            </div>
            <svg width={120} height={40} viewBox="0 0 120 40">
              <path d="M0 20 H96" stroke={COULEURS.jaune} strokeWidth={4} strokeDasharray="6 8" strokeDashoffset={-frame} />
              <path d="M96 8 L118 20 L96 32Z" fill={COULEURS.rouge} />
            </svg>
            <div>
              <div style={{ fontSize: 86, fontWeight: 900, lineHeight: 1 }}>{code(DESTINATIONS[0].ville)}</div>
              <div style={{ fontFamily: FONTS.texte, fontSize: 24, opacity: 0.6 }}>{DESTINATIONS[0].ville}</div>
            </div>
          </div>
        </div>
        <div style={{ width: 0, borderLeft: '4px dashed #c8d4e3', margin: '24px 0' }} />
        <div style={{ width: 200, background: COULEURS.jaune, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontFamily: FONTS.texte, fontWeight: 700, fontSize: 22, color: COULEURS.bleuNuit, letterSpacing: 3 }}>SIÈGE</div>
          <div style={{ fontFamily: FONTS.titre, fontWeight: 900, fontSize: 64, color: COULEURS.bleuNuit }}>12A</div>
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{ i: number; icone: string; titre: string; detail: string }> = ({ i, icone, titre, detail }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 38 + i * 10;
  const p = springIn(frame, fps, delay);
  const pop = springPop(frame, fps, delay + 6);
  const Icon = ICONES[icone];
  const accents = [COULEURS.bleu, COULEURS.jaune, COULEURS.rouge, COULEURS.bleuNuit];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        padding: '26px 34px',
        borderRadius: 30,
        background: 'rgba(255,255,255,0.97)',
        boxShadow: '0 18px 40px rgba(6,26,64,0.18)',
        transform: `translateX(${(1 - p) * (i % 2 ? 900 : -900)}px)`,
        opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
      }}
    >
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: 28,
          background: accents[i % 4],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${pop}) rotate(${(1 - pop) * -40}deg)`,
          flexShrink: 0,
        }}
      >
        <Icon size={58} color={accents[i % 4] === COULEURS.jaune ? COULEURS.bleuNuit : '#fff'} />
      </div>
      <div>
        <div style={{ fontFamily: FONTS.titre, fontWeight: 800, fontSize: 46, color: COULEURS.bleuNuit }}>{titre}</div>
        <div style={{ fontFamily: FONTS.texte, fontWeight: 500, fontSize: 32, color: '#4a5c78', marginTop: 4 }}>{detail}</div>
      </div>
    </div>
  );
};

export const Scene3Services: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const photoIn = springIn(frame, fps, 0, { damping: 30 });
  const cam = interpolate(frame, [0, D], [0, -60], clamp);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COULEURS.cielClair} 0%, #ffffff 100%)`, overflow: 'hidden' }}>
      {/* Photo en haut, découpée en diagonale, avec son propre mouvement */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          height: 900,
          clipPath: `polygon(0 0, 100% 0, 100% ${78 + (1 - photoIn) * -78}%, 0 ${100 + (1 - photoIn) * -100}%)`,
        }}
      >
        <KenBurns src={MEDIAS.photos.voyageurTelephone} duration={D} from={{ scale: 1.3, x: 40, y: 0 }} to={{ scale: 1.1, x: -40, y: 20 }} position="50% 30%" />
        <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(10,42,94,0.55) 0%, rgba(10,42,94,0.1) 45%, rgba(10,42,94,0.65) 100%)` }} />
      </div>

      <AbsoluteFill style={{ padding: '120px 80px 0', transform: `translateY(${cam * 0.3}px)` }}>
        <RevealWords text="Réservez vos billets d’avion" delay={10} size={98} highlight={{ words: ['billets'], color: COULEURS.jaune }} />
      </AbsoluteFill>

      <AbsoluteFill style={{ top: 520, alignItems: 'center', transform: `translateY(${cam * 0.6}px)` }}>
        <BoardingPass delay={28} />
      </AbsoluteFill>

      <AbsoluteFill style={{ top: 960, padding: '0 70px', display: 'flex', flexDirection: 'column', gap: 26, transform: `translateY(${cam}px)` }}>
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.titre} i={i} {...s} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
