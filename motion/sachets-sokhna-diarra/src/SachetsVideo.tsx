import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, SANS, SCRIPT} from './theme';

export const FPS = 30;
// 120 BPM : un temps = 15 images, une mesure = 60 images. Toutes les coupes tombent sur la grille.
const BEAT = 15;
const WIPE = 14;
export const SCENES = {
  intro: {from: 0, len: 6 * BEAT},
  blanc: {from: 6 * BEAT, len: 8 * BEAT},
  vert: {from: 14 * BEAT, len: 8 * BEAT},
  orange: {from: 22 * BEAT, len: 8 * BEAT},
  trio: {from: 30 * BEAT, len: 10 * BEAT},
  outro: {from: 40 * BEAT, len: 8 * BEAT},
};
export const DURATION = SCENES.outro.from + SCENES.outro.len;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

// ---------- briques ----------

const CircleWipe: React.FC<{children: React.ReactNode; x?: number; y?: number}> = ({
  children,
  x = 50,
  y = 50,
}) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [0, WIPE], [0, 150], {...clamp, easing: easeInOut});
  return (
    <AbsoluteFill style={{clipPath: `circle(${r}% at ${x}% ${y}%)`}}>{children}</AbsoluteFill>
  );
};

const Backdrop: React.FC<{base: string; deep: string; accent: string}> = ({base, deep, accent}) => {
  const f = useCurrentFrame();
  const spin = f * 0.25;
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 42%, ${base} 0%, ${deep} 100%)`}}>
      {/* rayons lents derrière le produit */}
      <AbsoluteFill
        style={{
          opacity: 0.12,
          background: `repeating-conic-gradient(from ${spin}deg at 50% 44%, ${accent} 0deg 6deg, transparent 6deg 18deg)`,
          maskImage: 'radial-gradient(circle at 50% 44%, black 0%, transparent 62%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 44%, black 0%, transparent 62%)',
        }}
      />
      {/* grain de points */}
      <AbsoluteFill
        style={{
          opacity: 0.08,
          backgroundImage: `radial-gradient(${accent} 2px, transparent 2.5px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: `0 ${-f * 0.6}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const Marquee: React.FC<{text: string; y: number; color: string; speed?: number; size?: number}> = ({
  text,
  y,
  color,
  speed = 4,
  size = 230,
}) => {
  const f = useCurrentFrame();
  const row = Array(6).fill(text).join('  •  ');
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: 0,
        whiteSpace: 'nowrap',
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: `3px ${color}`,
        transform: `translateX(${-((f * speed) % 2400)}px)`,
      }}
    >
      {row}
    </div>
  );
};

type BagProps = {src: string; delay?: number; height: number; from?: 'top' | 'right' | 'bottom' | 'left'; tilt?: number};

const Bag: React.FC<BagProps> = ({src, delay = 0, height, from = 'top', tilt = 0}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f - delay;
  const s = spring({frame: t, fps, config: {damping: 13, stiffness: 110, mass: 0.9}});
  const off = (1 - s) * 1500;
  const dx = from === 'right' ? off : from === 'left' ? -off : 0;
  const dy = from === 'top' ? -off : from === 'bottom' ? off : 0;
  // balancement amorti autour de la poignée, puis flottement continu
  const swing = Math.sin(t / 5.5) * 9 * Math.exp(-Math.max(t, 0) / 22) * (t > 0 ? 1 : 0);
  const float = Math.sin(t / 18) * 12;
  const breathe = 1 + Math.sin(t / 22) * 0.012;
  const turn = from === 'right' || from === 'left' ? (1 - s) * (from === 'right' ? -55 : 55) : 0;
  const shadow = interpolate(s, [0, 1], [0, 1], clamp);
  return (
    <div style={{position: 'relative', height, width: height * 0.656}}>
      <div
        style={{
          position: 'absolute',
          left: '8%',
          right: '8%',
          bottom: -50,
          height: 70,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.35)',
          filter: 'blur(28px)',
          opacity: shadow * (0.9 - Math.sin(t / 18) * 0.1),
          transform: `translateX(${dx * 0.3}px) scaleX(${0.85 + Math.sin(t / 18) * 0.05})`,
        }}
      />
      <Img
        src={staticFile(src)}
        style={{
          height,
          transformOrigin: '50% 14%',
          transform: `perspective(1800px) translate(${dx}px, ${dy + float}px) rotateY(${turn}deg) rotate(${swing + tilt}deg) scale(${breathe})`,
          filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.28))',
        }}
      />
    </div>
  );
};

const Words: React.FC<{text: string; delay?: number; size: number; color: string; weight?: number; stagger?: number; font?: string}> = ({
  text,
  delay = 0,
  size,
  color,
  weight = 800,
  stagger = 3,
  font = SANS,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${size * 0.25}px`}}>
      {text.split(' ').map((w, i) => {
        const p = interpolate(f - delay - i * stagger, [0, 12], [0, 1], {...clamp, easing: easeOut});
        return (
          <span key={i} style={{overflow: 'hidden', display: 'inline-block', paddingBottom: size * 0.08}}>
            <span
              style={{
                display: 'inline-block',
                fontFamily: font,
                fontWeight: weight,
                fontSize: size,
                lineHeight: 1.05,
                color,
                transform: `translateY(${(1 - p) * 110}%)`,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

const Pill: React.FC<{children: React.ReactNode; bg: string; color: string; delay: number; size?: number}> = ({
  children,
  bg,
  color,
  delay,
  size = 52,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: f - delay, fps, config: {damping: 12, stiffness: 160}});
  return (
    <div
      style={{
        background: bg,
        color,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        padding: `${size * 0.32}px ${size * 0.6}px ${size * 0.2}px`,
        borderRadius: 999,
        transform: `scale(${s})`,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  );
};

// ---------- scènes ----------

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - 4, fps, config: {damping: 11, stiffness: 120}});
  const reveal = interpolate(f, [2, 18], [0, 75], {...clamp, easing: easeOut});
  const rings = [0, 6, 12].map((d) => interpolate(f - d, [0, 30], [0, 1], {...clamp, easing: easeOut}));
  const exit = interpolate(f, [70, 90], [1, 1.25], {...clamp, easing: Easing.in(Easing.cubic)});
  return (
    <AbsoluteFill>
      <Backdrop base={C.green} deep={C.greenDeep} accent={C.white} />
      {rings.map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '40%',
            width: 1300,
            height: 1300,
            marginLeft: -650,
            marginTop: -650,
            borderRadius: '50%',
            border: `${18 - i * 5}px solid ${i === 1 ? C.white : C.orange}`,
            transform: `scale(${r * (1 + i * 0.12)})`,
            opacity: 1 - r * 0.85,
          }}
        />
      ))}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', transform: `scale(${exit})`}}>
        <div style={{transform: `translateY(-180px) scale(${0.6 + pop * 0.4}) rotate(${(1 - pop) * -25}deg)`, clipPath: `circle(${reveal}% at 50% 50%)`}}>
          <Img src={staticFile('logo-blanc.png')} style={{width: 760}} />
        </div>
        <div style={{position: 'absolute', top: 1330, width: 900}}>
          <Words text="présente ses" delay={30} size={70} color={C.white} weight={600} />
          <Words text="NOUVEAUX SACHETS" delay={36} size={118} color={C.orange} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

type HeroProps = {
  bag: string;
  base: string;
  deep: string;
  accent: string;
  word: string;
  title: string;
  titleColor: string;
  sub: string;
  pillBg: string;
  pillColor: string;
  from: BagProps['from'];
  wipeFrom: [number, number];
};

const Hero: React.FC<HeroProps> = (p) => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, SCENES.blanc.len], [1, 1.06]);
  return (
    <CircleWipe x={p.wipeFrom[0]} y={p.wipeFrom[1]}>
      <Backdrop base={p.base} deep={p.deep} accent={p.accent} />
      <AbsoluteFill style={{opacity: 0.35}}>
        <Marquee text={p.word} y={300} color={p.accent} />
        <Marquee text={p.word} y={1150} color={p.accent} speed={-3} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        <AbsoluteFill style={{alignItems: 'center', top: 150}}>
          <Bag src={p.bag} height={1180} delay={4} from={p.from} />
        </AbsoluteFill>
        <div style={{position: 'absolute', top: 1450, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
          <Words text={p.title} delay={18} size={124} color={p.titleColor} />
          <Pill bg={p.pillBg} color={p.pillColor} delay={30}>
            {p.sub}
          </Pill>
        </div>
      </AbsoluteFill>
    </CircleWipe>
  );
};

const Trio: React.FC = () => {
  const f = useCurrentFrame();
  const tags = ['Toujours Frais', 'Prix Bas', 'Qualité Garantie'];
  const zoom = interpolate(f, [0, SCENES.trio.len], [1.04, 1]);
  return (
    <CircleWipe y={45}>
      <AbsoluteFill style={{background: `radial-gradient(110% 70% at 50% 45%, ${C.white} 0%, ${C.cream} 55%, #F3E3CC 100%)`}} />
      <AbsoluteFill style={{opacity: 0.5}}>
        <Marquee text="SOKHNA DIARRA" y={760} color="#EBD3B4" size={260} speed={3} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 170, width: '100%'}}>
        <Words text="3 couleurs." delay={6} size={130} color={C.green} />
        <Words text="1 seule promesse." delay={14} size={100} color={C.orange} />
      </div>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <div style={{position: 'absolute', top: 600, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start'}}>
          <div style={{marginRight: -200, marginTop: 90, zIndex: 1}}>
            <Bag src="sachet-vert.png" height={700} delay={14} from="left" tilt={-9} />
          </div>
          <div style={{zIndex: 3}}>
            <Bag src="sachet-blanc.png" height={840} delay={6} from="bottom" />
          </div>
          <div style={{marginLeft: -200, marginTop: 90, zIndex: 2}}>
            <Bag src="sachet-orange.png" height={700} delay={22} from="right" tilt={9} />
          </div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 1640, width: '100%', display: 'flex', justifyContent: 'center', gap: 18}}>
        {tags.map((t, i) => (
          <Pill key={t} bg={i === 1 ? C.orange : C.green} color={C.white} delay={60 + i * BEAT} size={46}>
            {t}
          </Pill>
        ))}
      </div>
    </CircleWipe>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: f - 4, fps, config: {damping: 12, stiffness: 100}});
  const band = interpolate(f, [16, 32], [0, 1], {...clamp, easing: easeOut});
  const sign = interpolate(f, [52, 84], [0, 100], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <CircleWipe y={40}>
      <Backdrop base={C.orange} deep={C.orangeDeep} accent={C.white} />
      <AbsoluteFill style={{alignItems: 'center'}}>
        <div style={{marginTop: 210, transform: `scale(${logo}) rotate(${(1 - logo) * 20}deg)`}}>
          <Img src={staticFile('logo-blanc.png')} style={{width: 640}} />
        </div>
        <div
          style={{
            marginTop: 70,
            background: C.green,
            color: C.white,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 52,
            padding: '22px 36px 12px',
            clipPath: `inset(0 ${(1 - band) * 100}% 0 0)`,
            whiteSpace: 'nowrap',
          }}
        >
          FRUITS · LÉGUMES · ÉPICERIE · RIZ · HUILE
        </div>
        <div style={{marginTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
          <Pill bg={C.white} color={C.green} delay={26} size={66}>
            75 639 28 28
          </Pill>
          <Pill bg={C.white} color={C.green} delay={32} size={66}>
            78 275 83 83
          </Pill>
          <Pill bg={C.greenDeep} color={C.white} delay={40} size={48}>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 14}}>
              <svg width="34" height="44" viewBox="0 0 24 32" style={{marginTop: -10}}>
                <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20.4 12 32 12 32s12-11.6 12-20.3C24 5.2 18.6 0 12 0zm0 16.5a4.8 4.8 0 1 1 0-9.6 4.8 4.8 0 0 1 0 9.6z" fill={C.orange} />
              </svg>
              Touba
            </span>
          </Pill>
        </div>
        <div
          style={{
            marginTop: 70,
            fontFamily: SCRIPT,
            fontSize: 112,
            color: C.white,
            clipPath: `inset(0 ${100 - sign}% 0 0)`,
            whiteSpace: 'nowrap',
          }}
        >
          Service proche &amp; confiance
        </div>
      </AbsoluteFill>
    </CircleWipe>
  );
};

