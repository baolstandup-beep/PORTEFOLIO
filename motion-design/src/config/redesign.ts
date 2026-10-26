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

const {scenes, total} = chain<'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5'>([
	['S0', 70, 'Intro : animation du logo'],
	['S1', 100, 'Accroche : titre et plateforme'],
	['S2', 165, 'Le rendez-vous : date, lieu, pupitre'],
	['S3', 466, 'Le programme détaillé'],
	['S4', 140, 'Contacts'],
	['S5', 100, "Retour à l'affiche d'origine"],
]);

export const SCENES = scenes;
export const REDESIGN_FRAMES = total;
const S = scenes;

// ------------------------------------------------------------ S1 + S2 : titre, identité, rendez-vous
const TITLE_A = {conf: {cx: 540, cy: 820, s: 0.62}, presse: {cx: 540 + 182 * 0.62, cy: 820 + 271 * 0.62, s: 0.62}};
const TITLE_B = {conf: {cx: 540, cy: 300, s: 0.5}, presse: {cx: 540 + 182 * 0.5, cy: 300 + 271 * 0.5, s: 0.5}};
const S1_IN = S.S1.from;
const S2_IN = S.S2.from;
const S3_IN = S.S3.from;

// ------------------------------------------------------------ S0 : intro logo (voir components/IntroLogo.tsx)
export const INTRO_LOGO = {
	big: {cx: 540, cy: 900, s: 1.7}, // le logo ne fait que 286 px dans le PSD : au-delà, il devient flou
	rest: {cx: 540, cy: 400, s: 0.85}, // place du logo pendant la scène 1
	coreAt: 0,
	ringAt: 8,
	waveAt: 38,
	glintAt: 44,
	moveAt: S1_IN - 8,
	moveDur: 30,
	exitAt: S2_IN,
	exitDur: 20,
};

const intro: PieceSpec[] = [
	{
		id: 'titre-conference',
		el: 'titre-conference',
		enter: {at: S1_IN + 14, dur: 30, preset: 'rise'},
		exit: {at: S3_IN, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, ...TITLE_A.conf}, {f: S2_IN, ...TITLE_A.conf}, {f: S2_IN + 32, ...TITLE_B.conf}],
		sweep: {at: S1_IN + 60, dur: 34},
		z: 5,
	},
	{
		id: 'titre-de-presse',
		el: 'titre-de-presse',
		enter: {at: S1_IN + 26, dur: 30, preset: 'rise'},
		exit: {at: S3_IN + 3, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, ...TITLE_A.presse}, {f: S2_IN + 3, ...TITLE_A.presse}, {f: S2_IN + 35, ...TITLE_B.presse}],
		z: 5,
	},
	{
		id: 'bandeau-plateforme',
		el: 'bandeau-plateforme',
		enter: {at: S1_IN + 40, dur: 30, preset: 'wipeRight'},
		exit: {at: S2_IN + 4, dur: 20, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 610, s: 0.76}],
	},
	{
		// « Samedi 31 Oct 2026 », découpé dans la pastille date (fond bleu d'origine).
		id: 'date-jour',
		el: 'info-date',
		crop: {x: 412, y: 1048, w: 892, h: 146},
		enter: {at: S2_IN + 34, dur: 28, preset: 'wipeRight'},
		exit: {at: S3_IN + 6, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 640, s: 0.95}],
		radius: 73,
		push: 1.03,
		z: 4,
	},
	{
		// « à partir 16h30 », découpé dans la même pastille.
		id: 'date-heure',
		el: 'info-date',
		crop: {x: 1316, y: 1048, w: 716, h: 146},
		enter: {at: S2_IN + 50, dur: 28, preset: 'wipeRight'},
		exit: {at: S3_IN + 8, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 800, s: 0.95}],
		radius: 73,
		push: 1.03,
		sweep: {at: S2_IN + 90, dur: 34},
		z: 4,
	},
	{
		id: 'info-lieu',
		el: 'info-lieu',
		enter: {at: S2_IN + 72, dur: 26, preset: 'slideUp'},
		exit: {at: S3_IN + 9, dur: 22, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 955, s: 0.78}],
		push: 1.02,
		z: 4,
	},
	{
		// Bord gauche (bord perdu) et pied (coupé) du pupitre gardés hors cadre.
		id: 'pupitre',
		el: 'pupitre',
		enter: {at: S2_IN + 44, dur: 48, preset: 'rise'},
		exit: {at: S3_IN, dur: 30, preset: 'sinkDown'},
		keys: [{f: 0, cx: -40 + 666 / 2, cy: 1080 + 1657 / 2, s: 1}],
		z: 3,
	},
];

