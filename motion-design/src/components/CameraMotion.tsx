// Caméra 2D : interpole les clés de src/config/timeline.ts et convertit les
// coordonnées du document PSD en pixels écran. Les éléments sont redimensionnés
// par la mise en page (largeur/hauteur) et non par un `transform: scale` global,
// pour que le navigateur rééchantillonne chaque image directement à sa taille finale.
import React, {createContext, useContext} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {CAMERA_KEYS, FINAL_CAMERA, type CameraKey} from '../config/timeline';
import {VIDEO} from '../config/video';
import {EASE} from './Transitions';

export type Camera = {cx: number; cy: number; z: number};

const EASINGS = {inOut: EASE.camera, out: EASE.cameraOut, linear: (t: number) => t};

export const cameraAt = (frame: number, keys: CameraKey[] = CAMERA_KEYS): Camera => {
	if (frame <= keys[0].frame) {
		return keys[0];
	}
	for (let i = 1; i < keys.length; i++) {
		const a = keys[i - 1];
		const b = keys[i];
		if (frame <= b.frame) {
			const t = EASINGS[b.ease ?? 'inOut'](
				interpolate(frame, [a.frame, b.frame], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
			);
			// Zoom interpolé en logarithme : vitesse de zoom perçue constante.
			const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * t);
			return {cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, z};
		}
	}
	return keys[keys.length - 1];
};

const CameraContext = createContext<Camera>(FINAL_CAMERA);

export const CameraMotion: React.FC<{children: React.ReactNode}> = ({children}) => {
	const frame = useCurrentFrame();
	return <CameraContext.Provider value={cameraAt(frame)}>{children}</CameraContext.Provider>;
};

export const useCamera = () => useContext(CameraContext);

/**
 * Rectangle écran d'une boîte du document. `depth` > 0 rapproche l'élément :
 * il se décale davantage pendant les mouvements de caméra (parallaxe) et
 * rejoint exactement sa position d'origine sur le plan final.
 */
export const toScreen = (cam: Camera, x: number, y: number, w: number, h: number, depth = 0) => {
	const px = x - (cam.cx - FINAL_CAMERA.cx) * depth;
	const py = y - (cam.cy - FINAL_CAMERA.cy) * depth;
	return {
		left: (px - cam.cx) * cam.z + VIDEO.width / 2,
		top: (py - cam.cy) * cam.z + VIDEO.height / 2,
		width: w * cam.z,
		height: h * cam.z,
	};
};