export const SachetsVideo: React.FC = () => {
  const s = SCENES;
  // chaque scène reste à l'écran pendant le volet circulaire de la suivante
  const seq = (k: keyof typeof SCENES, node: React.ReactNode, last = false) => (
    <Sequence from={s[k].from} durationInFrames={s[k].len + (last ? 0 : WIPE)}>
      {node}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{background: C.greenDeep}}>
      {seq('intro', <Intro />)}
      {seq(
        'blanc',
        <Hero bag="sachet-blanc.png" base={C.green} deep={C.greenDeep} accent={C.white} word="BLANC" title="Édition Blanche"
          titleColor={C.white} sub="Logo vert & orange" pillBg={C.orange} pillColor={C.white} from="top" wipeFrom={[50, 40]} />,
      )}
      {seq(
        'vert',
        <Hero bag="sachet-vert.png" base={C.orange} deep={C.orangeDeep} accent={C.white} word="VERT" title="Édition Verte"
          titleColor={C.white} sub="Fraîcheur garantie" pillBg={C.green} pillColor={C.white} from="right" wipeFrom={[100, 50]} />,
      )}
      {seq(
        'orange',
        <Hero bag="sachet-orange.png" base={C.green} deep={C.greenDeep} accent={C.orange} word="ORANGE" title="Édition Orange"
          titleColor={C.white} sub="Prix bas, tous les jours" pillBg={C.orange} pillColor={C.white} from="bottom" wipeFrom={[0, 50]} />,
      )}
      {seq('trio', <Trio />)}
      {seq('outro', <Outro />, true)}
      <Audio src={staticFile('bande-son.wav')} />
    </AbsoluteFill>
  );
};
