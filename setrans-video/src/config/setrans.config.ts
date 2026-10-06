/**
 * SETRANS — Film de lancement
 * ------------------------------------------------------------------
 * Fichier de configuration central. Tout ce qui se modifie souvent
 * (couleurs, textes, durées, tailles, chemins des médias) est ici.
 * Les chemins sont relatifs au dossier `public/`.
 */

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  /** Durée totale en secondes. Doit rester ≥ fin de la dernière scène. */
  durationInSeconds: 90,
  /** Chevauchement (fondu enchaîné) entre deux scènes, en secondes. */
  crossfade: 0.6,
};

export const COLORS = {
  blue: '#1C3F88', // Bleu principal SETRANS
  blueLight: '#3E66BF',
  blueGlow: '#7FA2E8',
  navy: '#0B1A3A', // Bleu profond
  night: '#050B1C', // Bleu nuit / noir bleuté
  white: '#FFFFFF',
  greyLight: '#E6EAF2',
  grey: '#9AA6BD',
  greyDark: '#4A5670',
  success: '#3FB984', // Utilisé avec parcimonie (validations)
  gold: '#E8C27A', // Lumière d'aube, très ponctuelle
};

export const FONTS = {
  title: 'Montserrat, Inter, sans-serif',
  body: 'Inter, Montserrat, sans-serif',
};

export const TYPE = {
  logo: 200, // SETRANS (révélation finale)
  hero: 120, // SETRANS (scène 08)
  title: 64,
  subtitle: 34,
  label: 26,
  small: 20,
  letterSpacingWide: '0.32em',
  letterSpacingTitle: '0.12em',
};

export const TEXTS = {
  brand: 'SETRANS',
  poles: ['TRANSIT', 'TRANSPORT', 'LOGISTIQUE'],
  customs: ['DOSSIER', 'CONTRÔLE', 'VALIDATION', 'AUTORISATION'],
  chain: ['NAVIRE', 'PORT', 'DOUANE', 'CONTENEUR', 'CAMION', 'CLIENT'],
  tracking: ['DOSSIER REÇU', 'EN TRAITEMENT', 'VALIDÉ', 'EN TRANSPORT', 'LIVRÉ'],
  trackingRef: 'SET-2026-TBA-00418',
  trackingRoute: 'DAKAR → TOUBA',
  activities: ['Commerçant', 'Entreprise', 'Entrepôt', 'Marchandises', 'Croissance'],
  cities: { dakar: 'DAKAR', touba: 'TOUBA' },
  tagline: 'TOUBA. CONNECTÉE AU MONDE.',
  polesLine: 'TRANSIT • TRANSPORT • LOGISTIQUE',
  slogan: 'Vos échanges, notre expertise.',
};

/**
 * Médias. Déposez vos fichiers dans `public/assets/...` puis
 * renseignez le chemin. `null` = élément désactivé.
 */
export const ASSETS = {
  /** Logo final (PNG/SVG, fond transparent). null = logo typographique. */
  logo: null as string | null, // ex. 'assets/logo/setrans-logo.png'
  /** Musique (MP3/WAV). null = pas de musique dans le rendu. */
  music: null as string | null, // ex. 'assets/music/theme.mp3'
  musicVolume: 0.6,
  /** Voix off complète (un seul fichier calé sur 0 s). */
  voiceover: null as string | null, // ex. 'assets/voiceover/voix-off.wav'
  voiceoverVolume: 1,
  /** Plans cinéma générés avec Higgsfield (Kling 3.0 Pro, 6 s, 16:9). */
  clips: {
    ship: 'assets/videos/01-porte-conteneurs.mp4',
    plane: 'assets/videos/02-avion-cargo.mp4',
    port: 'assets/videos/03-terminal-portuaire.mp4',
    truckHighway: 'assets/videos/04-camion-autoroute.mp4',
    merchant: 'assets/videos/05-commercant.mp4',
    documents: 'assets/videos/06-controle-documents.mp4',
    seal: 'assets/videos/07-scelle-conteneur.mp4',
    agent: 'assets/videos/08-agent-setrans.mp4',
    office: 'assets/videos/09-equipe-bureau.mp4',
    handshake: 'assets/videos/10-poignee-de-main.mp4',
    delivery: 'assets/videos/11-reception-marchandise.mp4',
    roadTouba: 'assets/videos/12-route-touba.mp4',
  },
};

