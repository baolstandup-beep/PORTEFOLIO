import { loadFont as loadMontserrat } from '@remotion/google-fonts/Montserrat';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';

const titres = loadMontserrat('normal', { weights: ['600', '800', '900'], subsets: ['latin', 'latin-ext'] });
const textes = loadInter('normal', { weights: ['400', '500', '600', '700'], subsets: ['latin', 'latin-ext'] });

export const FONTS = {
  titre: titres.fontFamily,
  texte: textes.fontFamily,
};

export const COULEURS = {
  bleuNuit: '#0A2A5E',
  bleu: '#1E6FD9',
  bleuCiel: '#6EC1FF',
  cielClair: '#CDEBFF',
  jaune: '#F5B700',
  jauneClair: '#FFD84D',
  rouge: '#E63946',
  blanc: '#FFFFFF',
  encre: '#0B1B33',
} as const;

export const OMBRE = '0 30px 80px rgba(6, 26, 64, 0.35)';
