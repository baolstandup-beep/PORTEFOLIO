import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, ease} from '../components/anim';
import {PinIcon} from '../components/Icons';
import {Letters} from '../components/Text';
import {C, FONT} from '../theme';

const BW = 919; // dimensions natives du détourage (aucune déformation : ratio conservé)
const BH = 700;

export const S3Lieu: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dur = 224;

  // Caméra : léger travelling 3D (parallaxe) + zoom progressif
  const push = interpolate(f, [0, dur], [1.0, 1.14], clamp);
  const rotY = interpolate(f, [0, dur], [7, -5], clamp);
  const camX = interpolate(f, [0, dur], [30, -30], clamp);
  const reveal = ease(f, 16, 58);
  const light = interpolate(f, [62, 140], [-30, 130], clamp);
  const ground = ease(f, 10, 50);

  const pin = spring({frame: f - 4, fps, config: {damping: 9, mass: 0.7, stiffness: 160}});
  const sub = ease(f, 40, 66);
  const textPar = interpolate(f, [0, dur], [0, -40], clamp);

  const scale = 1040 / BW;
  const w = BW * scale;
  const h = BH * scale;

  return (
    <AbsoluteFill>
      {/* sol lumineux (évoque la partie blanche de l'affiche) */}
      <div
        style={{
          position: 'absolute',
          left: -200,
          right: -200,
          top: 1380,
          height: 700,
          background: 'radial-gradient(ellipse at 50% 18%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0) 62%)',
          opacity: ground,
          transform: `translateX(${camX * 0.6}px)`,
        }}
      />
      {/* bâtiment */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 820, display: 'flex', justifyContent: 'center', perspective: 1600}}>
        <div
          style={{
            position: 'relative',
            width: w,
            height: h,
            transform: `translateX(${camX}px) rotateY(${rotY}deg) scale(${push})`,
            transformOrigin: '50% 80%',
            clipPath: `inset(${(1 - reveal) * 100}% -20% -20% -20%)`,
          }}
        >
          {/* ombre portée */}
          <div
            style={{
              position: 'absolute',
              left: '12%',
              right: '12%',
              bottom: -6,
              height: 70,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse, rgba(0,30,10,0.45) 0%, rgba(0,30,10,0) 70%)',
              filter: 'blur(6px)',
            }}
          />
          <Img
            src={staticFile('assets/batiment.png')}
            style={{
              position: 'absolute',
              inset: 0,
              width: w,
              height: h,
              transform: `translateY(${(1 - reveal) * 60}px)`,
              filter: `brightness(${0.85 + reveal * 0.15}) drop-shadow(0 20px 30px rgba(0,0,0,0.35))`,
            }}
          />
          {/* balayage lumineux sur la façade, masqué par la silhouette du bâtiment */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              WebkitMaskImage: `url(${staticFile('assets/batiment.png')})`,
              WebkitMaskSize: '100% 100%',
              maskImage: `url(${staticFile('assets/batiment.png')})`,
              maskSize: '100% 100%',
              background: `linear-gradient(100deg, transparent ${light - 16}%, rgba(255,250,225,0.55) ${light}%, transparent ${light + 16}%)`,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      </div>

      {/* bokeh au premier plan : parallaxe plus rapide */}
      {new Array(10).fill(0).map((_, i) => {
        const r = (k: string) => random(`bk-${i}-${k}`);
        const size = 40 + r('s') * 90;
        const x = r('x') * 1080 - f * (1.2 + r('v') * 1.6) + 120;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: ((x % 1300) + 1300) % 1300 - 110,
              top: 900 + r('y') * 900,
              width: size,
              height: size,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(241,212,122,0.35) 0%, rgba(241,212,122,0) 70%)',
              filter: 'blur(4px)',
              opacity: ease(f, 20, 60) * 0.8,
            }}
          />
        );
      })}

      {/* texte : LIEU / NDAAM / Darou Halimoul Khabiir */}
      <div style={{position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center', transform: `translateY(${textPar}px)`}}>
        <div
          style={{
            display: 'inline-block',
            transform: `translateY(${(1 - pin) * -160}px)`,
            opacity: interpolate(pin, [0, 0.2], [0, 1], clamp),
          }}
        >
          <PinIcon size={86} />
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 34,
            letterSpacing: 12,
            paddingLeft: 12,
            color: C.gold,
            marginTop: 6,
            opacity: ease(f, 14, 30),
          }}
        >
          LIEU
        </div>
        <Letters
          text="NDAAM"
          delay={18}
          stagger={4}
          style={{fontSize: 190, fontWeight: 900, color: C.white, lineHeight: 1, marginTop: 4, letterSpacing: -2}}
        />
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 56,
            color: C.white,
            marginTop: 18,
            opacity: sub,
            transform: `translateY(${(1 - sub) * 30}px)`,
            letterSpacing: interpolate(sub, [0, 1], [8, 0.5], clamp),
          }}
        >
          Darou Halimoul Khabiir
        </div>
      </div>
    </AbsoluteFill>
  );
};
