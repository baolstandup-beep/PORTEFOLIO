import { Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * Mouvement de caméra standard d'une scène :
 * - entrée « zoom-through » (on arrive de très près, flou → net)
 * - dérive lente (push-in + roulis)
 * - sortie : accélération vers l'avant + flou de mouvement
 */
export const useSceneCamera = (
  duration: number,
  o: { push?: [number, number]; roll?: [number, number]; enter?: number; exit?: number; exitScale?: number; drift?: [number, number] } = {},
) => {
  const frame = useCurrentFrame();
  const { push = [1, 1.1], roll = [0, 0], enter = 10, exit = 9, exitScale = 1.35, drift = [0, 0] } = o;
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const inP = interpolate(frame, [0, enter], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const outP = interpolate(frame, [duration - exit, duration], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const base = interpolate(frame, [0, duration], push, { ...clamp, easing: Easing.inOut(Easing.sin) });
  const scale = base * interpolate(inP, [0, 1], [1.28, 1]) * interpolate(outP, [0, 1], [1, exitScale]);
  const rotate = interpolate(frame, [0, duration], roll, clamp);
  const x = interpolate(frame, [0, duration], [drift[0], drift[1]], clamp);
  const blur = (1 - inP) * 16 + outP * 18;
  return { scale, rotate, x, blur };
};
