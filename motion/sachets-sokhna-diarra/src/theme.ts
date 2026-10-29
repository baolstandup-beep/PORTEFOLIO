import {continueRender, delayRender, staticFile} from 'remotion';

export const C = {
  green: '#1E8A4A',
  greenDeep: '#0F5A2E',
  orange: '#E8732A',
  orangeDeep: '#C2531A',
  cream: '#FFF8EE',
  white: '#FFFFFF',
};

export const SANS = 'Baloo2';
export const SCRIPT = 'GreatVibes';

const fonts: [string, string, string][] = [
  [SANS, 'fonts/baloo-2-latin-600-normal.woff2', '600'],
  [SANS, 'fonts/baloo-2-latin-700-normal.woff2', '700'],
  [SANS, 'fonts/baloo-2-latin-800-normal.woff2', '800'],
  [SCRIPT, 'fonts/great-vibes-latin-400-normal.woff2', '400'],
];

const handle = delayRender('Chargement des polices');
Promise.all(
  fonts.map(([family, file, weight]) => {
    const face = new FontFace(family, `url(${staticFile(file)})`, {weight});
    document.fonts.add(face);
    return face.load();
  }),
).then(() => continueRender(handle));
