// Timeline centrale : seule source de vérité pour les plans, la caméra, les
// apparitions, la voix off et les effets sonores. Tout est en images (30 i/s)
// et exprimé relativement au début de chaque plan (SHOTS.x.from + décalage),
// pour qu'un plan rallongé décale automatiquement tout ce qui suit.
import type {ElementId} from './assets';
import {PROGRAMME_ROWS} from './assets';
import {DOC, VIDEO} from './video';
import voiceover from './voiceover.json';
import voiceDurations from './voiceover.generated.json';

export const sec = (s: number) => Math.round(s * VIDEO.fps);

type ShotDef = {from: number; duration: number; title: string};

const chain = <K extends string>(defs: [K, number, string][]) => {
	let t = 0;
	const out = {} as Record<K, ShotDef>;
	for (const [id, duration, title] of defs) {
		out[id] = {from: t, duration, title};
		t += duration;
	}
	return {shots: out, total: t};
};

// Durées calées sur la voix off (voir output/analysis/tiktok_shot_list.md).
const {shots, total} = chain<'P1' | 'P2' | 'P3' | 'P4' | 'P5'>([
	['P1', 90, 'Accroche : le titre'],
	['P2', 135, 'Identité : logo, plateforme et pupitre'],
	['P3', 282, 'Le rendez-vous : gros plan pupitre, date et lieu'],
	['P4', 330, 'Le programme'],
	['P5', 170, 'Plan final : composition complète et contacts'],
]);

export const SHOTS = shots;
export const TOTAL_FRAMES = total;
const S = SHOTS;

// ---------------------------------------------------------------- Caméra
// cx, cy : point du document au centre de l'écran ; z : pixels écran par pixel document.
export type CameraKey = {
	frame: number;
	cx: number;
	cy: number;
	z: number;
	// Courbe utilisée pour aller de la clé précédente à celle-ci.
	ease?: 'inOut' | 'out' | 'linear';
};

// Plan final : l'affiche entière, pleine largeur, centrée verticalement.
export const FINAL_CAMERA = {cx: DOC.width / 2, cy: 1600, z: VIDEO.width / DOC.width};

export const CAMERA_KEYS: CameraKey[] = [
	// P1 — accroche : le titre seul, léger travelling avant.
	// Titre ≤ 920 px de large : marges latérales ≥ 80 px.
	{frame: S.P1.from, cx: 1232, cy: 844, z: 0.6},
	{frame: S.P1.from + 90, cx: 1232, cy: 844, z: 0.615, ease: 'linear'},
	// P2 — recul : logo, plateforme et titre entiers ; le bord gauche du pupitre
	// (bord perdu de l'affiche) reste juste hors cadre.
	{frame: S.P2.from + 45, cx: 1104, cy: 827, z: 0.5},
	{frame: S.P2.from + S.P2.duration, cx: 1104, cy: 822, z: 0.51, ease: 'linear'},
	// Règle de cadrage : sur les plans tenus, chaque texte visible est entier
	// (vérifié par scripts/check-framing.ts).
	// P3 — insert sur le pupitre (sujet principal) : cadre entre le bas de
	// « de presse » (y 1013) et le pied du pupitre ; aucun texte dans le champ.
	{frame: S.P3.from + 38, cx: 580, cy: 1880, z: 1.15},
	{frame: S.P3.from + 55, cx: 580, cy: 1874, z: 1.17, ease: 'linear'},
	// Date et lieu en plan large : la pastille date (1713 px) ne tient entière
	// qu'à z ≤ 0,63 ; logo, plateforme, titre, date et lieu sont tous entiers.
	{frame: S.P3.from + 92, cx: 1098, cy: 1000, z: 0.55},
	{frame: S.P3.from + S.P3.duration, cx: 1098, cy: 992, z: 0.558, ease: 'linear'},
	// P4 — le programme : liste cadrée sur toute sa largeur, la date juste au-dessus
	// du cadre et le lieu entier en haut (fenêtre de cy très étroite, ne pas élargir).
	{frame: S.P4.from + 45, cx: 1400, cy: 2530, z: 0.725},
	{frame: S.P4.from + S.P4.duration, cx: 1400, cy: 2533, z: 0.725, ease: 'linear'},
	// P5 — recul vers la composition complète puis stabilisation.
	{frame: S.P5.from + 70, ...FINAL_CAMERA},
	{frame: total, ...FINAL_CAMERA, ease: 'linear'},
];

