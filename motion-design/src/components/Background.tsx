// Fond blanc de l'affiche, prolongé à tout le cadre 9:16, avec deux halos très
// discrets aux couleurs du PSD qui dérivent lentement (profondeur lointaine).
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {TOTAL_FRAMES} from '../config/timeline';
import {BRAND, VIDEO} from '../config/video';
import {useCamera} from './CameraMotion';

const hexToRgba = (hex: string, a: number) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export const Background: React.FC = () => {
	const frame = useCurrentFrame();
	const cam = useCamera();
	const drift = interpolate(frame, [0, TOTAL_FRAMES], [0, 1]);
	// Parallaxe lointaine : les halos suivent la caméra à 10 % de sa vitesse.
	const ox = -(cam.cx - 1158) * 0.1 * cam.z;
	const oy = -(cam.cy - 1600) * 0.1 * cam.z;
	return (
		<div style={{position: 'absolute', inset: 0, backgroundColor: BRAND.white, overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					width: VIDEO.width * 1.4,
					height: VIDEO.width * 1.4,
					left: -VIDEO.width * 0.75 + ox + drift * 60,
					top: -VIDEO.width * 0.6 + oy,
					background: `radial-gradient(circle, ${hexToRgba(BRAND.green, 0.09)} 0%, ${hexToRgba(BRAND.green, 0)} 65%)`,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: VIDEO.width * 1.5,
					height: VIDEO.width * 1.5,
					left: VIDEO.width * 0.25 + ox - drift * 60,
					top: VIDEO.height - VIDEO.width * 0.85 + oy,
					background: `radial-gradient(circle, ${hexToRgba(BRAND.blue, 0.08)} 0%, ${hexToRgba(BRAND.blue, 0)} 65%)`,
				}}
			/>
		</div>
	);
};
