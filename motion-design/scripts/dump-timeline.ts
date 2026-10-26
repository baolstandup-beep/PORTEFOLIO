// Exporte la timeline résolue en JSON (utilisé par validate-project.py).
import {ELEMENTS} from '../src/config/assets';
import {cameraAt, toScreen} from '../src/components/CameraMotion';
import {CAMERA_KEYS, REVEALS, SFX, SHOTS, TOTAL_FRAMES, VOICE_CUES} from '../src/config/timeline';
import {VIDEO} from '../src/config/video';

const finalCam = cameraAt(TOTAL_FRAMES - 1);
const finalRects = Object.fromEntries(
	ELEMENTS.map((e) => [e.id, toScreen(finalCam, e.x, e.y, e.width, e.height)]),
);

// Rectangle écran de chaque élément à l'image où il finit d'apparaître.
const landedRects = Object.fromEntries(
	REVEALS.map((r) => {
		const e = ELEMENTS.find((x) => x.id === r.id)!;
		const f = Math.min(r.at + r.duration, TOTAL_FRAMES - 1);
		return [r.id, {frame: f, ...toScreen(cameraAt(f), e.x, e.y, e.width, e.height, r.depth)}];
	}),
);

console.log(
	JSON.stringify({
		video: VIDEO,
		totalFrames: TOTAL_FRAMES,
		shots: SHOTS,
		camera: CAMERA_KEYS,
		reveals: REVEALS,
		voice: VOICE_CUES,
		sfx: SFX,
		finalRects,
		landedRects,
	}),
);
