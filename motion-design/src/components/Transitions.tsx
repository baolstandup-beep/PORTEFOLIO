// Courbes et préréglages d'animation partagés (purs, déterministes : uniquement
// fonction du numéro d'image).
import type {CSSProperties} from 'react';
import {Easing, interpolate} from 'remotion';
import type {RevealPreset} from '../config/timeline';

// Jetons de mouvement « institutionnel » : entrées franches sans rebond,
// caméra lente et symétrique.
export const EASE = {
	enter: Easing.bezier(0, 0, 0.2, 1),
	reveal: Easing.bezier(0.16, 1, 0.3, 1),
	camera: Easing.bezier(0.65, 0, 0.35, 1),
	cameraOut: Easing.bezier(0.25, 0.1, 0.25, 1),
	soft: Easing.bezier(0.4, 0, 0.2, 1),
} as const;

/** Avancement 0 → 1 entre `at` et `at + duration`, borné, avec courbe. */
export const progress = (frame: number, at: number, duration: number, easing: (t: number) => number = EASE.enter) =>
	easing(interpolate(frame, [at, at + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

export type RevealStyles = {
	// Style du conteneur à la taille de l'élément (masque).
	outer: CSSProperties;
	// Style de l'image à l'intérieur du conteneur.
	inner: CSSProperties;
};

/**
 * Styles d'apparition pour un élément de taille `w` × `h` (px écran).
 * `t` est l'avancement brut 0 → 1 ; chaque préréglage applique sa propre courbe.
 */
export const revealStyles = (preset: RevealPreset, t: number, w: number, h: number): RevealStyles => {
	if (t >= 1) {
		return {outer: {}, inner: {}};
	}
	if (t <= 0) {
		return {outer: {opacity: 0}, inner: {}};
	}
	switch (preset) {
		case 'rise': {
			const p = EASE.reveal(t);
			return {
				outer: {overflow: 'hidden'},
				inner: {transform: `translateY(${(1 - p) * h * 1.02}px)`},
			};
		}
		case 'wipeRight': {
			const p = EASE.reveal(t);
			return {
				outer: {clipPath: `inset(-2% ${(1 - p) * 100}% -2% 0)`},
				inner: {transform: `translateX(${-(1 - p) * Math.min(40, w * 0.04)}px)`},
			};
		}
		case 'wipeDown': {
			const p = EASE.soft(t);
			return {outer: {clipPath: `inset(0 0 ${(1 - p) * 100}% 0)`}, inner: {}};
		}
		case 'scaleIn': {
			const p = EASE.reveal(t);
			return {
				outer: {opacity: interpolate(t, [0, 0.45], [0, 1], {extrapolateRight: 'clamp'})},
				inner: {transform: `scale(${0.86 + 0.14 * p})`},
			};
		}
		case 'slideUp': {
			const p = EASE.enter(t);
			return {
				outer: {opacity: interpolate(t, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'})},
				inner: {transform: `translateY(${(1 - p) * Math.max(14, h * 0.25)}px)`},
			};
		}
		case 'rowIn': {
			const p = EASE.reveal(t);
			return {
				outer: {
					clipPath: `inset(-10% ${(1 - p) * 100}% -10% 0)`,
					opacity: interpolate(t, [0, 0.3], [0, 1], {extrapolateRight: 'clamp'}),
				},
				inner: {transform: `translateX(${-(1 - p) * 26}px)`},
			};
		}
	}
};
