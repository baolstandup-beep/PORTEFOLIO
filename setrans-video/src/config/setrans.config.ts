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
