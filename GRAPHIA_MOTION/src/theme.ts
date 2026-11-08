/**
 * Design tokens repris À L'IDENTIQUE du site officiel (graphia/src/app/globals.css, @theme)
 * + le jaune du logo. Toute couleur du film doit venir d'ici.
 */
export const C = {
  brand: '#078D43', // --color-brand
  brandDark: '#056A32', // --color-brand-dark
  brandDeep: '#03381B', // extension sombre du vert pour les scènes de nuit (dérivée de brandDark)
  brand50: '#E8F5EE', // --color-brand-50
  ink: '#080808', // --color-ink
  sun: '#F5E500', // --color-sun (site)
  sunLogo: '#FBEA04', // jaune du pavé « IA » du logo
  paper: '#FFFFFF', // --color-paper
  mist: '#F5F5F5', // --color-mist
  line: 'rgba(8,8,8,0.10)',
};

export const FONT = "'Poppins', ui-sans-serif, system-ui, sans-serif";

/** Courbes de mouvement du site (cubic-bezier) reprises pour garder le même « toucher ». */
export const EASE = {
  rise: [0.2, 0.7, 0.2, 1] as const, // --animate-rise
  out: [0.16, 1, 0.3, 1] as const, // hero-in / hero-word
  mask: [0.7, 0, 0.2, 1] as const, // révélation par rideau
  inOut: [0.65, 0, 0.35, 1] as const, // réseau
  back: [0.34, 1.56, 0.64, 1] as const, // nœuds
};
