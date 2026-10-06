import { useVideoConfig } from 'remotion';

/**
 * Format courant : W × H et V = vertical (9:16).
 * Les scènes s'en servent pour placer leurs éléments dans les deux formats.
 */
export const useLayout = () => {
  const { width: W, height: H } = useVideoConfig();
  return { W, H, V: H > W, cx: W / 2, cy: H / 2 };
};