// ---------------------------------------------------------------- Apparitions
export type RevealPreset =
	| 'rise' // monte depuis une ligne de masque (sous l'élément)
	| 'wipeRight' // révélation gauche → droite
	| 'wipeDown' // révélation haut → bas
	| 'scaleIn' // léger zoom + fondu
	| 'slideUp' // translation verticale courte + fondu
	| 'rowIn'; // ligne de programme : masque gauche → droite + glissé

export type Reveal = {
	id: ElementId;
	shot: keyof typeof SHOTS;
	at: number;
	duration: number;
	preset: RevealPreset;
	// Profondeur de parallaxe (0 = plan de l'affiche, > 0 = plus proche).
	depth?: number;
	// Rogne le bas de l'élément (px document) puis le libère progressivement.
	cropBottom?: {doc: number; releaseAt: number; releaseDuration: number};
};

// Les lignes 1 à 4 défilent vite ; les lignes 4 à 7 apparaissent quand la voix
// les annonce (voir VO_START) ; 8 et 9 terminent la liste.
// Le bandeau contacts (P5) recouvre le pied du pupitre : on cache ce pied tant
// que le bandeau n'est pas là (zone non visible dans l'original, voir rapport).
const FOOTER_AT = S.P5.from + 26;
const FOOTER_DURATION = 32;

const ROW_AT = [46, 57, 68, 79, 124, 193, 258, 292, 303].map((o) => S.P4.from + o);

export const REVEALS: Reveal[] = [
	// Démarre avant l'image 0 : la première image montre déjà le titre en mouvement.
	{id: 'titre-conference', shot: 'P1', at: S.P1.from - 14, duration: 30, preset: 'rise'},
	{id: 'titre-de-presse', shot: 'P1', at: S.P1.from + 4, duration: 30, preset: 'rise'},
	{id: 'logo-paspas', shot: 'P2', at: S.P2.from + 14, duration: 28, preset: 'scaleIn'},
	{id: 'bandeau-plateforme', shot: 'P2', at: S.P2.from + 28, duration: 30, preset: 'wipeRight'},
	{
		id: 'pupitre',
		shot: 'P2',
		at: S.P2.from + 40,
		duration: 48,
		preset: 'rise',
		depth: 0.1,
		cropBottom: {doc: 37, releaseAt: FOOTER_AT, releaseDuration: FOOTER_DURATION},
	},
	{id: 'info-date', shot: 'P3', at: S.P3.from + 58, duration: 30, preset: 'wipeRight'},
	{id: 'info-lieu', shot: 'P3', at: S.P3.from + 196, duration: 24, preset: 'slideUp'},
	{id: 'colonne-motifs', shot: 'P4', at: S.P4.from + 10, duration: 60, preset: 'wipeDown', depth: 0.06},
	{id: 'programme-titre', shot: 'P4', at: S.P4.from + 26, duration: 24, preset: 'scaleIn'},
	...PROGRAMME_ROWS.map((id, i): Reveal => ({id, shot: 'P4', at: ROW_AT[i], duration: 22, preset: 'rowIn'})),
	{id: 'bandeau-contacts', shot: 'P5', at: FOOTER_AT, duration: FOOTER_DURATION, preset: 'rise'},
];

// Un seul reflet lumineux par plan, réservé au sujet du plan.
export const LIGHT_SWEEPS: {id: ElementId; at: number; duration: number}[] = [
	{id: 'titre-conference', at: S.P1.from + 46, duration: 34},
	{id: 'logo-paspas', at: S.P5.from + 100, duration: 34},
];

