import { useEffect, useState } from 'react';
import { continueRender, delayRender, staticFile } from 'remotion';

const WEIGHTS = [400, 500, 600, 700, 800, 900];
let loaded: Promise<void> | null = null;

/** Charge Poppins (police officielle du site, licence OFL) avant le premier rendu. */
const loadFonts = () => {
  if (!loaded) {
    loaded = Promise.all(
      WEIGHTS.map((w) => {
        const f = new FontFace('Poppins', `url(${staticFile(`fonts/poppins-latin-${w}-normal.woff2`)}) format('woff2')`, {
          weight: String(w),
        });
        return f.load().then((ff) => {
          (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff);
        });
      }),
    ).then(() => undefined);
  }
  return loaded;
};

export const Fonts: React.FC = () => {
  const [handle] = useState(() => delayRender('Poppins'));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle));
  }, [handle]);
  return null;
};
