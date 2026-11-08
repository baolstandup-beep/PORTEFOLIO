import { useVideoConfig } from 'remotion';

/**
 * Format courant. En vertical, les zones de sécurité TikTok/Reels/Statut sont respectées :
 * contenu important entre y=250 et y=1480 (interface des apps en bas) et x=90…990.
 */
export const useFormat = () => {
  const { width, height } = useVideoConfig();
  const v = height > width;
  return {
    v,
    W: width,
    H: height,
    /** Unité typographique : 1u = 1px en 1920×1080, mise à l'échelle en vertical. */
    u: v ? width / 1080 : width / 1920,
    safe: v ? { top: 250, bottom: 440, side: 90 } : { top: 90, bottom: 90, side: 140 },
  };
};
