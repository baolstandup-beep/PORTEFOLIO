import { continueRender, delayRender, getStaticFiles, staticFile } from "remotion";

// Emplacements des fichiers de marque (dossier public/). Un fichier présent est
// utilisé automatiquement ; absent, la vidéo affiche un remplacement typographique.
export const BRAND_FILES = {
  logo: "brand/logo.png",
};

export const CHANNEL = {
  name: "PAS-PAS OFFICIEL",
  handle: "@PAS-PAS_OFFICIEL",
  url: "youtube.com/@PAS-PAS_OFFICIEL",
};

// Les trois publications réellement présentes sur la chaîne (relevé du 27/10/2026).
export const VIDEOS = [
  {
    id: "r0GEhHLY55s",
    kind: "VIDÉO",
    duration: "2:54",
    title: "PAS-PAS (Plateforme d'Acteurs Sénégalais pour le Progrès et l'Ancrage Souverain)",
  },
  {
    id: "6HJ9nR0Eb_I",
    kind: "VIDÉO",
    duration: "1:17",
    title: "Pas-Pas, une nouvelle dynamique politique pour le progrès et l'ancrage souverain",
  },
  {
    id: "4PODQBLTWZc",
    kind: "SHORT",
    duration: "0:35",
    title: "Conférence de presse PAS-PAS · Samedi 31 octobre 2026, 16 h 30 · Mbacké",
  },
];

const has = (path: string) => getStaticFiles().some((f) => f.name === path);

export const logoSrc = (): string | null => (has(BRAND_FILES.logo) ? staticFile(BRAND_FILES.logo) : null);

export const thumbSrc = (id: string): string | null => {
  for (const ext of ["jpg", "png", "webp"]) {
    const p = `thumbs/${id}.${ext}`;
    if (has(p)) return staticFile(p);
  }
  return null;
};

const FONT_FACES: [string, string, number][] = [
  ["Montserrat", "fonts/montserrat-latin-700-normal.woff2", 700],
  ["Montserrat", "fonts/montserrat-latin-800-normal.woff2", 800],
  ["Montserrat", "fonts/montserrat-latin-900-normal.woff2", 900],
  ["Inter", "fonts/inter-latin-500-normal.woff2", 500],
  ["Inter", "fonts/inter-latin-600-normal.woff2", 600],
  ["Inter", "fonts/inter-latin-700-normal.woff2", 700],
];

let fontsRequested = false;
export const loadFonts = () => {
  if (fontsRequested || typeof document === "undefined") return;
  fontsRequested = true;
  const handle = delayRender("Chargement des polices");
  Promise.all(
    FONT_FACES.map(([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight: String(weight) });
      return face.load().then((f) => document.fonts.add(f));
    }),
  ).then(() => continueRender(handle));
};
