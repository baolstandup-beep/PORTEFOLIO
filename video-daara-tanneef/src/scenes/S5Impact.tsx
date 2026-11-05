import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, ease} from '../components/anim';
import {ChildIcon} from '../components/Icons';
import {Letters, Shine, Words} from '../components/Text';
import {C, FONT} from '../theme';

const COLS = 10;
const ROWS = 10;
const CELL_W = 74;
const CELL_H = 66;

export const S5Impact: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();

  const badge = spring({frame: f - 2, fps, config: {damping: 10, mass: 0.8, stiffness: 140}});
  const count = Math.round(interpolate(f, [56, 112], [0, 100], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 2.2)}));
  const countIn = ease(f, 48, 62);
  const done = spring({frame: f - 112, fps, config: {damping: 8, mass: 0.6, stiffness: 180}});
  const split = ease(f, 118, 142);
  const labels = ease(f, 130, 152);

  return (
    <AbsoluteFill style={{alignItems: 'center'}}>
      {/* 4ème DAARA CONSTRUIT PAR TOUBA ÇA KANAM */}
      <div style={{position: 'absolute', top: 170, display: 'flex', alignItems: 'center', gap: 26}}>
        <Shine at={30} dur={26}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 170,
              lineHeight: 1,
              color: C.goldLight,
              transform: `scale(${interpolate(badge, [0, 1], [0.3, 1])})`,
              opacity: interpolate(badge, [0, 0.3], [0, 1], clamp),
              textShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}
          >
            4<span style={{fontSize: 80, verticalAlign: 'top', position: 'relative', top: 18}}>ème</span>
          </div>
        </Shine>
        <div style={{textAlign: 'left'}}>
          <Words text="DAARA CONSTRUIT" delay={10} stagger={5} style={{fontSize: 58, fontWeight: 800, color: C.white, justifyContent: 'flex-start'}} />
          <Words text="PAR TOUBA ÇA KANAM" delay={20} stagger={5} style={{fontSize: 46, fontWeight: 700, color: C.white, justifyContent: 'flex-start', marginTop: 8, opacity: 0.92}} />
        </div>
      </div>

      {/* CE DAARA VA CONTENIR : 100 ENFANTS */}
      <div style={{position: 'absolute', top: 470, width: '100%', textAlign: 'center'}}>
        <Letters
          text="CE DAARA VA CONTENIR :"
          delay={38}
          stagger={1}
          style={{fontSize: 50, fontWeight: 800, color: C.white, letterSpacing: 2}}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 28,
            marginTop: 26,
            opacity: countIn,
            transform: `scale(${0.9 + countIn * 0.1 + (f > 112 ? (1 - done) * 0.0 : 0)})`,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 200,
              lineHeight: 1,
              color: C.white,
              background: C.greenDeep,
              border: `4px solid ${C.gold}`,
              borderRadius: 18,
              padding: '14px 34px 8px',
              minWidth: 470,
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
              boxShadow: `0 0 ${f > 112 ? 60 * done : 0}px rgba(241,212,122,0.6)`,
              transform: `scale(${f > 112 ? 1 + (1 - done) * 0.12 : 1})`,
            }}
          >
            {count}
          </div>
          <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 76, color: C.white, textAlign: 'left', lineHeight: 1}}>
            ENFANTS
          </div>
        </div>
      </div>

      {/* grille de 100 enfants : 50 filles + 50 garçons */}
      <div style={{position: 'absolute', top: 960, width: COLS * CELL_W + 120, height: ROWS * CELL_H}}>
        {new Array(ROWS * COLS).fill(0).map((_, i) => {
          const row = Math.floor(i / COLS);
          const col = i % COLS;
          const girl = col < COLS / 2;
          const order = row * COLS + col; // ordre de remplissage synchronisé avec le compteur
          const on = order < count;
          const dx = (girl ? -1 : 1) * split * 60 + 60;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: col * CELL_W + dx + 10,
                top: row * CELL_H,
                opacity: on ? 1 : 0.12,
                transform: `scale(${on ? 1 : 0.7})`,
              }}
            >
              <ChildIcon girl={girl} size={50} color={girl ? C.goldLight : C.white} />
            </div>
          );
        })}
      </div>

      {/* étiquettes */}
      <div
        style={{
          position: 'absolute',
          top: 1625,
          width: 900,
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 44,
          opacity: labels,
        }}
      >
        <span style={{color: C.goldLight, width: 400, textAlign: 'center'}}>FILLES</span>
        <span style={{color: C.white, width: 400, textAlign: 'center'}}>GARÇONS</span>
      </div>
      <div style={{position: 'absolute', top: 1735, width: '100%'}}>
        <Words
          text="50 FILLES ET 50 GARÇONS"
          delay={138}
          stagger={4}
          highlight={['50']}
          style={{fontSize: 64, fontWeight: 900, color: C.white}}
        />
      </div>
    </AbsoluteFill>
  );
};
