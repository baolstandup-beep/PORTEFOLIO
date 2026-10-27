import { useVideoConfig } from "remotion";

// Palette relevée sur le logo officiel (manifeste PAS-PAS) : vert de la pirogue et du
// bandeau, bleu du nom et du liseré, bleu ciel des vagues. Fond nuit bleutée.
export const colors = {
  night: "#040A14",
  deep: "#0A1B30",
  green: "#34A44C",
  greenLight: "#5CCB74",
  blue: "#3C74C4",
  // Bleu du logo éclairci pour rester lisible sur fond sombre (mots mis en valeur).
  accent: "#7DB6F5",
  accentLight: "#D4E9FF",
  sky: "#8CCDF2",
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
