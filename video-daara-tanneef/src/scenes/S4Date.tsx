import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, ease} from '../components/anim';
import {Shine} from '../components/Text';
import {C, FONT} from '../theme';

export const S4Date: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = spring({frame: f - 6, fps, config: {damping: 13, mass: 1, stiffness: 90}});
  const num = spring({frame: f - 26, fps, config: {damping: 11, mass: 0.8, stiffness: 120}});
  const burst = interpolate(f, [26, 40, 90], [0, 1, 0.35], clamp);
  const glow = 0.5 + 0.5 * Math.sin((f - 40) / 7);
  const month = ease(f, 42, 64);
  const label = ease(f, 0, 20);
  const recap = ease(f, 60, 84);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 380,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: 10,
          paddingLeft: 10,
          color: C.goldLight,
          opacity: label,
          transform: `translateY(${(1 - label) * -20}px)`,
        }}
      >
        DATE DE L’INAUGURATION
      </div>

      {/* halo lumineux derrière le calendrier */}
      <div
        style={{
          position: 'absolute',
          left: 540 - 600,
          top: 940 - 600,
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,240,190,0.75) 0%, rgba(241,212,122,0.25) 30%, rgba(241,212,122,0) 62%)',
          opacity: burst,
        }}
      />

      {/* calendrier */}
      <div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center', perspective: 1400}}>
        <div
          style={{
            width: 640,
            borderRadius: 34,
            background: C.white,
            overflow: 'hidden',
            boxShadow: '0 40px 90px rgba(0,0,0,0.35), 0 8px 20px rgba(0,0,0,0.15)',
            transformOrigin: '50% 0%',
            transform: `rotateX(${(1 - card) * -95}deg) translateY(${(1 - card) * -80}px)`,
            opacity: interpolate(card, [0, 0.15], [0, 1], clamp),
          }}
        >
          <div
            style={{
              background: C.red,
              height: 170,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 78,
              letterSpacing: 6,
              paddingLeft: 6,
              color: C.white,
            }}
          >
            DIMANCHE
          </div>
          <div style={{height: 470, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
            <Shine at={56} dur={28}>
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 380,
                  lineHeight: 1,
                  color: C.greenText,
                  letterSpacing: -10,
                  transform: `scale(${interpolate(num, [0, 1], [2.6, 1])})`,
                  opacity: interpolate(num, [0, 0.25], [0, 1], clamp),
                  filter: `blur(${interpolate(num, [0, 1], [18, 0], clamp)}px)`,
                  textShadow: `0 0 ${20 + glow * 30}px rgba(241,212,122,${f > 40 ? 0.35 + glow * 0.35 : 0})`,
                }}
              >
                08
              </div>
            </Shine>
          </div>
          <div
            style={{
              height: 140,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 54,
              whiteSpace: 'nowrap',
              letterSpacing: interpolate(month, [0, 1], [14, 4], clamp),
              paddingLeft: 5,
              color: C.greenText,
              opacity: month,
            }}
          >
            NOVEMBRE 2026
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 1560,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT,
          color: C.greenText,
          opacity: recap,
          transform: `translateY(${(1 - recap) * 30}px)`,
        }}
      >
        <div style={{fontWeight: 900, fontSize: 64, letterSpacing: 2}}>NDAAM</div>
        <div style={{fontWeight: 600, fontSize: 42, color: C.greenSoft, marginTop: 6}}>Darou Halimoul Khabiir</div>
      </div>
    </AbsoluteFill>
  );
};
