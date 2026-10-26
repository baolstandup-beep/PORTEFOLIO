// Logo PAS-PAS animé (image du PSD, non redessinée) : intro et habillage du programme.
// Le logo est affiché deux fois avec des masques complémentaires :
//  - l'emblème central (disque de rayon RING_INNER) apparaît en zoom ;
//  - l'anneau de texte (RING_INNER → bord) se dessine en balayage circulaire
//    tout en tournant jusqu'à sa position.
// Au repos, les deux masques se complètent : on retrouve le logo exact.
// Puis une onde verte, un reflet, éventuellement un déplacement, des pulsations
// et des reflets ponctuels pendant la tenue.
import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {getElement} from '../config/assets';
import type {LogoAnim} from '../config/redesign';
import {BRAND} from '../config/video';
import {EASE} from './Transitions';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Géométrie mesurée sur le PNG du logo (286 × 288 px) : centre et rayon intérieur de l'anneau.
const LOGO_CX = 142;
const LOGO_CY = 143.5;
const RING_INNER = 104;

export const AnimatedLogo: React.FC<{anim: LogoAnim}> = ({anim: L}) => {
	const frame = useCurrentFrame();
	if (frame < L.coreAt || frame >= L.exitAt + L.exitDur) return null;
	const el = getElement('logo-paspas');

	// Position : grand au centre, puis montée vers sa place de la scène 1.
	const move = EASE.camera(interpolate(frame, [L.moveAt, L.moveAt + L.moveDur], [0, 1], clamp));
	// Pulsation brève à chaque instant de L.pulses (ex. : chaque point du programme).
	const pulse = (L.pulses ?? []).reduce(
		(a, at) => Math.max(a, interpolate(frame, [at, at + 6, at + 18], [0, 1, 0], clamp)),
		0,
	);
	const s = (L.big.s + (L.rest.s - L.big.s) * move) * (1 + 0.045 * pulse);
	const cx = L.big.cx + (L.rest.cx - L.big.cx) * move;
	const float = frame > L.moveAt + L.moveDur ? Math.sin((frame - L.moveAt - L.moveDur) / 38) * 4 : 0;
	const cy = L.big.cy + (L.rest.cy - L.big.cy) * move + float;
	const w = el.width * s;
	const h = el.height * s;

	// Emblème
	const core = EASE.reveal(interpolate(frame, [L.coreAt, L.coreAt + 24], [0, 1], clamp));
	// Anneau : balayage 0 → 360° et rotation −120° → 0°
	const ringT = interpolate(frame, [L.ringAt, L.ringAt + 34], [0, 1], clamp);
	const ring = EASE.soft(ringT);
	const sweepDeg = 360 * ring;
	const rot = -120 * (1 - EASE.reveal(ringT));
	// Sortie
	const exit = EASE.soft(interpolate(frame, [L.exitAt, L.exitAt + L.exitDur], [0, 1], clamp));

	const rIn = RING_INNER * s;
	const at = `${LOGO_CX * s}px ${LOGO_CY * s}px`;
	const coreMask = `radial-gradient(circle at ${at}, #000 ${rIn}px, transparent ${rIn + 0.5}px)`;
	const ringMask = `radial-gradient(circle at ${at}, transparent ${rIn - 0.5}px, #000 ${rIn}px)`;
	const sweepMask = `conic-gradient(from -90deg at ${at}, #000 ${sweepDeg}deg, transparent ${sweepDeg}deg)`;
	const done = ringT >= 1 && core >= 0.999;

	const img = (style: React.CSSProperties) => (
		<Img src={staticFile(el.src)} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, ...style}} />
	);

	// Onde verte (graphique, sans texte) qui s'élargit quand l'anneau se ferme.
	const wave = interpolate(frame, [L.waveAt, L.waveAt + 26], [0, 1], clamp);
	const waveR = (Math.max(w, h) / 2) * (1 + 0.6 * EASE.reveal(wave));

	// Reflet lumineux sur le logo entier, découpé à sa forme.
	const glintAt = [L.glintAt, ...(L.glints ?? [])].reduce((a, g) => (frame >= g ? g : a), L.glintAt);
	const sweepP = interpolate(frame, [glintAt, glintAt + 30], [0, 1], clamp);
	const url = `url("${staticFile(el.src)}")`;

	return (
		<div
			style={{
				position: 'absolute',
				left: cx - w / 2,
				top: cy - h / 2,
				width: w,
				height: h,
				zIndex: 8,
				opacity: 1 - exit,
				transform: `translateY(${-50 * exit}px)`,
			}}
		>
			{wave > 0 && wave < 1 ? (
				<div
					style={{
						position: 'absolute',
						left: w / 2 - waveR,
						top: h / 2 - waveR,
						width: waveR * 2,
						height: waveR * 2,
						borderRadius: '50%',
						border: `${6 * (1 - wave) + 1}px solid ${BRAND.green}`,
						opacity: 0.7 * (1 - wave),
						boxSizing: 'border-box',
					}}
				/>
			) : null}
			{done ? (
				img({})
			) : (
				<>
					{img({
						WebkitMaskImage: coreMask,
						maskImage: coreMask,
						transformOrigin: at,
						transform: `scale(${0.55 + 0.45 * core})`,
						opacity: Math.min(1, core * 1.6),
					})}
					{ringT > 0
						? img({
								WebkitMaskImage: `${ringMask}, ${sweepMask}`,
								maskImage: `${ringMask}, ${sweepMask}`,
								WebkitMaskComposite: 'source-in',
								maskComposite: 'intersect',
								transformOrigin: at,
								transform: `rotate(${rot}deg)`,
							})
						: null}
				</>
			)}
			{sweepP > 0 && sweepP < 1 ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backgroundImage:
							'linear-gradient(105deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 65%)',
						backgroundSize: '300% 100%',
						backgroundPosition: `${100 - EASE.soft(sweepP) * 100}% 0`,
						mixBlendMode: 'screen',
						WebkitMaskImage: url,
						maskImage: url,
						WebkitMaskSize: '100% 100%',
						maskSize: '100% 100%',
					}}
				/>
			) : null}
		</div>
	);
};
