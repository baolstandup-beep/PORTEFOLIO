import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C} from '../theme';

/** Fond vert profond, texture lumineuse et lente respiration de lumière. */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const lx = 50 + Math.sin(f / 90) * 12;
  const ly = 38 + Math.cos(f / 110) * 8;
  return (
    <AbsoluteFill style={{backgroundColor: C.green}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${lx}% ${ly}%, rgba(46,160,90,0.55) 0%, rgba(14,89,46,0) 55%),
            radial-gradient(ellipse at 50% 120%, ${C.greenDeep} 0%, rgba(7,61,30,0) 60%)`,
        }}
      />
      {/* texture : fines diagonales dorées très subtiles */}
      <AbsoluteFill
        style={{
          opacity: 0.06,
          backgroundImage:
            'repeating-linear-gradient(115deg, rgba(241,212,122,0.9) 0px, rgba(241,212,122,0.9) 1px, transparent 1px, transparent 26px)',
          transform: `translateX(${(f * 0.3) % 26}px)`,
        }}
      />
      {/* grain */}
      <AbsoluteFill style={{opacity: 0.12, mixBlendMode: 'overlay'}}>
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={Math.floor(f / 2) % 12} />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
      {/* vignette */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,20,8,0.55) 100%)'}}
      />
    </AbsoluteFill>
  );
};

/** Particules dorées déterministes (même rendu à chaque export). */
export const Particles: React.FC<{count?: number; seed?: string; speed?: number; opacity?: number}> = ({
  count = 70,
  seed = 'p',
  speed = 1,
  opacity = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity}}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = 3 + r('s') * 9;
        const depth = 0.4 + r('d') * 1.2;
        const x = r('x') * 1080 + Math.sin((f + r('ph') * 400) / (40 + r('w') * 40)) * 18 * depth;
        const y = ((r('y') * 2100 - f * speed * depth * 1.4) % 2100 + 2100) % 2100 - 90;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin((f + r('t') * 300) / (14 + r('tt') * 20)));
        const appear = interpolate(f, [r('a') * 40, r('a') * 40 + 30], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFF3C4 0%, #E9C760 40%, rgba(201,162,39,0) 72%)',
              opacity: tw * appear * (0.45 + depth * 0.4),
              filter: size > 9 ? 'blur(1.5px)' : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
