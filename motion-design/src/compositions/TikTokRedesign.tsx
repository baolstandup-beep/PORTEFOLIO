// Composition principale « redesign » 1080×1920 : les éléments du PSD recomposés
// pour le format vertical : intro logo, scènes, puis retour à l'affiche d'origine.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile} from 'remotion';
import {Background} from '../components/Background';
import {IntroLogo} from '../components/IntroLogo';
import {Panel, Piece} from '../components/Piece';
import {CONTACT_PANEL, DECOR_COLUMN, PIECES, REDESIGN_FRAMES, REDESIGN_SFX, SCENES} from '../config/redesign';
import {HeroUnderline, ProgressDots, RecapTimeline} from '../components/ProgrammeGraphics';
import {MUSIC} from '../config/timeline';
import {BRAND} from '../config/video';

export type TikTokRedesignProps = {bgm: boolean};

const musicVolume = (f: number) =>
	MUSIC.volumeNoVoice *
	interpolate(f, [0, MUSIC.fadeIn, REDESIGN_FRAMES - MUSIC.fadeOut, REDESIGN_FRAMES], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

export const TikTokRedesign: React.FC<TikTokRedesignProps> = ({bgm}) => (
	<AbsoluteFill style={{backgroundColor: BRAND.white}}>
		<Background />
		<Piece spec={DECOR_COLUMN} />
		{PIECES.map((p) => (
			<Piece key={p.id} spec={p} />
		))}
		<IntroLogo />
		<Panel {...CONTACT_PANEL} color={BRAND.green} />
		<ProgressDots />
		<HeroUnderline />
		<RecapTimeline exitAt={SCENES.S4.from} />
		{bgm ? <Audio src={staticFile(MUSIC.src)} volume={musicVolume} /> : null}
		{REDESIGN_SFX.map((s, i) => (
			<Sequence key={`${s.src}-${i}`} from={s.from} durationInFrames={s.durationInFrames} name={`sfx ${s.note}`}>
				<Audio src={staticFile(s.src)} volume={s.volume} />
			</Sequence>
		))}
	</AbsoluteFill>
);
