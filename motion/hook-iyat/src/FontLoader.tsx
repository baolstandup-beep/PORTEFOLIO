import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

const FONTS = [
  { family: 'Archivo', file: 'archivo-latin.woff2', descriptors: { weight: '400 900', stretch: '62% 125%' } },
  { family: 'Manrope', file: 'manrope-latin.woff2', descriptors: { weight: '400 700' } },
];

/** Bloque le rendu tant que les polices du portfolio ne sont pas chargées. */
export const FontLoader: React.FC = () => {
  const [handle] = useState(() => delayRender('Chargement des polices'));
  useEffect(() => {
    Promise.all(
      FONTS.map(async ({ family, file, descriptors }) => {
        const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, descriptors);
        await face.load();
        document.fonts.add(face);
      }),
    )
      .then(() => continueRender(handle))
      .catch((err) => {
        console.error(err);
        continueRender(handle);
      });
  }, [handle]);
  return null;
};