// ---------------------------------------------------------------- Voix off
// Début de chaque réplique ; les durées viennent de voiceover.generated.json.
const VO_START: Record<string, number> = {
	'vo-01': S.P1.from + 12,
	'vo-02': S.P2.from + 2,
	'vo-03a': S.P3.from + 62,
	'vo-03b': S.P3.from + 160,
	'vo-03c': S.P3.from + 212,
	'vo-04a': S.P4.from + 34,
	'vo-04b': ROW_AT[3] - 13, // « doctrine… » : ligne 4
	'vo-04c': ROW_AT[4] + 6, // ligne 5
	'vo-04d': ROW_AT[5] + 6, // ligne 6
	'vo-04e': ROW_AT[6] + 6, // ligne 7
	'vo-05': S.P5.from + 12,
};

export type VoiceCue = {id: string; shot: string; text: string; from: number; duration: number; src: string};

export const VOICE_CUES: VoiceCue[] = voiceover.cues.map((c) => ({
	id: c.id,
	shot: c.shot,
	text: c.text,
	from: VO_START[c.id],
	duration: (voiceDurations as Record<string, {frames: number}>)[c.id].frames,
	src: `assets/audio/voice/${c.id}.wav`,
}));

// ---------------------------------------------------------------- Musique
export const MUSIC = {
	src: 'assets/audio/music/house-vibez.mp3',
	volume: 0.3, // hors voix off (quand la voix off est active)
	volumeNoVoice: 0.5, // version sans voix off (par défaut)
	duckedVolume: 0.1, // pendant la voix off
	duckFrames: 8, // durée de la transition de ducking
	fadeIn: 20,
	fadeOut: 50,
};

// ---------------------------------------------------------------- Effets sonores
export type SfxCue = {from: number; src: string; volume: number; durationInFrames?: number; note: string};

const sfx = (name: string) => `assets/audio/sfx/${name}.mp3`;

export const SFX: SfxCue[] = [
	{from: S.P1.from, src: sfx('impact-deep-whoosh'), volume: 0.45, durationInFrames: 70, note: 'le titre monte'},
	{from: S.P1.from + 46, src: sfx('shimmer-sparkle-sweep'), volume: 0.22, durationInFrames: 50, note: 'reflet sur « Conférence »'},
	{from: S.P2.from, src: sfx('air-woosh-quick'), volume: 0.3, note: 'recul caméra vers le logo'},
	{from: S.P2.from + 26, src: sfx('hit-weak'), volume: 0.3, note: 'le logo se pose'},
	{from: S.P3.from, src: sfx('air-woosh-quick'), volume: 0.38, note: 'plongée vers le pupitre'},
	{from: S.P2.from + 40, src: sfx('swoosh-slow'), volume: 0.3, durationInFrames: 55, note: 'le pupitre monte'},
	{from: S.P3.from + 58, src: sfx('sweep-short'), volume: 0.35, note: 'la pastille date se déroule'},
	{from: S.P3.from + 125, src: sfx('air-woosh-quick'), volume: 0.18, note: 'panoramique vers l’heure'},
	{from: S.P3.from + 196, src: sfx('paper-move-quick'), volume: 0.28, note: 'encart lieu'},
	{from: S.P4.from, src: sfx('air-woosh-quick'), volume: 0.32, note: 'caméra vers le programme'},
	{from: S.P4.from + 32, src: sfx('hit-weak'), volume: 0.35, note: 'pastille PROGRAMME'},
	// Lignes : deux échantillons en alternance, volume dégressif (pas d'effet mitraillette).
	...PROGRAMME_ROWS.map(
		(_, i): SfxCue => ({
			from: ROW_AT[i],
			src: sfx(i % 2 === 0 ? 'paper-move-quick' : 'paper-slide'),
			volume: Number((0.26 - i * 0.015).toFixed(3)),
			durationInFrames: 20,
			note: `ligne de programme ${i + 1}`,
		}),
	),
	{from: S.P5.from, src: sfx('swoosh-slow'), volume: 0.4, durationInFrames: 80, note: 'recul vers le plan final'},
	{from: S.P5.from + 56, src: sfx('bass-hit-short'), volume: 0.45, note: 'le bandeau contacts se pose (point culminant)'},
	{from: S.P5.from + 100, src: sfx('sparkle-touch'), volume: 0.22, durationInFrames: 45, note: 'reflet sur le logo'},
];
