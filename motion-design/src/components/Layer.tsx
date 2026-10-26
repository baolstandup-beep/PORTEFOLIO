// Un élément extrait du PSD, placé par la caméra et animé selon la timeline.
import React from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {getElement, type ElementId} from '../config/assets';
import {REVEALS} from '../config/timeline';
import {toScreen, useCamera} from './CameraMotion';
import {EASE, progress, revealStyles} from './Transitions';

const revealFor = (id: ElementId) => {
	const r = REVEALS.find((x) => x.id === id);
	if (!r) {
		throw new Error(`Aucune apparition définie pour « ${id} » dans timeline.ts`);
	}
	return r;
};

export const Layer: React.FC<{id: ElementId; children?: React.ReactNode}> = ({id, children}) => {
	const frame = useCurrentFrame();
	const cam = useCamera();
	const el = getElement(id);
	const reveal = revealFor(id);
	const rect = toScreen(cam, el.x, el.y, el.width, el.height, reveal.depth);
	const t = (frame - reveal.at) / reveal.duration;
	const {outer, inner} = revealStyles(reveal.preset, t, rect.width, rect.height);
	const crop = reveal.cropBottom;
	if (crop) {
		const left = 1 - progress(frame, crop.releaseAt, crop.releaseDuration, EASE.soft);
		if (left > 0) {
			outer.clipPath = `inset(0 0 ${crop.doc * cam.z * left}px 0)`;
		}
	}

	if (t <= 0) {
		return null;
	}
	return (
		<div style={{position: 'absolute', ...rect, zIndex: el.zIndex, opacity: el.opacity, ...outer}}>
			<Img
				src={staticFile(el.src)}
				style={{width: '100%', height: '100%', display: 'block', transformOrigin: '50% 50%', ...inner}}
			/>
			{children}
		</div>
	);
};
