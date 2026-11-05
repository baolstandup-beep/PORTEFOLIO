import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp} from './anim';
import {XF} from '../timeline';

/** Enveloppe de scène : fondu enchaîné cinématique (opacité + flou + léger zoom). */
export const SceneShell: React.FC<{
  dur: number;
  children: React.ReactNode;
  fadeIn?: boolean;
  fadeOut?: boolean;
}> = ({dur, children, fadeIn = true, fadeOut = true}) => {
  const f = useCurrentFrame();
  const inP = fadeIn ? interpolate(f, [0, XF], [0, 1], clamp) : 1;
  const outP = fadeOut ? interpolate(f, [dur, dur + XF], [1, 0], clamp) : 1;
  const o = Math.min(inP, outP);
  const blur = (1 - inP) * 10 + (1 - outP) * 14;
  const scale = 1 + (1 - inP) * 0.04 - (1 - outP) * 0.06;
  return (
    <AbsoluteFill
      style={{opacity: o, filter: blur > 0.2 ? `blur(${blur}px)` : undefined, transform: `scale(${scale})`}}
    >
      {children}
    </AbsoluteFill>
  );
};
