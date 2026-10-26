// Version « redesign » 9:16 : les éléments du PSD sont recomposés pour le format
// vertical. Aucune donnée n'est modifiée : chaque texte, chiffre et logo est une
// image extraite du PSD (ou une zone découpée dans une de ces images).
// Toutes les positions sont en pixels écran (1080 × 1920), centre de la pièce.
import type {ElementId} from './assets';
import {ELEMENTS, getElement, PROGRAMME_ROWS} from './assets';
import type {PieceSpec} from '../components/Piece';
import {FINAL_CAMERA} from './timeline';
import {VIDEO} from './video';

type SceneDef = {from: number; duration: number; title: string};

const chain = <K extends string>(defs: [K, number, string][]) => {
	let t = 0;
	const out = {} as Record<K, SceneDef>;
	for (const [id, duration, title] of defs) {
		out[id] = {from: t, duration, title};
		t += duration;
	}
	return {scenes: out, total: t};
};

const {scenes, total} = chain<'S1' | 'S2' | 'S3' | 'S4' | 'S5'>([
	['S1', 120, 'Accroche : titre, logo, plateforme'],
	['S2', 180, 'Le rendez-vous : date, lieu, pupitre'],
	['S3', 420, 'Le programme détaillé'],
	['S4', 150, 'Contacts'],
	['S5', 120, "Retour à l'affiche d'origine"],
]);

export const SCENES = scenes;
export const REDESIGN_FRAMES = total;
const S = scenes;

// ------------------------------------------------------------ S1 + S2 : titre, identité, rendez-vous
const TITLE_A = {conf: {cx: 540, cy: 820, s: 0.62}, presse: {cx: 540 + 182 * 0.62, cy: 820 + 271 * 0.62, s: 0.62}};
const TITLE_B = {conf: {cx: 540, cy: 300, s: 0.5}, presse: {cx: 540 + 182 * 0.5, cy: 300 + 271 * 0.5, s: 0.5}};
const S2_IN = S.S2.from;
const S3_IN = S.S3.from;

const intro: PieceSpec[] = [
	{
		id: 'titre-conference',
		el: 'titre-conference',
		enter: {at: -12, dur: 30, preset: 'rise'},
		exit: {at: S3_IN, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, ...TITLE_A.conf}, {f: S2_IN, ...TITLE_A.conf}, {f: S2_IN + 32, ...TITLE_B.conf}],
		sweep: {at: 70, dur: 34},
		z: 5,
	},
	{
		id: 'titre-de-presse',
		el: 'titre-de-presse',
		enter: {at: 6, dur: 30, preset: 'rise'},
		exit: {at: S3_IN + 3, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, ...TITLE_A.presse}, {f: S2_IN + 3, ...TITLE_A.presse}, {f: S2_IN + 35, ...TITLE_B.presse}],
		z: 5,
	},
	{
		id: 'logo-paspas',
		el: 'logo-paspas',
		enter: {at: 40, dur: 26, preset: 'scaleIn'},
		exit: {at: S2_IN, dur: 20, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 400, s: 0.85}],
		float: 4,
	},
	{
		id: 'bandeau-plateforme',
		el: 'bandeau-plateforme',
		enter: {at: 54, dur: 30, preset: 'wipeRight'},
		exit: {at: S2_IN + 4, dur: 20, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 610, s: 0.76}],
	},
	{
		id: 'info-date',
		el: 'info-date',
		enter: {at: S2_IN + 34, dur: 30, preset: 'wipeRight'},
		exit: {at: S3_IN + 6, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 690, s: 0.55}],
		sweep: {at: S2_IN + 80, dur: 34},
		z: 4,
	},
	{
		id: 'info-lieu',
		el: 'info-lieu',
		enter: {at: S2_IN + 62, dur: 26, preset: 'slideUp'},
		exit: {at: S3_IN + 9, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 830, s: 0.75}],
		z: 4,
	},
	{
		// Bord gauche (bord perdu) et pied (coupé) du pupitre gardés hors cadre.
		id: 'pupitre',
		el: 'pupitre',
		enter: {at: S2_IN + 44, dur: 48, preset: 'rise'},
		exit: {at: S3_IN, dur: 30, preset: 'sinkDown'},
		keys: [{f: 0, cx: -40 + 666 / 2, cy: 1000 + 1657 / 2, s: 1}],
		z: 3,
	},
];

// ------------------------------------------------------------ S3 : programme détaillé
// Chaque ligne du programme est découpée en deux zones de la même image :
// l'horaire (avec sa flèche) et l'intitulé (avec l'intervenant éventuel),
// recomposées en carte verticale plus grande que sur l'affiche.
const CARD_S = 0.9;
const CARD_LEFT = 84;
const TIME_X = [655, 1115] as const;
const TEXT_X = [1120, 2145] as const;
const TIME_H = 52;
const LIST_TOP = 400; // haut de la zone de liste (sous la pastille PROGRAMME)
const LIST_BOTTOM = 1600; // au-delà : marge basse d'interface TikTok
const CARD_GAP = 34;

