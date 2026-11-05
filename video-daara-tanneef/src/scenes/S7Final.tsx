import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease} from '../components/anim';
import {LogoReveal} from '../components/LogoReveal';
import {GoldRule, Words} from '../components/Text';
import {C, FONT} from '../theme';

export const S7Final: React.FC = () => {
  const f = useCurrentFrame();
  const cam = ease(f, 0, 150, 1.0, 1.06);
  const fadeAll = 1 - ease(f, 118, 146); // fondu final : seul le filet doré reste
  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      <AbsoluteFill style={{alignItems: 'center', opacity: fadeAll, transform: `scale(${cam})`}}>
        <div style={{position: 'absolute', top: 260}}>
          <LogoReveal size={500} delay={4} />
        </div>
        <div style={{position: 'absolute', top: 1080, width: 980}}>
          <Words
            text="ENSEMBLE, CONSTRUISONS"
            delay={30}
            stagger={7}
            style={{fontSize: 72, fontWeight: 900, color: C.white, lineHeight: 1.15}}
          />
          <Words
            text="L’AVENIR DE NOS ENFANTS."
            delay={46}
            stagger={7}
            highlight={['L’AVENIR']}
            style={{fontSize: 72, fontWeight: 900, color: C.white, lineHeight: 1.15, marginTop: 6}}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 1530,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 36,
            color: C.white,
            opacity: ease(f, 70, 92) * 0.9,
            letterSpacing: 1,
          }}
        >
          Dimanche 08 novembre 2026 · Ndaam
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 1488, width: '100%'}}>
        <GoldRule at={62} width={520} thickness={4} />
      </div>
    </AbsoluteFill>
  );
};
