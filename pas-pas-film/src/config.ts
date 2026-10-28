// Tous les réglages modifiables du film. Les scènes lisent ces valeurs : on change un texte, une
// couleur ou une intensité ici sans toucher à leur code.
// Durée et cadence : voir src/timeline.json (partagé avec le générateur de musique).
import timeline from './timeline.json';
import bottleMeta from './bottle-meta.json';

export type AudioMode = 'score' | 'off';

export const config = {
  // Timeline
  fps: timeline.fps,
  durationInFrames: timeline.durationInFrames,

  // Résolutions : toutes les mises en page sont dessinées en 1920 × 1080 puis mises à l'échelle.
  resolution: {width: 1920, height: 1080},
  resolution4k: {width: 3840, height: 2160},

  colors: {
    background: '#03050b',
    backgroundGlow: '#0b1a36',
    accentBlue: '#2f6dff', // bleu de l'étiquette
    accentGreen: '#1f9e5c', // vert de l'étiquette
    beam: '190, 214, 255', // RVB du faisceau de lumière
    text: '#f4f6fb',
    textMuted: '#b7c2d6',
    podiumTop: '#121a2b',
    podiumSide: '#070b14',
  },

  // Intensités (1 = valeur de référence ; 0 coupe l'effet).
  lights: {
    master: 1,
    beam: 1,
    halo: 1,
    rim: 1,
    specular: 1,
    reflection: 1,
  },

  // Vitesse et ampleur des mouvements (1 = référence).
  motion: {
    cameraAmplitude: 1,
    particleSpeed: 1,
  },

  text: {
    title: 'PAS-PAS',
    showTitle: true,
    // Proposition créative, pas une accroche officielle : la valider avant diffusion ou passer showTagline à false.
    tagline: 'Une nouvelle expérience de fraîcheur',
    showTagline: true,
    pressLine: 'CONFÉRENCE DE PRESSE',
    endLine: 'Le début d’une nouvelle aventure.',
    showEndLine: true,
    // Informations d'événement : null tant qu'elles ne sont pas validées. Rien n'est inventé.
    eventDate: null as string | null,
    eventPlace: null as string | null,
  },

  effects: {
    particles: true,
    droplets: true,
    glints: true,
    reflection: true,
  },

  audio: {
    mode: 'score' as AudioMode,
    volume: 1,
  },

  assets: {
    bottle: 'assets/bottle.png',
    bottleSilhouette: 'assets/bottle-silhouette.png',
    bottleRim: 'assets/bottle-rim.png',
    score: 'assets/score.wav',
    bottleWidth: bottleMeta.width,
    bottleHeight: bottleMeta.height,
    bottlePadding: bottleMeta.padding, // marge transparente autour de la bouteille dans le PNG
  },
} as const;

export const scenes = timeline.scenes;
export const cues = timeline.cues;
export type SceneName = keyof typeof scenes;
