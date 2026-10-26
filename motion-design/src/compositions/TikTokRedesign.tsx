// Composition principale « redesign » 1080×1920 : les éléments du PSD recomposés
// pour le format vertical, scène par scène, puis retour à l'affiche d'origine.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Panel, Piece} from '../components/Piece';
import {EASE} from '../components/Transitions';
import {
	CARD_ACCENT,
	CARDS,
	CONTACT_PANEL,
	DECOR_COLUMN,
	LIST_VIEW,
	listScroll,
	PIECES,
	REDESIGN_FRAMES,
	REDESIGN_SFX,
	ROW_AT,
	SCENES,
} from '../config/redesign';
import {MUSIC} from '../config/timeline';
import {BRAND, VIDEO} from '../config/video';

export type TikTokRedesignProps = {bgm: boolean};

// Liseré vert à gauche de chaque carte du programme.
const CardAccent: React.FC<{top: number; height: number; at: number}> = ({top, height, at}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame >= SCENES.S4.from + 22) return null;
	const p = EASE.reveal(interpolate(frame, [at, at + 18], [0, 1], {extrapolateRight: 'clamp'}));
	const out = interpolate(frame, [SCENES.S4.from, SCENES.S4.from + 20], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				position: 'absolute',
				left: CARD_ACCENT.x,
				top: top + listScroll(frame),
				width: CARD_ACCENT.width,
				height,
				borderRadius: 3,
				backgroundColor: BRAND.green,
				transformOrigin: '50% 0%',
				transform: `scaleY(${p})`,
				opacity: out,
			}}
		/>
	);
};

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
		<Panel {...CONTACT_PANEL} color={BRAND.green} />
		{/* Liste du programme, masquée sous la pastille PROGRAMME avec un fondu. */}
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: LIST_VIEW.top,
				width: VIDEO.width,
				height: VIDEO.height - LIST_VIEW.top,
				overflow: 'hidden',
				WebkitMaskImage: `linear-gradient(to bottom, transparent 0, black ${LIST_VIEW.fade}px)`,
				maskImage: `linear-gradient(to bottom, transparent 0, black ${LIST_VIEW.fade}px)`,
				zIndex: 5,
			}}
		>
			<div style={{position: 'absolute', left: 0, top: -LIST_VIEW.top, width: VIDEO.width, height: VIDEO.height}}>
				{CARDS.map((c, i) => (
					<React.Fragment key={c.id}>
						<CardAccent top={400 + c.top} height={c.height} at={ROW_AT[i]} />
						<Piece spec={c.time} />
						<Piece spec={c.text} />
					</React.Fragment>
				))}
			</div>
		</div>
		{bgm ? <Audio src={staticFile(MUSIC.src)} volume={musicVolume} /> : null}
		{REDESIGN_SFX.map((s, i) => (
			<Sequence key={`${s.src}-${i}`} from={s.from} durationInFrames={s.durationInFrames} name={`sfx ${s.note}`}>
				<Audio src={staticFile(s.src)} volume={s.volume} />
			</Sequence>
		))}
	</AbsoluteFill>
);
