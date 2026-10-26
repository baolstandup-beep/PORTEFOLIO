// Reflet lumineux unique, découpé à la forme exacte de l'élément (masque = son PNG).
import React from 'react';
import {interpolate, staticFile, useCurrentFrame} from 'remotion';
import {getElement, type ElementId} from '../config/assets';
import {EASE} from './Transitions';

export const LightSweep: React.FC<{id: ElementId; at: number; duration: number}> = ({id, at, duration}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame > at + duration) {
		return null;
	}
	const t = EASE.soft(interpolate(frame, [at, at + duration], [0, 1]));
	const url = `url("${staticFile(getElement(id).src)}")`;
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
				backgroundImage:
					'linear-gradient(105deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 65%)',
				backgroundSize: '300% 100%',
				backgroundPosition: `${100 - t * 100}% 0`,
				mixBlendMode: 'screen',
				WebkitMaskImage: url,
				maskImage: url,
				WebkitMaskSize: '100% 100%',
				maskSize: '100% 100%',
			}}
		/>
	);
};
