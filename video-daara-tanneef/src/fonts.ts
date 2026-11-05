import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import {FONT} from './theme';

const weights = ['500', '600', '700', '800', '900'] as const;

export const fontsReady = Promise.all(
  weights.map((weight) =>
    loadFont({
      family: FONT,
      url: staticFile(`fonts/montserrat-latin-${weight}-normal.woff2`),
      weight,
    }),
  ),
);
