import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ease} from '../components/anim';
import {LogoReveal} from '../components/LogoReveal';
import {GoldRule, Words} from '../components/Text';
import {C} from '../theme';

export const S1Intro: React.FC = () => {
  const f = useCurrentFrame();
  const cam = ease(f, 0, 130, 1.1, 1);
  return (
    <AbsoluteFill style={{transform: `scale(${cam})`, alignItems: 'center'}}>
      <div style={{position: 'absolute', top: 330}}>
        <LogoReveal size={560} delay={4} />
      </div>
      <div style={{position: 'absolute', top: 1260, width: 960}}>
        <Words text="UN NOUVEAU PROJET," delay={46} stagger={6} style={{fontSize: 66, fontWeight: 800, color: C.white, letterSpacing: 1}} />
        <Words
          text="UN NOUVEL ESPOIR…"
          delay={66}
          stagger={6}
          style={{fontSize: 66, fontWeight: 800, color: C.goldLight, letterSpacing: 1, marginTop: 14}}
        />
        <GoldRule at={84} width={360} style={{marginTop: 40}} />
      </div>
    </AbsoluteFill>
  );
};
