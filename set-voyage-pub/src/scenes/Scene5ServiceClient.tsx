import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { AVANTAGES, MEDIAS, SCENES } from '../config';
import { KenBurns } from '../components/Media';
import { DrawCheck, IconCasque } from '../components/Icons';
import { Badge, RevealWords } from '../components/Text';
import { clamp, springIn, springPop } from '../lib/anim';
import { COULEURS, FONTS } from '../theme';

const D = SCENES.serviceClient;

const Avantage: React.FC<{ i: number; texte: string }> = ({ i, texte }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = 60 + i * 14;
  const p = springIn(frame, fps, delay);
  const pop = springPop(frame, fps, delay);
  const check = interpolate(frame, [delay + 6, delay + 22], [0, 1], clamp);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28, opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          background: COULEURS.jaune,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${pop})`,
          flexShrink: 0,
        }}
      >
        <DrawCheck progress={check} size={42} color={COULEURS.bleuNuit} />
      </div>
      <span style={{ fontFamily: FONTS.texte, fontWeight: 600, fontSize: 44, color: '#fff' }}>{texte}</span>
    </div>
  );
};

export const Scene5ServiceClient: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = springIn(frame, fps, 0, { damping: 22 });
  const bubble = springPop(frame, fps, 30);
  const cam = interpolate(frame, [0, D], [30, -30], clamp);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${COULEURS.bleu} 0%, ${COULEURS.bleuNuit} 70%)`, overflow: 'hidden' }}>
      {/* Cercles décoratifs (parallaxe arrière) */}
      <div style={{ position: 'absolute', right: -260, top: 900 + cam * 2, width: 700, height: 700, borderRadius: '50%', border: `40px solid ${COULEURS.jaune}22` }} />
      <div style={{ position: 'absolute', left: -200, bottom: -200 - cam * 2, width: 520, height: 520, borderRadius: '50%', background: `${COULEURS.rouge}22` }} />

      {/* Photo en carte arrondie */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 110 + cam,
          width: 940,
          height: 760,
          borderRadius: 50,
          overflow: 'hidden',
          boxShadow: '0 40px 90px rgba(0,0,0,0.4)',
          transform: `scale(${0.85 + 0.15 * card}) rotate(${(1 - card) * 6}deg)`,
          opacity: card,
        }}
      >
        <KenBurns src={MEDIAS.photos.familleBillets} duration={D} from={{ scale: 1.25, x: 0, y: 20 }} to={{ scale: 1.08, x: -20, y: 0 }} position="55% 30%" />
      </div>

      {/* Bulle « service client » */}
      <div
        style={{
          position: 'absolute',
          right: 60,
          top: 760 + cam,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '22px 34px',
          borderRadius: '40px 40px 8px 40px',
          background: '#fff',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          transform: `scale(${bubble})`,
          transformOrigin: 'bottom right',
        }}
      >
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: COULEURS.rouge, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconCasque size={40} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: FONTS.titre, fontWeight: 800, fontSize: 36, color: COULEURS.bleuNuit }}>Service client</div>
          <div style={{ fontFamily: FONTS.texte, fontWeight: 600, fontSize: 28, color: COULEURS.bleu, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: '#2BC46B', opacity: 0.6 + 0.4 * Math.sin(frame / 5) }} />
            Disponible pour vous
          </div>
        </div>
      </div>

      <AbsoluteFill style={{ top: 960, padding: '0 80px' }}>
        <Badge delay={20} bg={COULEURS.rouge} color="#fff" size={28}>
          Nos avantages
        </Badge>
        <div style={{ height: 24 }} />
        <RevealWords text="Toujours à vos côtés" delay={28} size={88} highlight={{ words: ['côtés'], color: COULEURS.jaune }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30, marginTop: 44 }}>
          {AVANTAGES.map((a, i) => (
            <Avantage key={a} i={i} texte={a} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
