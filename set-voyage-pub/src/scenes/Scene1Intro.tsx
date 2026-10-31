import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { SCENES } from '../config';
import { Cloud, Sky } from '../components/Sky';
import { Plane } from '../components/Plane';
import { Logo } from '../components/Logo';
import { clamp, easeInOut, easeOut, springIn } from '../lib/anim';
import { COULEURS, FONTS } from '../theme';

const D = SCENES.intro;

/** Avion qui traverse l'écran en diagonale (isolé pour le motion blur). */
const FlyBy: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [8, 95], [0, 1], { ...clamp, easing: easeInOut });
  const x = interpolate(t, [0, 1], [-700, 1700]);
  const y = interpolate(t, [0, 1], [1500, 380]);
  const s = interpolate(t, [0, 1], [1.5, 0.75]);
  const bank = interpolate(t, [0, 0.5, 1], [-24, -28, -20]);
  return <Plane x={x} y={y} width={900 * s} rotate={bank} trail={900 * s} />;
};

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Caméra : la scène entière recule doucement (push-out) + léger roulis.
  const cam = interpolate(frame, [0, D], [1.18, 1], { ...clamp, easing: easeOut });
  const roll = interpolate(frame, [0, D], [-1.5, 0], clamp);

  // Nuages d'ouverture qui s'écartent devant la caméra.
  const part = interpolate(frame, [0, 45], [0, 1], { ...clamp, easing: easeOut });
  const partFade = interpolate(frame, [20, 50], [1, 0], clamp);

  const sub = springIn(frame, fps, 100);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <AbsoluteFill style={{ transform: `scale(${cam}) rotate(${roll}deg)` }}>
        <Sky drift={1.6} top={COULEURS.bleuNuit} />
        <CameraMotionBlur shutterAngle={200} samples={6}>
          <FlyBy />
        </CameraMotionBlur>
      </AbsoluteFill>

      {/* Logo */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingBottom: 140 }}>
        <Logo delay={62} emblem={290} />
        <div
          style={{
            marginTop: 70,
            fontFamily: FONTS.texte,
            fontWeight: 500,
            fontSize: 44,
            color: '#fff',
            opacity: sub,
            transform: `translateY(${(1 - sub) * 30}px)`,
            textShadow: '0 4px 20px rgba(6,26,64,0.5)',
          }}
        >
          Votre prochain voyage commence ici.
        </div>
      </AbsoluteFill>

      {/* Nuages d'avant-plan qui s'ouvrent (effet « traversée des nuages ») */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: partFade }}>
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-part * 1900}px) scale(${1 + part * 0.6})` }}>
          <Cloud x={-500} y={300} scale={4.2} blur={6} />
          <Cloud x={-400} y={1300} scale={4} blur={6} />
        </div>
        <div style={{ position: 'absolute', inset: 0, transform: `translateX(${part * 1900}px) scale(${1 + part * 0.6})` }}>
          <Cloud x={700} y={700} scale={4.4} blur={6} />
          <Cloud x={600} y={1700} scale={3.6} blur={6} />
        </div>
        <AbsoluteFill style={{ background: '#fff', opacity: interpolate(frame, [0, 18], [1, 0], clamp) }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
