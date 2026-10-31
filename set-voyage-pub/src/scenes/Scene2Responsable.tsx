import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MEDIAS, RESPONSABLE, SCENES } from '../config';
import { Sky } from '../components/Sky';
import { CircularPortrait } from '../components/Media';
import { Badge, RevealWords } from '../components/Text';
import { clamp, springIn } from '../lib/anim';
import { COULEURS, FONTS } from '../theme';

const D = SCENES.responsable;

export const Scene2Responsable: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Caméra : léger travelling vertical + parallaxe différenciée par plan.
  const drift = interpolate(frame, [0, D], [40, -40], clamp);
  const shape = springIn(frame, fps, 0, { damping: 30 });
  const quote = springIn(frame, fps, 70);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Sky drift={0.5} sun={{ x: 900, y: 200 }} layers={[0, 1]} cloudOpacity={0.8} />

      {/* Formes graphiques (plan arrière, parallaxe lente) */}
      <AbsoluteFill style={{ transform: `translateY(${drift * 0.4}px)` }}>
        <div
          style={{
            position: 'absolute',
            left: -300,
            top: 1060,
            width: 1800,
            height: 1400,
            background: `linear-gradient(160deg, ${COULEURS.bleu} 0%, ${COULEURS.bleuNuit} 100%)`,
            transform: `rotate(-12deg) translateY(${(1 - shape) * 900}px)`,
            boxShadow: '0 -20px 60px rgba(6,26,64,0.3)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: -300,
            top: 1030,
            width: 1800,
            height: 22,
            background: COULEURS.jaune,
            transform: `rotate(-12deg) translateX(${(1 - shape) * -1900}px)`,
          }}
        />
      </AbsoluteFill>

      {/* Portrait (plan médian) */}
      <AbsoluteFill style={{ alignItems: 'center', top: 170, transform: `translateY(${drift * 0.8}px)` }}>
        <CircularPortrait src={MEDIAS.portrait} size={600} delay={6} objectPosition={RESPONSABLE.cadrage} zoom={RESPONSABLE.zoom} />
      </AbsoluteFill>

      {/* Textes (premier plan) */}
      <AbsoluteFill style={{ top: 1110, paddingLeft: 90, paddingRight: 90, transform: `translateY(${drift}px)` }}>
        <Badge delay={30} bg={COULEURS.jaune} color={COULEURS.bleuNuit} size={30}>
          Votre conseiller
        </Badge>
        <div style={{ height: 26 }} />
        <RevealWords text={RESPONSABLE.nom} delay={38} size={92} />
        <div
          style={{
            marginTop: 14,
            fontFamily: FONTS.texte,
            fontWeight: 600,
            fontSize: 42,
            color: COULEURS.jauneClair,
            opacity: springIn(frame, fps, 55),
          }}
        >
          {RESPONSABLE.fonction} · SET VOYAGE
        </div>
        <div
          style={{
            marginTop: 50,
            paddingLeft: 30,
            borderLeft: `6px solid ${COULEURS.rouge}`,
            fontFamily: FONTS.texte,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 44,
            lineHeight: 1.35,
            color: '#fff',
            opacity: interpolate(quote, [0, 1], [0, 1], clamp),
            transform: `translateX(${(1 - quote) * 60}px)`,
          }}
        >
          {RESPONSABLE.citation}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