// ------------------------------------------------------------ S3 : programme détaillé
// Chaque ligne du programme est découpée en deux zones de la même image :
// l'horaire (avec sa flèche) et l'intitulé (avec l'intervenant éventuel).
// 1) Plans vedettes : un point à la fois, horaire en très grand.
// 2) Récapitulatif : les 9 cartes sur une frise verticale, arrivée accélérée.
const TIME_X = [655, 1115] as const;
const TEXT_X0 = 1120;
const HERO_TEXT_X0 = 1138;
const TIME_H = 52;

const rows = PROGRAMME_ROWS.map((id, i) => {
	const v = getElement(id).visible;
	return {
		id,
		i,
		time: {x: TIME_X[0], y: v.y - 6, w: TIME_X[1] - TIME_X[0], h: TIME_H},
		text: {x: TEXT_X0, y: v.y - 6, w: v.x + v.width + 10 - TEXT_X0, h: v.height + 12},
	};
});

export const PROG = {
	headerAt: S3_IN + 16,
	dotsAt: S3_IN + 30,
	heroStart: S3_IN + 50,
	heroStep: 32,
};
export const HERO_AT = rows.map((r) => PROG.heroStart + r.i * PROG.heroStep);
export const RECAP_AT = PROG.heroStart + rows.length * PROG.heroStep;
// Arrivée de plus en plus rapide (intervalles 10, 9, 8 … images).
const RECAP_DELAYS = [0, 10, 19, 27, 34, 40, 45, 49, 52];
export const RECAP_CARD_AT = RECAP_DELAYS.map((d) => RECAP_AT + d);

// Plans vedettes
export const HERO = {timeCy: 800, timeS: 1.7, textTop: 905, textMaxW: 920, textMaxS: 1.8, underlineY: 868};
const heroText = (w: number) => Math.min(HERO.textMaxS, HERO.textMaxW / w);

const heroes: PieceSpec[] = rows.flatMap((r): PieceSpec[] => {
	const at = HERO_AT[r.i];
	const ts = heroText(r.text.w - (HERO_TEXT_X0 - TEXT_X0));
	const exit = {at: at + 28, dur: 8, preset: 'fadeUp' as const};
	return [
		{
			id: `${r.id}-vedette-horaire`,
			el: r.id,
			crop: r.time,
			enter: {at, dur: 14, preset: 'rowIn'},
			exit,
			keys: [{f: 0, cx: 540, cy: HERO.timeCy, s: HERO.timeS}],
			push: 1.03,
			z: 6,
		},
		{
			id: `${r.id}-vedette-intitule`,
			el: r.id,
			// Découpe resserrée à gauche pour centrer exactement l'intitulé.
			crop: {...r.text, x: HERO_TEXT_X0, w: r.text.w - (HERO_TEXT_X0 - TEXT_X0)},
			enter: {at: at + 5, dur: 16, preset: 'rise'},
			exit,
			keys: [{f: 0, cx: 540, cy: HERO.textTop + (r.text.h * ts) / 2, s: ts}],
			push: 1.02,
			z: 6,
		},
	];
});

// Récapitulatif : taille calculée pour que les 9 cartes tiennent sans défilement.
export const RECAP = {top: 410, bottom: 1590, left: 130, gap: 18, lineX: 88};
const recapS = Math.min(
	0.85,
	(RECAP.bottom - RECAP.top - (rows.length - 1) * RECAP.gap - rows.length * 6) /
		rows.reduce((a, r) => a + TIME_H + r.text.h, 0),
);
let cursor = RECAP.top;
export const RECAP_CARDS = rows.map((r) => {
	const top = cursor;
	const height = TIME_H * recapS + 6 + r.text.h * recapS;
	cursor += height + RECAP.gap;
	return {id: r.id, top, height, dotY: top + (TIME_H * recapS) / 2};
});

const recap: PieceSpec[] = rows.flatMap((r): PieceSpec[] => {
	const c = RECAP_CARDS[r.i];
	const at = RECAP_CARD_AT[r.i];
	const exit = {at: S.S4.from + r.i * 2, dur: 18, preset: 'fadeUp' as const};
	return [
		{
			id: `${r.id}-carte-horaire`,
			el: r.id,
			crop: r.time,
			enter: {at, dur: 16, preset: 'rowIn'},
			exit,
			keys: [{f: 0, cx: RECAP.left + (r.time.w * recapS) / 2, cy: c.top + (TIME_H * recapS) / 2, s: recapS}],
			z: 6,
		},
		{
			id: `${r.id}-carte-intitule`,
			el: r.id,
			crop: r.text,
			enter: {at: at + 3, dur: 16, preset: 'rowIn'},
			exit,
			keys: [
				{
					f: 0,
					cx: RECAP.left - (1146 - TEXT_X0) * recapS + (r.text.w * recapS) / 2,
					cy: c.top + TIME_H * recapS + 6 + (r.text.h * recapS) / 2,
					s: recapS,
				},
			],
			z: 6,
		},
	];
});

