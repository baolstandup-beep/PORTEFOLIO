// Voix off, musique (avec ducking sous la voix) et effets sonores, tous calés
// sur les tables de src/config/timeline.ts.
import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {MUSIC, SFX, TOTAL_FRAMES, VOICE_CUES} from '../config/timeline';

/** Volume de la musique à l'image f : fondu d'entrée/sortie et baisse sous la voix. */
export const musicVolume = (f: number) => {
	const fade = interpolate(f, [0, MUSIC.fadeIn, TOTAL_FRAMES - MUSIC.fadeOut, TOTAL_FRAMES], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	let duck = 0;
	for (const cue of VOICE_CUES) {
		const d = interpolate(
			f,
			[cue.from - MUSIC.duckFrames, cue.from, cue.from + cue.duration, cue.from + cue.duration + MUSIC.duckFrames * 2],
			[0, 1, 1, 0],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
		);
		duck = Math.max(duck, d);
	}
	return fade * (MUSIC.volume + (MUSIC.duckedVolume - MUSIC.volume) * duck);
};

export const Soundtrack: React.FC<{bgm: boolean}> = ({bgm}) => (
	<>
		{bgm ? <Audio src={staticFile(MUSIC.src)} volume={musicVolume} /> : null}
		{VOICE_CUES.map((cue) => (
			<Sequence key={cue.id} from={cue.from} durationInFrames={cue.duration} name={`voix ${cue.id}`}>
				<Audio src={staticFile(cue.src)} />
			</Sequence>
		))}
		{SFX.map((s, i) => (
			<Sequence key={`${s.src}-${i}`} from={s.from} durationInFrames={s.durationInFrames} name={`sfx ${s.note}`}>
				<Audio src={staticFile(s.src)} volume={s.volume} />
			</Sequence>
		))}
	</>
);
