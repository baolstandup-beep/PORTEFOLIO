import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { AUDIO, DUREE_TOTALE, VOIX_OFF } from '../config';
import { clamp, springIn } from '../lib/anim';
import { COULEURS, FONTS } from '../theme';

/** Vrai si une réplique de voix off est en cours à cette frame. */
const voixActive = (f: number) => VOIX_OFF.some((r) => r.fichier && f >= r.debut && f < r.debut + r.duree);

/**
 * Musique de fond (fondu entrée/sortie + ducking sous la voix)
 * et répliques de voix off calées sur la timeline (config.VOIX_OFF).
 */
export const AudioLayer: React.FC = () => {
  return (
    <>
      {AUDIO.musique && (
        <Audio
          src={staticFile(AUDIO.musique)}
          volume={(f) => {
            const fade = interpolate(f, [0, 20, DUREE_TOTALE - 45, DUREE_TOTALE], [0, 1, 1, 0], clamp);
            const base = voixActive(f) ? AUDIO.volumeMusiqueSousVoix : AUDIO.volumeMusique;
            return base * fade;
          }}
        />
      )}
      {VOIX_OFF.filter((r) => r.fichier).map((r, i) => (
        <Sequence key={i} from={r.debut} durationInFrames={r.duree + 30} name={`Voix ${i + 1}`}>
          <Audio src={staticFile(r.fichier!)} />
        </Sequence>
      ))}
    </>
  );
};

const SousTitre: React.FC<{ texte: string; duree: number }> = ({ texte, duree }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = springIn(frame, fps, 0);
  const out = interpolate(frame, [duree - 8, duree], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150 }}>
      <div
        style={{
          maxWidth: 900,
          padding: '18px 30px',
          borderRadius: 22,
          background: 'rgba(8, 24, 52, 0.62)',
          color: '#fff',
          fontFamily: FONTS.texte,
          fontWeight: 600,
          fontSize: 38,
          lineHeight: 1.3,
          textAlign: 'center',
          opacity: p * out,
          transform: `translateY(${(1 - p) * 20}px)`,
          borderBottom: `4px solid ${COULEURS.jaune}`,
        }}
      >
        {texte}
      </div>
    </AbsoluteFill>
  );
};

/** Sous-titres synchronisés sur le script de la voix off. */
export const Subtitles: React.FC = () => {
  if (!AUDIO.sousTitres) return null;
  return (
    <>
      {VOIX_OFF.map((r, i) => (
        <Sequence key={i} from={r.debut} durationInFrames={r.duree} name={`Sous-titre ${i + 1}`} layout="none">
          <SousTitre texte={r.texte} duree={r.duree} />
        </Sequence>
      ))}
    </>
  );
};