const programme: PieceSpec[] = [
	{
		id: 'programme-titre',
		el: 'programme-titre',
		enter: {at: PROG.headerAt, dur: 24, preset: 'scaleIn'},
		exit: {at: S.S4.from, dur: 20, preset: 'fadeUp'},
		keys: [{f: 0, cx: 540, cy: 290, s: 0.7}],
		sweep: {at: PROG.headerAt + 26, dur: 30},
		z: 6,
	},
	...heroes,
	...recap,
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
	enter: {at: S1_IN, dur: 60, preset: 'wipeDown'},
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
	{from: 0, src: sfx('impact-deep-whoosh'), volume: 0.42, durationInFrames: 60, note: "l'emblème du logo apparaît"},
	{from: INTRO_LOGO.ringAt, src: sfx('swoosh-slow'), volume: 0.25, durationInFrames: 36, note: "l'anneau du logo se dessine"},
	{from: INTRO_LOGO.waveAt, src: sfx('bass-hit-short'), volume: 0.35, note: 'onde, logo complet'},
	{from: INTRO_LOGO.glintAt, src: sfx('sparkle-touch'), volume: 0.2, durationInFrames: 40, note: 'reflet sur le logo'},
	{from: INTRO_LOGO.moveAt, src: sfx('air-woosh-quick'), volume: 0.28, note: 'le logo monte à sa place'},
	{from: S1_IN + 14, src: sfx('sweep-short'), volume: 0.3, note: 'le titre monte'},
	{from: S1_IN + 60, src: sfx('shimmer-sparkle-sweep'), volume: 0.2, durationInFrames: 50, note: 'reflet sur le titre'},
	{from: S2_IN, src: sfx('air-woosh-quick'), volume: 0.32, note: 'le titre monte en tête'},
	{from: S2_IN + 34, src: sfx('sweep-short'), volume: 0.35, note: 'pastille jour'},
	{from: S2_IN + 50, src: sfx('sweep-short'), volume: 0.28, note: 'pastille heure'},
	{from: S2_IN + 44, src: sfx('swoosh-slow'), volume: 0.28, durationInFrames: 55, note: 'le pupitre monte'},
	{from: S2_IN + 72, src: sfx('paper-move-quick'), volume: 0.26, note: 'encart lieu'},
	{from: S2_IN + 90, src: sfx('sparkle-touch'), volume: 0.18, durationInFrames: 40, note: "reflet sur l'heure"},
	{from: S3_IN, src: sfx('air-woosh-quick'), volume: 0.35, note: 'changement de scène'},
	{from: PROG.headerAt + 4, src: sfx('hit-weak'), volume: 0.35, note: 'pastille PROGRAMME'},
	// Plans vedettes : un son par point, deux échantillons alternés, volume dégressif.
	...HERO_AT.map(
		(at, i): RedesignSfx => ({
			from: at,
			src: sfx(i % 2 === 0 ? 'sweep-short' : 'air-woosh-quick'),
			volume: Number((0.3 - i * 0.012).toFixed(3)),
			durationInFrames: 24,
			note: `point de programme ${i + 1}`,
		}),
	),
	{from: RECAP_AT - 4, src: sfx('swoosh-slow'), volume: 0.3, durationInFrames: 45, note: 'récapitulatif'},
	...RECAP_CARD_AT.map(
		(at, i): RedesignSfx => ({
			from: at,
			src: sfx(i % 2 === 0 ? 'paper-move-quick' : 'paper-slide'),
			volume: Number((0.2 - i * 0.012).toFixed(3)),
			durationInFrames: 14,
			note: `carte récapitulative ${i + 1}`,
		}),
	),
	{from: RECAP_CARD_AT[8] + 16, src: sfx('hit-weak'), volume: 0.32, note: 'liste complète'},
	{from: S4_IN, src: sfx('air-woosh-quick'), volume: 0.32, note: 'changement de scène'},
	{from: S4_IN + 22, src: sfx('swoosh-slow'), volume: 0.25, durationInFrames: 40, note: 'panneau vert'},
	{from: S4_IN + 80, src: sfx('sparkle-touch'), volume: 0.2, durationInFrames: 40, note: 'reflet Rejoignez-nous'},
	{from: S5_IN, src: sfx('swoosh-slow'), volume: 0.38, durationInFrames: 60, note: "l'affiche se recompose"},
	{from: S5_IN + 40, src: sfx('bass-hit-short'), volume: 0.45, note: 'affiche complète (point culminant)'},
];