export const ROW_AT = PROGRAMME_ROWS.map((_, i) => S3_IN + 52 + i * 34);

type Card = {id: ElementId; top: number; height: number; time: PieceSpec; text: PieceSpec};

let cursor = 0;
const cardsBase = PROGRAMME_ROWS.map((id, i) => {
	const v = getElement(id).visible;
	const timeCrop = {x: TIME_X[0], y: v.y - 6, w: TIME_X[1] - TIME_X[0], h: TIME_H};
	const textCrop = {x: TEXT_X[0], y: v.y - 6, w: TEXT_X[1] - TEXT_X[0], h: v.height + 12};
	const top = cursor;
	const height = TIME_H * CARD_S + 6 + textCrop.h * CARD_S;
	cursor += height + CARD_GAP;
	return {id, i, top, height, timeCrop, textCrop};
});

/**
 * Défilement de la liste : remonte pour garder la dernière carte apparue dans le
 * cadre, en s'arrêtant toujours sur le haut d'une carte (aucune carte à moitié
 * masquée sous la pastille PROGRAMME pendant les tenues).
 */
const snapTarget = (needed: number) => {
	if (needed <= 0) return 0;
	const card = cardsBase.find((c) => c.top >= needed);
	return card ? card.top : needed;
};

export const listScroll = (f: number) => {
	let y = 0;
	for (const c of cardsBase) {
		const target = snapTarget(LIST_TOP + c.top + c.height - LIST_BOTTOM);
		const at = ROW_AT[c.i] - 8;
		const p = Math.min(1, Math.max(0, (f - at) / 24));
		const e = p * p * (3 - 2 * p);
		y = y + (target - y) * e;
	}
	return -y;
};

const listExit = (i: number) => ({at: S.S4.from + i * 2, dur: 20, preset: 'fadeUp' as const});

export const CARDS: Card[] = cardsBase.map((c) => ({
	id: c.id,
	top: c.top,
	height: c.height,
	time: {
		id: `${c.id}-horaire`,
		el: c.id,
		crop: c.timeCrop,
		enter: {at: ROW_AT[c.i], dur: 22, preset: 'rowIn'},
		exit: listExit(c.i),
		keys: [{f: 0, cx: CARD_LEFT + (c.timeCrop.w * CARD_S) / 2, cy: LIST_TOP + c.top + (TIME_H * CARD_S) / 2, s: CARD_S}],
		scrollY: listScroll,
	},
	text: {
		id: `${c.id}-intitule`,
		el: c.id,
		crop: c.textCrop,
		enter: {at: ROW_AT[c.i] + 6, dur: 24, preset: 'rowIn'},
		exit: listExit(c.i),
		keys: [
			{
				f: 0,
				cx: CARD_LEFT - (TEXT_X[0] - 1146) * CARD_S + (c.textCrop.w * CARD_S) / 2,
				cy: LIST_TOP + c.top + TIME_H * CARD_S + 6 + (c.textCrop.h * CARD_S) / 2,
				s: CARD_S,
			},
		],
		scrollY: listScroll,
	},
}));

export const CARD_ACCENT = {x: 56, width: 6};
export const LIST_VIEW = {top: LIST_TOP - 30, fade: 40};

const programme: PieceSpec[] = [
	{
		id: 'programme-titre',
		el: 'programme-titre',
		enter: {at: S3_IN + 24, dur: 24, preset: 'scaleIn'},
		exit: {at: S.S4.from, dur: 20, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 280, s: 0.7}],
		sweep: {at: S3_IN + 50, dur: 30},
		z: 6,
	},
];

// ------------------------------------------------------------ S4 : contacts
// Le bandeau vert est découpé en zones (coordonnées document relevées sur le PSD)
// puis empilé verticalement sur un panneau du même vert.
const S4_IN = S.S4.from;
const FOOT = 'bandeau-contacts' as const;
const CONTACT_S = 1.0;
const contactZones: {id: string; crop: {x: number; y: number; w: number; h: number}; cy: number}[] = [
	{id: 'contact-rejoignez', crop: {x: 112, y: 2766, w: 656, h: 132}, cy: 760},
	{id: 'contact-adresse', crop: {x: 790, y: 2820, w: 556, h: 84}, cy: 900},
	{id: 'contact-site', crop: {x: 1342, y: 2820, w: 606, h: 84}, cy: 1000},
	{id: 'contact-telephone', crop: {x: 44, y: 2908, w: 652, h: 84}, cy: 1100},
	{id: 'contact-email', crop: {x: 790, y: 2908, w: 880, h: 84}, cy: 1200},
	{id: 'contact-reseaux', crop: {x: 1748, y: 2918, w: 252, h: 64}, cy: 1305},
];

export const CONTACT_PANEL = {
	rect: {x: 70, y: 670, w: 940, h: 720},
	at: S4_IN + 22,
	dur: 26,
	exit: {at: S.S5.from, dur: 20, preset: 'fade' as const},
};

