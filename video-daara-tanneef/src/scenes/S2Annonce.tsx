import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {clamp, ease} from '../components/anim';
import {GoldRule, Letters, Shine} from '../components/Text';
import {C, FONT} from '../theme';

export const S2Annonce: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = ease(f, 0, 160, 1.28, 1);
  const tanneef = ease(f, 34, 58);
  const box = ease(f, 70, 100);
  const boxText = ease(f, 82, 110);
  // contour du cadre "DAARA PUBLIQUE"
  const bw = 560;
  const bh = 104;
  const per = 2 * (bw + bh);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${zoom})`}}>
      <div style={{marginTop: -80, textAlign: 'center'}}>
        <Shine at={52} dur={30}>
          <Letters
            text="INAUGURATION"
            delay={4}
            stagger={2.5}
            style={{fontSize: 116, fontWeight: 900, color: C.white, letterSpacing: -1, lineHeight: 1}}
          />
        </Shine>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 92,
            fontWeight: 800,
            color: C.white,
            marginTop: 22,
            lineHeight: 1.05,
            clipPath: `inset(0 ${(1 - tanneef) * 100}% 0 0)`,
            transform: `translateX(${(1 - tanneef) * -40}px)`,
          }}
        >
          DAARA TÀNNEEF
        </div>
        <GoldRule at={58} width={640} style={{marginTop: 46}} />
        <div style={{position: 'relative', width: bw, height: bh, margin: '64px auto 0'}}>
          <svg width={bw} height={bh} style={{position: 'absolute', inset: 0}}>
            <rect
              x={2}
              y={2}
              width={bw - 4}
              height={bh - 4}
              fill="none"
              stroke={C.gold}
              strokeWidth={3.5}
              strokeDasharray={per}
              strokeDashoffset={per * (1 - box)}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 40,
              color: C.white,
              letterSpacing: interpolate(boxText, [0, 1], [28, 11], clamp),
              opacity: boxText,
              paddingLeft: 11,
            }}
          >
            DAARA PUBLIQUE
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
