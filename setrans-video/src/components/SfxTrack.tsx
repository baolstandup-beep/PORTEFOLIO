import React from 'react';
import { Audio, interpolate, Sequence, staticFile } from 'remotion';
import { SFX, SfxCue, VIDEO } from '../config/setrans.config';
import { SFX_DURATIONS } from '../config/sfx-durations';

/** Piste d'effets sonores : un <Audio> par repère de la config. */
export const SfxTrack: React.FC = () => {
  if (!SFX.enabled) return null;
  const fps = VIDEO.fps;
  const total = Math.round(VIDEO.durationInSeconds * fps);
  return (
    <>
      {SFX.cues.map((cue: SfxCue, i) => {
        const from = Math.round(cue.at * fps);
        if (from >= total) return null;
        const fileDur = SFX_DURATIONS[cue.file] ?? 10;
        const dur = Math.min(cue.maxDuration ?? fileDur, fileDur);
        const frames = Math.max(1, Math.min(Math.round(dur * fps), total - from));
        const fi = Math.round((cue.fadeIn ?? 0) * fps);
        const fo = Math.round((cue.fadeOut ?? 0) * fps);
        const gain = cue.volume * SFX.master;
        return (
          <Sequence key={i} from={from} durationInFrames={frames} name={`SFX · ${cue.file}${cue.note ? ` · ${cue.note}` : ''}`}>
            <Audio
              src={staticFile(`${SFX.folder}/${cue.file}.wav`)}
              volume={(f) => {
                const a = fi > 0 ? interpolate(f, [0, fi], [0, 1], { extrapolateRight: 'clamp' }) : 1;
                const b = fo > 0 ? interpolate(f, [frames - fo, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
                return gain * Math.min(a, b);
              }}
            />
          </Sequence>
        );
      })}
    </>
  );
};