const contacts: PieceSpec[] = [
	{
		id: 'logo-contacts',
		el: 'logo-paspas',
		enter: {at: S4_IN + 14, dur: 26, preset: 'scaleIn'},
		exit: {at: S.S5.from, dur: 20, preset: 'fade'},
		keys: [{f: 0, cx: 540, cy: 470, s: 0.7}],
		float: 3,
		z: 6,
	},
	...contactZones.map(
		(z, i): PieceSpec => ({
			id: z.id,
			el: FOOT,
			crop: z.crop,
			enter: {at: S4_IN + 40 + i * 9, dur: 24, preset: i === 0 ? 'scaleIn' : 'rowIn'},
			exit: {at: S.S5.from, dur: 20, preset: 'fade'},
			keys: [{f: 0, cx: 540, cy: z.cy, s: i === 0 ? 1.0 : CONTACT_S}],
			sweep: i === 0 ? {at: S4_IN + 80, dur: 30} : undefined,
			z: 6,
		}),
	),
];

// ------------------------------------------------------------ S5 : l'affiche d'origine
// Chaque calque revient à sa position exacte sur l'affiche, pleine largeur.
const S5_IN = S.S5.from;
const finalPos = (id: ElementId) => {
	const e = getElement(id);
	const z = FINAL_CAMERA.z;
	return {
		cx: (e.x + e.width / 2 - FINAL_CAMERA.cx) * z + VIDEO.width / 2,
		cy: (e.y + e.height / 2 - FINAL_CAMERA.cy) * z + VIDEO.height / 2,
		s: z,
	};
};
const poster: PieceSpec[] = ELEMENTS.map(
	(e, i): PieceSpec => ({
		id: `affiche-${e.id}`,
		el: e.id,
		enter: {at: S5_IN + 10 + Math.round(i * 1.6), dur: 22, preset: e.id === 'colonne-motifs' ? 'wipeDown' : 'scaleIn'},
		keys: [{f: 0, ...finalPos(e.id)}],
		z: 10 + e.zIndex,
	}),
);

export const PIECES: PieceSpec[] = [...intro, ...programme, ...contacts, ...poster];

// Colonne décorative : bord droit, à moitié hors champ, pendant S1–S4.
export const DECOR_COLUMN: PieceSpec = {
	id: 'colonne-decor',
	el: 'colonne-motifs',
	enter: {at: 10, dur: 60, preset: 'wipeDown'},
	exit: {at: S5_IN, dur: 16, preset: 'fade'},
	keys: [
		{f: 0, cx: 1080, cy: 1000, s: 0.72},
		{f: S5_IN, cx: 1080, cy: 900, s: 0.72},
	],
	z: 0,
};

// ------------------------------------------------------------ Son
const sfx = (name: string) => `assets/audio/sfx/${name}.mp3`;
export type RedesignSfx = {from: number; src: string; volume: number; durationInFrames?: number; note: string};

export const REDESIGN_SFX: RedesignSfx[] = [
	{from: 0, src: sfx('impact-deep-whoosh'), volume: 0.45, durationInFrames: 70, note: 'le titre monte'},
	{from: 40, src: sfx('hit-weak'), volume: 0.3, note: 'logo'},
	{from: 70, src: sfx('shimmer-sparkle-sweep'), volume: 0.22, durationInFrames: 50, note: 'reflet sur le titre'},
	{from: S2_IN, src: sfx('air-woosh-quick'), volume: 0.32, note: 'le titre monte en tête'},
	{from: S2_IN + 34, src: sfx('sweep-short'), volume: 0.35, note: 'pastille date'},
	{from: S2_IN + 44, src: sfx('swoosh-slow'), volume: 0.28, durationInFrames: 55, note: 'le pupitre monte'},
	{from: S2_IN + 62, src: sfx('paper-move-quick'), volume: 0.26, note: 'encart lieu'},
	{from: S2_IN + 80, src: sfx('sparkle-touch'), volume: 0.18, durationInFrames: 40, note: 'reflet sur la date'},
	{from: S3_IN, src: sfx('air-woosh-quick'), volume: 0.35, note: 'changement de scène'},
	{from: S3_IN + 28, src: sfx('hit-weak'), volume: 0.35, note: 'pastille PROGRAMME'},
	...ROW_AT.map(
		(at, i): RedesignSfx => ({
			from: at,
			src: sfx(i % 2 === 0 ? 'paper-move-quick' : 'paper-slide'),
			volume: Number((0.26 - i * 0.012).toFixed(3)),
			durationInFrames: 22,
			note: `carte programme ${i + 1}`,
		}),
	),
	{from: S4_IN, src: sfx('air-woosh-quick'), volume: 0.32, note: 'changement de scène'},
	{from: S4_IN + 22, src: sfx('swoosh-slow'), volume: 0.25, durationInFrames: 40, note: 'panneau vert'},
	{from: S4_IN + 80, src: sfx('sparkle-touch'), volume: 0.2, durationInFrames: 40, note: 'reflet Rejoignez-nous'},
	{from: S5_IN, src: sfx('swoosh-slow'), volume: 0.38, durationInFrames: 60, note: "l'affiche se recompose"},
	{from: S5_IN + 40, src: sfx('bass-hit-short'), volume: 0.45, note: 'affiche complète (point culminant)'},
];
