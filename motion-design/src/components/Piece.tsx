// Une « pièce » : un élément du PSD, ou une zone découpée dans un élément,
// placée directement en pixels écran. Elle entre (préréglage de Transitions),
// se déplace entre des positions clés, respire légèrement, puis sort.
import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {getElement, type ElementId} from '../config/assets';
import type {RevealPreset} from '../config/timeline';
import {EASE, progress, revealStyles} from './Transitions';

export type DocRect = {x: number; y: number; w: number; h: number};

export type PieceKey = {f: number; cx: number; cy: number; s: number};

export type ExitPreset = 'fadeUp' | 'fadeDown' | 'fade' | 'sinkDown';

export type PieceSpec = {
	id: string;
	el: ElementId;
	crop?: DocRect;
	enter: {at: number; dur: number; preset: RevealPreset};
	exit?: {at: number; dur: number; preset: ExitPreset};
	keys: PieceKey[];
	z?: number;
	// Amplitude (px) d'un flottement vertical très lent pendant la tenue.
	float?: number;
	// Décalage vertical supplémentaire (défilement d'une liste).
	scrollY?: (f: number) => number;
	sweep?: {at: number; dur: number};
	// Coins arrondis (px) : pour une zone découpée dans une pastille.
	radius?: number;
	// Léger zoom pendant la tenue (1 = aucun), de l'entrée à la sortie.
	push?: number;
};

const keyAt = (keys: PieceKey[], f: number) => {
	if (f <= keys[0].f) return keys[0];
	for (let i = 1; i < keys.length; i++) {
		const a = keys[i - 1];
		const b = keys[i];
		if (f <= b.f) {
			const t = EASE.camera(interpolate(f, [a.f, b.f], [0, 1]));
			return {f, cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, s: a.s + (b.s - a.s) * t};
		}
	}
	return keys[keys.length - 1];
};

const exitStyle = (preset: ExitPreset, p: number): React.CSSProperties => {
	const e = EASE.soft(p);
	switch (preset) {
		case 'fadeUp':
			return {opacity: 1 - e, transform: `translateY(${-50 * e}px)`};
		case 'fadeDown':
			return {opacity: 1 - e, transform: `translateY(${50 * e}px)`};
		case 'sinkDown':
			return {transform: `translateY(${900 * EASE.camera(p)}px)`};
		case 'fade':
			return {opacity: 1 - e};
	}
};

export const Piece: React.FC<{spec: PieceSpec}> = ({spec}) => {
	const frame = useCurrentFrame();
	const el = getElement(spec.el);
	const crop = spec.crop ?? {x: el.x, y: el.y, w: el.width, h: el.height};
	const t = (frame - spec.enter.at) / spec.enter.dur;
	if (t <= 0) return null;
	if (spec.exit && frame >= spec.exit.at + spec.exit.dur) return null;

	const k0 = keyAt(spec.keys, frame);
	const pushEnd = spec.exit ? spec.exit.at : spec.enter.at + 120;
	const push = spec.push
		? 1 + (spec.push - 1) * interpolate(frame, [spec.enter.at, pushEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
		: 1;
	const k = {...k0, s: k0.s * push};
	const w = crop.w * k.s;
	const h = crop.h * k.s;
	// Flottement : déterministe, phase dérivée de l'identifiant.
	const phase = [...spec.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 628;
	const float = spec.float ? Math.sin(frame / 38 + phase / 100) * spec.float * Math.min(1, Math.max(0, t - 1)) : 0;
	const y = k.cy - h / 2 + float + (spec.scrollY ? spec.scrollY(frame) : 0);
	const {outer, inner} = revealStyles(spec.enter.preset, t, w, h);
	const exit = spec.exit && frame >= spec.exit.at ? exitStyle(spec.exit.preset, (frame - spec.exit.at) / spec.exit.dur) : {};

	return (
		<div style={{position: 'absolute', left: k.cx - w / 2, top: y, width: w, height: h, zIndex: spec.z ?? 1, ...exit}}>
			<div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: spec.radius ? spec.radius * k.s : 0, ...outer}}>
				<div style={{position: 'absolute', inset: 0, ...inner}}>
					<Img
						src={staticFile(el.src)}
						style={{
							position: 'absolute',
							left: -(crop.x - el.x) * k.s,
							top: -(crop.y - el.y) * k.s,
							width: el.width * k.s,
							height: el.height * k.s,
							maxWidth: 'none',
						}}
					/>
				</div>
				{spec.sweep ? <Sweep src={el.src} at={spec.sweep.at} dur={spec.sweep.dur} crop={crop} el={el} s={k.s} /> : null}
			</div>
		</div>
	);
};

// Reflet lumineux découpé à la forme des pixels de la pièce.
const Sweep: React.FC<{
	src: string;
	at: number;
	dur: number;
	crop: DocRect;
	el: {x: number; y: number; width: number; height: number};
	s: number;
}> = ({src, at, dur, crop, el, s}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame > at + dur) return null;
	const p = progress(frame, at, dur, EASE.soft);
	const url = `url("${staticFile(src)}")`;
	const maskPos = `${-(crop.x - el.x) * s}px ${-(crop.y - el.y) * s}px`;
	const maskSize = `${el.width * s}px ${el.height * s}px`;
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				backgroundImage:
					'linear-gradient(105deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 65%)',
				backgroundSize: '300% 100%',
				backgroundPosition: `${100 - p * 100}% 0`,
				mixBlendMode: 'screen',
				WebkitMaskImage: url,
				maskImage: url,
				WebkitMaskPosition: maskPos,
				maskPosition: maskPos,
				WebkitMaskSize: maskSize,
				maskSize,
				WebkitMaskRepeat: 'no-repeat',
				maskRepeat: 'no-repeat',
			}}
		/>
	);
};

/** Panneau de couleur (fond de la carte contacts), animé comme une pièce. */
export const Panel: React.FC<{
	rect: {x: number; y: number; w: number; h: number};
	color: string;
	at: number;
	dur: number;
	exit?: {at: number; dur: number; preset: ExitPreset};
	radius?: number;
}> = ({rect, color, at, dur, exit, radius = 36}) => {
	const frame = useCurrentFrame();
	const t = (frame - at) / dur;
	if (t <= 0) return null;
	if (exit && frame >= exit.at + exit.dur) return null;
	const {outer} = revealStyles('rise', t, rect.w, rect.h);
	const p = EASE.reveal(Math.min(1, t));
	const ex = exit && frame >= exit.at ? exitStyle(exit.preset, (frame - exit.at) / exit.dur) : {};
	return (
		<div style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h, zIndex: 0, ...ex}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: radius,
					backgroundColor: color,
					transformOrigin: '50% 100%',
					transform: `scaleY(${0.2 + 0.8 * p})`,
					opacity: Math.min(1, t * 2),
					...(outer.opacity !== undefined ? {opacity: outer.opacity} : {}),
				}}
			/>
		</div>
	);
};
