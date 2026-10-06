import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/300-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import { COLORS, SCENES, SceneId, VIDEO, VOICEOVER_SCRIPT } from './config/setrans.config';
import { MusicTrack, voiceLines, VoiceTrack } from './components/AudioTracks';
import { FilmFinish } from './components/Base';
import { SfxTrack } from './components/SfxTrack';
import { EASE, progress, sec } from './lib/anim';
import type { SceneProps } from './scenes/types';
import { S01Globe } from './scenes/S01Globe';
import { S02Ship } from './scenes/S02Ship';
import { S03Plane } from './scenes/S03Plane';
import { S04Port } from './scenes/S04Port';
import { S05Customs } from './scenes/S05Customs';
import { S06Container } from './scenes/S06Container';
import { S07TruckToSenegal } from './scenes/S07TruckToSenegal';
import { S08Brand } from './scenes/S08Brand';
import { S09Chain } from './scenes/S09Chain';
import { S10DakarTouba } from './scenes/S10DakarTouba';
import { S11Tracking } from './scenes/S11Tracking';
import { S12Growth } from './scenes/S12Growth';
import { S13RoadTouba } from './scenes/S13RoadTouba';
import { S14ToubaWorld } from './scenes/S14ToubaWorld';
import { S15Silence } from './scenes/S15Silence';
import { S16Logo } from './scenes/S16Logo';

/** Correspondance identifiant → composant de scène. */
const REGISTRY: Record<SceneId, React.FC<SceneProps>> = {
  s01: S01Globe,
  s02: S02Ship,
  s03: S03Plane,
  s04: S04Port,
  s05: S05Customs,
  s06: S06Container,
  s07: S07TruckToSenegal,
  s08: S08Brand,
  s09: S09Chain,
  s10: S10DakarTouba,
  s11: S11Tracking,
  s12: S12Growth,
  s13: S13RoadTouba,
  s14: S14ToubaWorld,
  s15: S15Silence,
  s16: S16Logo,
};

/** Fondu enchaîné d'entrée : la scène suivante recouvre la précédente. */
const CrossfadeIn: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({ enabled, children }) => {
  const f = useCurrentFrame();
  const o = enabled ? progress(f, 0, VIDEO.crossfade, EASE.soft) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Subtitles: React.FC = () => {
  const f = useCurrentFrame() / VIDEO.fps;
  const current = voiceLines().find((l) => f >= l.at && f <= l.at + l.duration + 0.3);
  if (!current) return null;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 }}>
      <div style={{ fontFamily: 'Inter', fontSize: 30, color: '#fff', textShadow: '0 2px 8px #000', maxWidth: 1500, textAlign: 'center' }}>
        {current.text}
      </div>
    </AbsoluteFill>
  );
};

export const SetransFilm: React.FC = () => {
  const total = sec(VIDEO.durationInSeconds);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      {SCENES.map((s, i) => {
        const Scene = REGISTRY[s.id];
        const isLast = i === SCENES.length - 1;
        // La scène dure un fondu de plus pour couvrir l'entrée de la suivante.
        const dur = isLast ? s.duration : s.duration + VIDEO.crossfade;
        const from = sec(s.start);
        return (
          <Sequence key={s.id} name={`${s.id} · ${s.name}`} from={from} durationInFrames={Math.min(sec(dur), total - from)}>
            <CrossfadeIn enabled={i > 0}>
              <Scene duration={dur} />
            </CrossfadeIn>
          </Sequence>
        );
      })}
      <FilmFinish lightFromSec={SCENES[SCENES.length - 1].start} />
      {VOICEOVER_SCRIPT.showSubtitles && <Subtitles />}
      {/* Effets sonores (config : SFX) */}
      <SfxTrack />
      {/* Musique (config : MUSIC) et voix off (config : VOICEOVER) */}
      <MusicTrack />
      <VoiceTrack />
    </AbsoluteFill>
  );
};
