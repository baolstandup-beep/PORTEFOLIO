// Piste unique de caméra et d'éclairage pour tout le film. Chaque scène lit l'état à son image
// globale : les raccords entre scènes sont donc continus (position, vitesse, lumière).
import {config} from './config';
import {monotone} from './lib/motion';

export type Shot = {
  fade: number; // 0 = noir, 1 = image
  zoom: number; // échelle du décor (travelling avant > 1)
  x: number; // décalage horizontal du décor, px (repère 1920 × 1080)
  y: number; // décalage vertical du décor, px
  orbit: number; // orbite simulée −1 … 1 : parallaxe et déplacement des reflets
  silhouette: number; // ombre chinoise de la bouteille (scène 1)
  rim: number; // liseré de lumière sur les contours
  reveal: number; // balayage lumineux qui révèle la bouteille, 0 → 1
  key: number; // lumière principale sur le produit
  halo: number; // halo derrière la bouteille
  beam: number; // faisceau volumétrique
  haze: number; // brume
  particles: number; // densité visible des particules
  podium: number; // apparition du socle
};

type Key = [frame: number, values: Partial<Shot>];

// Repères (images à 25 i/s) : 0–99 mystère, 100–224 révélation, 225–399 héros, 400–574 marque, 575–749 final.
const keys: Key[] = [
  [0, {fade: 0, zoom: 1.32, x: 0, y: -20, orbit: 0, silhouette: 0, rim: 0, reveal: 0, key: 0, halo: 0.04, beam: 0, haze: 0.35, particles: 0, podium: 0}],
  [30, {fade: 1}],
  [50, {beam: 0.5, silhouette: 0.55, rim: 0.12, halo: 0.12, particles: 0.45}],
  [99, {zoom: 1.2, y: -10, beam: 0.9, silhouette: 1, rim: 0.65, halo: 0.3, particles: 0.8, podium: 0.3, haze: 0.5, reveal: 0, key: 0}],
  [190, {reveal: 1, rim: 0.45, beam: 0.62, podium: 1}],
  [205, {key: 1, halo: 0.75, silhouette: 0}],
  [224, {zoom: 1.06, x: 24, y: 0, orbit: -0.35}],
  // Héros : travelling latéral et orbite, puis retour face caméra en gros plan sur l'étiquette.
  [305, {zoom: 1.2, x: -110, y: 34, orbit: 0.55, halo: 0.68, haze: 0.42}],
  [360, {zoom: 1.28, x: -30, y: -30, orbit: 0.15}],
  // (La bouteille reste entière dans le cadre, bouchon compris, même au plus serré.)
  [399, {zoom: 1.5, x: 0, y: -9, orbit: 0, halo: 0.8, beam: 0.55}],
  // Marque : le logo au centre, poussée lente, puis recul qui laisse la place au nom de marque.
  [440, {zoom: 1.6, y: -10, halo: 1}],
  [505, {zoom: 0.87, y: -26}],
  [574, {zoom: 0.85, halo: 0.9, beam: 0.5, haze: 0.5}],
  // Final : dernière stabilisation, puis image fixe (≥ 4 s) jusqu'à la fin.
  [600, {halo: 1, beam: 0.58}],
  [640, {zoom: 0.82, y: -30, halo: 0.95, beam: 0.55, haze: 0.45, particles: 0.6}],
  [749, {}],
];

// Chaque champ a sa propre courbe : on ne retient que les clés où il est défini.
const fields = Object.keys(keys[0][1]) as (keyof Shot)[];
const tracks = Object.fromEntries(
  fields.map((field) => {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const [frame, values] of keys) {
      if (values[field] !== undefined) {
        xs.push(frame);
        ys.push(values[field] as number);
      }
    }
    return [field, {xs, ys}];
  }),
) as Record<keyof Shot, {xs: number[]; ys: number[]}>;

export const shotAt = (frame: number): Shot => {
  const shot = {} as Shot;
  for (const field of fields) {
    const {xs, ys} = tracks[field];
    shot[field] = xs.length === 1 ? ys[0] : monotone(xs, ys, frame);
  }
  // Ampleur des mouvements réglable sans toucher aux clés.
  const a = config.motion.cameraAmplitude;
  shot.x *= a;
  shot.y *= a;
  shot.orbit *= a;
  shot.zoom = 1 + (shot.zoom - 1) * a;
  return shot;
};
