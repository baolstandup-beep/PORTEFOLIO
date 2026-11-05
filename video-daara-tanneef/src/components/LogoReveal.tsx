import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp} from './anim';
import {C} from '../theme';

/** Logo Touba Ça Kanam : anneau doré dessiné, rayons lumineux, reflet. */
export const LogoReveal: React.FC<{size: number; delay?: number; rays?: boolean}> = ({size, delay = 0, rays = true}) => {
  const f = useCurrentFrame() - delay;
  const {fps} = useVideoConfig();
  const s = spring({frame: f - 8, fps, config: {damping: 12, mass: 0.9, stiffness: 110}});
  const ring = interpolate(f, [0, 34], [0, 1], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
  const shine = interpolate(f, [38, 66], [-60, 160], clamp);
  const R = size * 0.56;
  const circ = 2 * Math.PI * R;
  const box = size * 1.4;
  return (
    <div style={{position: 'relative', width: box, height: box}}>
      {rays && (
        <div
          style={{
            position: 'absolute',
            inset: -box * 0.35,
            opacity: 0.35 * ring,
            background:
              'repeating-conic-gradient(from 0deg, rgba(241,212,122,0.55) 0deg 4deg, rgba(241,212,122,0) 4deg 18deg)',
            WebkitMaskImage: 'radial-gradient(circle, black 18%, transparent 62%)',
            maskImage: 'radial-gradient(circle, black 18%, transparent 62%)',
            transform: `rotate(${f * 0.35}deg)`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle, rgba(241,212,122,0.35) 0%, rgba(241,212,122,0) 60%)',
          opacity: ring,
        }}
      />
      <svg width={box} height={box} style={{position: 'absolute', inset: 0, transform: 'rotate(-90deg)'}}>
        <circle
          cx={box / 2}
          cy={box / 2}
          r={R}
          fill="none"
          stroke={C.goldLight}
          strokeWidth={3}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ring)}
          style={{filter: 'drop-shadow(0 0 8px rgba(241,212,122,0.9))'}}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: (box - size) / 2,
          top: (box - size) / 2,
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
          transform: `scale(${0.4 + 0.6 * s}) rotate(${(1 - s) * -14}deg)`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        }}
      >
        <Img src={staticFile('assets/logo-touba-ca-kanam.png')} style={{width: '100%', height: '100%'}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(110deg, transparent ${shine - 20}%, rgba(255,246,210,0.55) ${shine}%, transparent ${shine + 20}%)`,
            mixBlendMode: 'screen',
          }}
        />
      </div>
    </div>
  );
};
