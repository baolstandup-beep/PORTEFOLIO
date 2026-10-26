// Contrôle de cadrage, image par image : signale les textes visibles mais coupés
// par le bord du cadre, et les bords « artificiels » du pupitre (bord perdu à
// gauche, pied coupé en bas) quand ils sont dans le champ.
// Les mouvements de caméra traversent forcément des états intermédiaires : on ne
// compte comme défaut que les images où la caméra est quasi immobile.
// Usage : npx tsx scripts/check-framing.ts   (code de sortie 1 si défaut)
import {ELEMENTS} from '../src/config/assets';
import {cameraAt, toScreen} from '../src/components/CameraMotion';
import {FINAL_CAMERA, REVEALS, TOTAL_FRAMES} from '../src/config/timeline';
import {VIDEO} from '../src/config/video';

const NOT_TEXT = new Set(['pupitre', 'colonne-motifs']);
const TOL = 1; // px
const MOVING = 1.5; // px/image : au-delà, la caméra est en mouvement

const issues: Record<string, number[]> = {};
const add = (k: string, f: number) => (issues[k] ??= []).push(f);

const speed = (f: number) => {
	const a = cameraAt(f);
	const b = cameraAt(f + 1);
	// déplacement écran d'un point au centre + effet du zoom sur les bords
	return Math.hypot((b.cx - a.cx) * a.z, (b.cy - a.cy) * a.z) + Math.abs(b.z - a.z) * 1500;
};

const isFinal = (c: {cx: number; cy: number; z: number}) =>
	Math.abs(c.cx - FINAL_CAMERA.cx) < 5 && Math.abs(c.cy - FINAL_CAMERA.cy) < 5 && Math.abs(c.z - FINAL_CAMERA.z) < 2e-3;

for (let f = 0; f < TOTAL_FRAMES; f++) {
	if (speed(f) > MOVING) continue;
	const cam = cameraAt(f);
	// Plan final = l'affiche d'origine pleine largeur : ses bords perdus touchent le cadre par conception.
	if (isFinal(cam)) continue;
	for (const r of REVEALS) {
		if (f < r.at) continue;
		const e = ELEMENTS.find((x) => x.id === r.id)!;
		const v = e.visible;
		const s = toScreen(cam, v.x, v.y, v.width, v.height, r.depth);
		const right = s.left + s.width;
		const bottom = s.top + s.height;
		const visible = right > 0 && s.left < VIDEO.width && bottom > 0 && s.top < VIDEO.height;
		if (!visible) continue;
		if (r.id === 'pupitre') {
			const cropped = r.cropBottom && f < r.cropBottom.releaseAt ? r.cropBottom.doc * cam.z : 0;
			if (s.left > -TOL) add('bord gauche du pupitre visible', f);
			if (bottom - cropped < VIDEO.height - TOL && cropped > 0) add('pied coupé du pupitre visible', f);
			continue;
		}
		if (NOT_TEXT.has(r.id)) continue;
		const inside = s.left >= -TOL && s.top >= -TOL && right <= VIDEO.width + TOL && bottom <= VIDEO.height + TOL;
		if (!inside) add(`${r.id} coupé`, f);
	}
}

const ranges = (fs: number[]) => {
	const out: string[] = [];
	let a = fs[0];
	let p = fs[0];
	for (const f of [...fs.slice(1), Infinity]) {
		if (f !== p + 1) {
			out.push(a === p ? `${a}` : `${a}–${p}`);
			a = f;
		}
		p = f;
	}
	return out.join(', ');
};

const keys = Object.keys(issues);
for (const k of keys) console.log(`${k} : images ${ranges(issues[k])}`);
console.log(keys.length ? `${keys.length} défaut(s) de cadrage sur plans tenus` : 'cadrage OK : aucun texte coupé sur les plans tenus');
process.exit(keys.length ? 1 : 0);
