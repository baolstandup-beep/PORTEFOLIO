import React from 'react';
import { Audio, interpolate, Sequence, staticFile } from 'remotion';
import { MUSIC, VIDEO, VOICEOVER } from '../config/setrans.config';
import { VO_DURATIONS } from '../config/vo-durations';

const fps = VIDEO.fps;
const total = () => Math.round(VIDEO.durationInSeconds * fps);

/** Phrases de voix off réellement disponibles (fichier présent = durée connue). */
export const voiceLines = () =>
  VOICEOVER.enabled
    ? VOICEOVER.lines
        .filter((l) => VO_DURATIONS[l.file] !== undefined)
        .map((l) => ({ ...l, duration: VO_DURATIONS[l.file] }))
    : [];

/** 0 → 1 : présence de la voix à l'instant t (s), avec attaque et relâche douces. */
const voicePresence = (t: number) => {
  const attack = 0.25;
  const release = 0.6;
  let v = 0;
  for (const l of voiceLines()) {
    const a = interpolate(t, [l.at - attack, l.at], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const r = interpolate(t, [l.at + l.duration, l.at + l.duration + release], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    v = Math.max(v, Math.min(a, r));
  }
  return v;
};

/** Musique : fondus d'entrée/sortie + baisse automatique sous la voix off. */
export const MusicTrack: React.FC = () => {
  if (!MUSIC.file) return null;
  const from = Math.round(MUSIC.startAt * fps);
  const frames = total() - from;
  const fi = Math.max(1, Math.round(MUSIC.fadeIn * fps));
  const fo = Math.max(1, Math.round(MUSIC.fadeOut * fps));
  return (
    <Sequence from={from} durationInFrames={frames} name="Musique">
      <Audio
        src={staticFile(MUSIC.file)}
        volume={(f) => {
          const fadeIn = interpolate(f, [0, fi], [0, 1], { extrapolateRight: 'clamp' });
          const fadeOut = interpolate(f, [frames - fo, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const t = (from + f) / fps;
          const duck = 1 - (1 - MUSIC.duckUnderVoice) * voicePresence(t);
          return MUSIC.volume * Math.min(fadeIn, fadeOut) * duck;
        }}
      />
    </Sequence>
  );
};

/** Voix off : une séquence par phrase. */
export const VoiceTrack: React.FC = () => (
  <>
    {voiceLines().map((l) => {
      const from = Math.round(l.at * fps);
      const frames = Math.min(Math.ceil(l.duration * fps) + 2, total() - from);
      if (frames <= 0) return null;
      return (
        <Sequence key={l.file} from={from} durationInFrames={frames} name={`Voix · ${l.text}`}>
          <Audio src={staticFile(`${VOICEOVER.folder}/${l.file}.wav`)} volume={VOICEOVER.volume} />
        </Sequence>
      );
    })}
  </>
);