/**
 * Découpage temporel (secondes). Chaque scène est un composant dans
 * `src/scenes/`. Modifier `start`/`duration` suffit à recaler le film :
 * les animations internes sont exprimées en proportion de la durée.
 */
export const SCENES = [
  { id: 's01', name: 'Globe — commerce mondial', start: 0, duration: 6 },
  { id: 's02', name: 'Porte-conteneurs', start: 6, duration: 6 },
  { id: 's03', name: 'Avion cargo', start: 12, duration: 6 },
  { id: 's04', name: 'Terminal portuaire + commerçant', start: 18, duration: 6 },
  { id: 's05', name: 'Douane — séquence administrative', start: 24, duration: 6 },
  { id: 's06', name: 'Conteneur scellé', start: 30, duration: 6 },
  { id: 's07', name: 'Camion → route → Sénégal', start: 36, duration: 6 },
  { id: 's08', name: 'SETRANS — trois pôles', start: 42, duration: 6 },
  { id: 's09', name: 'Chaîne logistique', start: 48, duration: 6 },
  { id: 's10', name: 'Carte Dakar → Touba', start: 54, duration: 6 },
  { id: 's11', name: 'Interface de suivi', start: 60, duration: 6 },
  { id: 's12', name: 'Activités & croissance', start: 66, duration: 6 },
  { id: 's13', name: 'Camion vers Touba', start: 72, duration: 6 },
  { id: 's14', name: 'Touba connectée au monde', start: 78, duration: 5 },
  { id: 's15', name: 'Silence — particules', start: 83, duration: 3 },
  { id: 's16', name: 'Révélation finale', start: 86, duration: 4 },
] as const;

export type SceneId = (typeof SCENES)[number]['id'];

/**
 * Script de voix off (wolof), à titre de repère pour l'enregistrement.
 * `start` en secondes. Non affiché à l'écran (showSubtitles = false).
 */
export const VOICEOVER_SCRIPT = {
  showSubtitles: false,
  lines: [
    { start: 0, text: 'Àddina dafay dox ndax jokkoo ak jënd ak jaay.' },
    { start: 6, text: 'Bés bu nekk, ay jumtukaay ak ay marchandise yu bari dañuy jaar réew ak réew…' },
    { start: 12, text: 'Gannaaw bépp marchandise, am na ab liggéeykat, ab jaaykat, ab projet… ak ab yaakaar.' },
    { start: 20, text: 'Waaye yóbbu marchandise du rekk ko jële ci benn béréb, yóbbu ko ci beneen.' },
    { start: 29, text: 'Dafa war a am toppandoo bu baax, waajal bu mat, kaarange…' },
    { start: 38, text: 'Fii la SETRANS di dugg.' },
    { start: 44, text: 'Ak xam-xamam ci transit, transport ak logistique…' },
    { start: 53, text: 'Dalee ci bi sa marchandise àggee… ba ci livraison bi, bépp jéego am na solo.' },
    { start: 62, text: 'Sunu yitte mooy yombal say échanges, wóorël say opérations…' },
    { start: 70, text: 'Am na entreprise buy jëm kanam. Am na projet buy màgg. Am na yaakaar buy soppeeku dëgg.' },
    { start: 78, text: 'Tey, SETRANS dafay jegeñal diggante yi…' },
    { start: 84, text: '…ci diggante Touba, Sénégal ak àddina.' },
    { start: 87, text: 'Doxalin bu bees tambali na. Jokkoo bu bees tambali na.' },
  ],
};

/** Coordonnées géographiques [longitude, latitude]. */
export const PLACES = {
  dakar: [-17.447, 14.693] as [number, number],
  touba: [-15.883, 14.85] as [number, number],
  saintLouis: [-16.49, 16.03] as [number, number],
  thies: [-16.93, 14.79] as [number, number],
  kaolack: [-16.07, 14.15] as [number, number],
  ziguinchor: [-16.27, 12.58] as [number, number],
  tambacounda: [-13.67, 13.77] as [number, number],
  // Monde
  abidjan: [-4.03, 5.36] as [number, number],
  lagos: [3.38, 6.52] as [number, number],
  casablanca: [-7.59, 33.57] as [number, number],
  paris: [2.35, 48.86] as [number, number],
  marseille: [5.37, 43.3] as [number, number],
  dubai: [55.27, 25.2] as [number, number],
  shanghai: [121.47, 31.23] as [number, number],
  newYork: [-74.0, 40.71] as [number, number],
  saoPaulo: [-46.63, -23.55] as [number, number],
  antwerp: [4.4, 51.22] as [number, number],
};

