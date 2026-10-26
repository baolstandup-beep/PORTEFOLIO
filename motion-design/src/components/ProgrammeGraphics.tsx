// Habillage graphique du programme (aucun texte) : barre de progression à 9
// points, trait sous l'horaire en plan vedette, frise verticale du récapitulatif.
// Couleurs : vert et bleu mesurés dans le PSD.
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {HERO, HERO_AT, PROG, RECAP, RECAP_AT, RECAP_CARD_AT, RECAP_CARDS} from '../config/redesign';
import {BRAND} from '../config/video';
import {EASE} from './Transitions';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const ProgressDots: React.FC = () => {
	const frame = useCurrentFrame();
	if (frame < PROG.dotsAt || frame > RECAP_AT + 12) return null;
	const out = interpolate(frame, [RECAP_AT - 6, RECAP_AT + 12], [1, 0], clamp);
	const n = HERO_AT.length;
	const gap = 58;
	const x0 = 540 - ((n - 1) * gap) / 2;
	return (
		<>
			{HERO_AT.map((at, i) => {
				const pop = EASE.reveal(interpolate(frame, [PROG.dotsAt + i * 3, PROG.dotsAt + i * 3 + 14], [0, 1], clamp));
				const active = interpolate(frame, [at - 2, at + 8, at + 28, at + 34], [0, 1, 1, 0], clamp);
				const done = frame >= at + 8 ? 1 : 0;
				const size = 16 + 10 * active;
				return (
					<div
						key={at}
						style={{
							position: 'absolute',
							left: x0 + i * gap - size / 2,
							top: 420 - size / 2,
							width: size,
							height: size,
							borderRadius: '50%',
							boxSizing: 'border-box',
							border: `3px solid ${done || active > 0.5 ? BRAND.green : '#c9d8cf'}`,
							backgroundColor: done ? BRAND.green : active > 0.5 ? BRAND.green : '#ffffff',
							transform: `scale(${pop})`,
							opacity: out,
						}}
					/>
				);
			})}
		</>
	);
};

export const HeroUnderline: React.FC = () => {
	const frame = useCurrentFrame();
	const i = HERO_AT.findIndex((at) => frame >= at && frame < at + 36);
	if (i < 0) return null;
	const at = HERO_AT[i];
	const grow = EASE.reveal(interpolate(frame, [at + 8, at + 22], [0, 1], clamp));
	const fade = interpolate(frame, [at + 28, at + 36], [1, 0], clamp);
	const w = 260 * grow;
	return (
		<div
			style={{
				position: 'absolute',
				left: 540 - w / 2,
				top: HERO.underlineY,
				width: w,
				height: 8,
				borderRadius: 4,
				backgroundColor: i % 2 ? BRAND.blue : BRAND.green,
				opacity: fade,
				zIndex: 6,
			}}
		/>
	);
};

export const RecapTimeline: React.FC<{exitAt: number}> = ({exitAt}) => {
	const frame = useCurrentFrame();
	if (frame < RECAP_AT || frame >= exitAt + 20) return null;
	const first = RECAP_CARDS[0].dotY;
	const last = RECAP_CARDS[RECAP_CARDS.length - 1].dotY;
	const grow = EASE.soft(interpolate(frame, [RECAP_AT, RECAP_CARD_AT[RECAP_CARD_AT.length - 1] + 10], [0, 1], clamp));
	const out = interpolate(frame, [exitAt, exitAt + 18], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', inset: 0, opacity: out, zIndex: 5}}>
			<div
				style={{
					position: 'absolute',
					left: RECAP.lineX - 2,
					top: first,
					width: 4,
					height: (last - first) * grow,
					borderRadius: 2,
					backgroundColor: BRAND.green,
				}}
			/>
			{RECAP_CARDS.map((c, i) => {
				const p = EASE.reveal(interpolate(frame, [RECAP_CARD_AT[i], RECAP_CARD_AT[i] + 12], [0, 1], clamp));
				return (
					<div
						key={c.id}
						style={{
							position: 'absolute',
							left: RECAP.lineX - 11,
							top: c.dotY - 11,
							width: 22,
							height: 22,
							borderRadius: '50%',
							boxSizing: 'border-box',
							border: `4px solid ${BRAND.green}`,
							backgroundColor: '#ffffff',
							transform: `scale(${p})`,
						}}
					/>
				);
			})}
		</div>
	);
};
