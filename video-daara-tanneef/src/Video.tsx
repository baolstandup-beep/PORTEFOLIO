import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Background, Particles} from './components/Background';
import {clamp} from './components/anim';
import {SceneShell} from './components/SceneShell';
import {S1Intro} from './scenes/S1Intro';
import {S2Annonce} from './scenes/S2Annonce';
import {S3Lieu} from './scenes/S3Lieu';
import {S4Date} from './scenes/S4Date';
import {S5Impact} from './scenes/S5Impact';
import {S6Contact} from './scenes/S6Contact';
import {S7Final} from './scenes/S7Final';
import {C} from './theme';
import {CUTS, SCENES, XF} from './timeline';

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Panneau blanc (comme la moitié basse de l'affiche) séparé du vert par un filet doré. */
const WhitePanel: React.FC = () => {
  const f = useCurrentFrame();
  const top = interpolate(
    f,
    [470, 494, 628, 650, 808, 836, 1048, 1072],
    [1920, 1240, 1240, 1920, 1920, 300, 300, 1920],
    {...clamp, easing: ease},
  );
  if (top >= 1919) return null;
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top, bottom: 0, background: C.white}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: top - 3,
          height: 7,
          background: `linear-gradient(90deg, ${C.gold}, ${C.goldLight} 50%, ${C.gold})`,
          boxShadow: '0 0 16px rgba(241,212,122,0.7)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Éclat lumineux doré qui traverse l'écran à chaque coupe. */
const Flares: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {CUTS.map((c) => {
        const p = interpolate(f, [c - 8, c + 12], [0, 1], clamp);
        if (p <= 0 || p >= 1) return null;
        const o = Math.sin(p * Math.PI);
        return (
          <AbsoluteFill key={c}>
            <div
              style={{
                position: 'absolute',
                left: -600 + p * 2300,
                top: -400,
                width: 260,
                height: 2800,
                transform: 'rotate(18deg)',
                background: 'linear-gradient(90deg, rgba(241,212,122,0), rgba(255,244,205,0.85), rgba(241,212,122,0))',
                filter: 'blur(18px)',
                opacity: o,
              }}
            />
            <AbsoluteFill style={{background: 'rgba(255,240,200,1)', opacity: o * 0.18}} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

const scenes = [
  {s: SCENES.intro, C: S1Intro},
  {s: SCENES.annonce, C: S2Annonce},
  {s: SCENES.lieu, C: S3Lieu},
  {s: SCENES.date, C: S4Date},
  {s: SCENES.impact, C: S5Impact},
  {s: SCENES.contact, C: S6Contact},
  {s: SCENES.final, C: S7Final},
];

export const Video: React.FC<{withMusic: boolean}> = ({withMusic}) => {
  const f = useCurrentFrame();
  const endFade = interpolate(f, [1180, 1199], [0, 0.35], clamp);
  return (
    <AbsoluteFill style={{backgroundColor: C.green}}>
      <Background />
      <Particles count={70} />
      <WhitePanel />
      {scenes.map(({s, C: Scene}, i) => {
        const last = i === scenes.length - 1;
        return (
          <Sequence key={i} from={s.from} durationInFrames={s.dur + (last ? 0 : XF)} name={Scene.name}>
            <SceneShell dur={s.dur} fadeIn={i > 0} fadeOut={!last}>
              <Scene />
            </SceneShell>
          </Sequence>
        );
      })}
      <Flares />
      <AbsoluteFill style={{background: C.greenDeep, opacity: endFade}} />
      {withMusic && <Audio src={staticFile('audio/bande-son.wav')} />}
    </AbsoluteFill>
  );
};