/**
 * EFFETS SONORES
 * ------------------------------------------------------------------
 * Banque générée par `npm run sfx` (scripts/generate-sfx.mjs) dans
 * public/assets/sfx/. Chaque repère : fichier, instant (s, temps global
 * du film), volume (0–1), fondus optionnels (s) et durée max (s).
 * Pour retirer un son : supprimer la ligne. Pour tout couper : enabled = false.
 */
export type SfxCue = {
  file: string;
  at: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
  maxDuration?: number;
  note?: string;
};

export const SFX = {
  enabled: true,
  /** Volume général des effets (à baisser quand musique + voix off sont ajoutées). */
  master: 0.85,
  folder: 'assets/sfx',
  cues: [
    // 01 — Globe
    { file: 'swell-open', at: 0.0, volume: 0.55, fadeIn: 1.2, note: 'Ouverture, apparition du globe' },
    { file: 'shimmer', at: 0.9, volume: 0.3, note: 'Lignes entre continents' },
    { file: 'tick', at: 1.0, volume: 0.18 },
    { file: 'tick-high', at: 1.4, volume: 0.15 },
    { file: 'tick', at: 1.8, volume: 0.15 },
    { file: 'tick-high', at: 2.3, volume: 0.13 },
    { file: 'tick', at: 2.8, volume: 0.12 },
    { file: 'riser-dive', at: 3.9, volume: 0.45, note: 'Plongée vers l’océan' },
    { file: 'whoosh-deep', at: 5.2, volume: 0.6 },
    // 02 — Porte-conteneurs
    { file: 'amb-ocean', at: 5.6, volume: 0.35, fadeIn: 0.8, fadeOut: 1.0, note: 'Houle' },
    // 03 — Avion cargo
    { file: 'whoosh-soft', at: 11.5, volume: 0.45 },
    { file: 'amb-plane', at: 11.6, volume: 0.32, fadeIn: 0.6, fadeOut: 0.8, maxDuration: 7 },
    // 04 — Port puis commerçant
    { file: 'whoosh-soft', at: 17.5, volume: 0.4 },
    { file: 'amb-port', at: 17.8, volume: 0.3, fadeIn: 0.4, fadeOut: 0.8 },
    { file: 'whoosh-light', at: 20.9, volume: 0.3, note: 'Coupe vers le commerçant' },
    // 05 — Douane
    { file: 'whoosh-light', at: 23.7, volume: 0.45, note: 'Panneau bleu' },
    { file: 'pop', at: 25.1, volume: 0.35, note: 'DOSSIER' },
    { file: 'pop', at: 26.2, volume: 0.35, note: 'CONTRÔLE' },
    { file: 'pop-high', at: 27.3, volume: 0.35, note: 'VALIDATION' },
    { file: 'stamp', at: 28.4, volume: 0.6, note: 'AUTORISATION' },
    { file: 'confirm', at: 28.7, volume: 0.3, note: 'Sceau de sécurité' },
    // 06 — Conteneur
    { file: 'whoosh-soft', at: 29.6, volume: 0.4 },
    { file: 'lock', at: 31.0, volume: 0.35, note: 'Scellé posé (plan réel)' },
    { file: 'whoosh-light', at: 32.4, volume: 0.3 },
    { file: 'door-slam', at: 33.8, volume: 0.55, note: 'Portes fermées' },
    { file: 'tick-high', at: 34.0, volume: 0.3, note: 'Scellé' },
    { file: 'lock', at: 34.4, volume: 0.5, note: 'Cadenas' },
    { file: 'data-stream', at: 34.2, volume: 0.25, note: 'Ligne de suivi numérique' },
    { file: 'confirm', at: 34.8, volume: 0.35, note: 'Validation' },
    // 07 — Camion → Sénégal
    { file: 'amb-truck-pass', at: 35.8, volume: 0.4, fadeIn: 0.3, fadeOut: 0.8 },
    { file: 'riser-line', at: 38.6, volume: 0.35, note: 'La route devient une ligne' },
    { file: 'shimmer', at: 39.6, volume: 0.3, note: 'Contour du Sénégal' },
    { file: 'impact-soft', at: 41.1, volume: 0.35 },
    // 08 — SETRANS
    { file: 'whoosh-deep', at: 41.6, volume: 0.4 },
    { file: 'impact-soft', at: 42.9, volume: 0.6, note: 'Apparition de SETRANS' },
    { file: 'pop', at: 43.8, volume: 0.35, note: 'TRANSIT' },
    { file: 'pop', at: 44.5, volume: 0.35, note: 'TRANSPORT' },
    { file: 'pop-high', at: 45.2, volume: 0.35, note: 'LOGISTIQUE' },
    { file: 'shimmer', at: 44.2, volume: 0.22, note: 'Connexions au centre' },
    // 09 — Chaîne logistique
    { file: 'whoosh-light', at: 47.7, volume: 0.4 },
    { file: 'tick', at: 48.45, volume: 0.35, note: 'NAVIRE' },
    { file: 'tick', at: 49.3, volume: 0.35, note: 'PORT' },
    { file: 'tick', at: 50.17, volume: 0.35, note: 'DOUANE' },
    { file: 'tick-high', at: 51.03, volume: 0.35, note: 'CONTENEUR' },
    { file: 'tick-high', at: 51.89, volume: 0.35, note: 'CAMION' },
    { file: 'confirm', at: 52.75, volume: 0.35, note: 'CLIENT' },
    // 10 — Dakar → Touba
    { file: 'whoosh-deep', at: 53.6, volume: 0.4 },
    { file: 'pop', at: 54.6, volume: 0.4, note: 'Dakar' },
    { file: 'riser-line', at: 55.2, volume: 0.3, note: 'Ligne vers Touba' },
    { file: 'impact-soft', at: 57.3, volume: 0.55, note: 'Touba' },
    { file: 'tick-high', at: 58.7, volume: 0.15, note: 'Pulsation' },
    // 11 — Interface de suivi
    { file: 'whoosh-light', at: 59.8, volume: 0.45, note: 'Carte de suivi' },
    { file: 'tick', at: 60.95, volume: 0.35, note: 'DOSSIER REÇU' },
    { file: 'tick', at: 61.8, volume: 0.35, note: 'EN TRAITEMENT' },
    { file: 'tick', at: 62.65, volume: 0.35, note: 'VALIDÉ' },
    { file: 'tick-high', at: 63.5, volume: 0.35, note: 'EN TRANSPORT' },
    { file: 'confirm', at: 64.35, volume: 0.45, note: 'LIVRÉ' },
    // 12 — Activités & croissance
    { file: 'whoosh-soft', at: 65.6, volume: 0.35 },
    { file: 'whoosh-light', at: 68.7, volume: 0.25 },
    { file: 'riser-line', at: 68.9, volume: 0.2, note: 'Courbe de croissance' },
    { file: 'pop', at: 69.2, volume: 0.28 },
    { file: 'pop', at: 69.65, volume: 0.28 },
    { file: 'pop-high', at: 70.1, volume: 0.28 },
    { file: 'pop-high', at: 70.55, volume: 0.28 },
    { file: 'pop-high', at: 71.0, volume: 0.3 },
    // 13 — Route vers Touba
    { file: 'amb-truck-road', at: 71.7, volume: 0.32, fadeIn: 0.8, fadeOut: 1.0 },
    { file: 'amb-wind', at: 71.7, volume: 0.3, fadeIn: 1.0, fadeOut: 1.0 },
    // 14 — Touba connectée au monde
    { file: 'whoosh-deep', at: 77.6, volume: 0.4 },
    { file: 'shimmer-long', at: 78.3, volume: 0.4, note: 'Lignes vers le monde' },
    { file: 'riser-line', at: 79.4, volume: 0.2 },
    // 15 — Silence, particules
    { file: 'shimmer-long', at: 83.0, volume: 0.28, note: 'Convergence' },
    { file: 'riser-dive', at: 83.9, volume: 0.4, note: 'Montée avant la révélation' },
    // 16 — Révélation finale
    { file: 'impact-final', at: 86.0, volume: 0.85, note: 'Logo' },
    { file: 'shimmer', at: 86.1, volume: 0.35 },
    { file: 'tick', at: 86.7, volume: 0.2, note: 'Signature' },
    { file: 'tick', at: 87.05, volume: 0.18 },
    { file: 'tick-high', at: 87.4, volume: 0.16 },
  ] as SfxCue[],
};
