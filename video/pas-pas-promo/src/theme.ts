import { useVideoConfig } from "remotion";

// Palette. Hypothèse : couleurs nationales sénégalaises (vert, or, rouge), le logo
// officiel n'ayant pas pu être téléchargé. Remplacer ici par les couleurs exactes du logo.
export const colors = {
  night: "#050B08",
  deep: "#0A1A12",
  green: "#00853F",
  greenLight: "#2BC46F",
  gold: "#F2C230",
  goldLight: "#FFE38A",
  red: "#E31B23",
  white: "#FFFFFF",
  mist: "rgba(255,255,255,0.72)",
  // Rouge du bouton d'abonnement : convention visuelle YouTube.
  subscribe: "#FF0033",
};

export const fonts = {
  display: "Montserrat, sans-serif",
  ui: "Inter, sans-serif",
};

// Zones de sécurité : 5 % (titre) en 16:9 ; en 9:16, l'interface Shorts recouvre
// environ le haut (12 %), le bas (22 %) et la colonne d'actions à droite (14 %).
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const vertical = height > width;
  const safe = vertical
    ? { top: height * 0.12, bottom: height * 0.22, left: width * 0.07, right: width * 0.14 }
    : { top: height * 0.06, bottom: height * 0.06, left: width * 0.06, right: width * 0.06 };
  // Unité de base : 1 = 1 px en 1920×1080, adaptée à la largeur utile du format.
  const u = vertical ? width / 1180 : width / 1920;
  return { width, height, vertical, safe, u };
};
