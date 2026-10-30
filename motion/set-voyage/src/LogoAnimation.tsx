import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Airplane} from './Scenes/Airplane';
import {Final} from './Scenes/Final';
import {Intro} from './Scenes/Intro';
import {LogoReveal} from './Scenes/LogoReveal';
import {CONTENT_CX, CONTENT_CY, LOGO_H, LOGO_W, T, easeInOut, progress} from './layout';

/**
 * Le logo dans son propre repère (pixels du JPG source), centré sur sa zone
 * encrée et mis à l'échelle. Légère inclinaison 3D qui se redresse, ombre
 * portée douce et poussée finale.
 */
export const LogoAnimation: React.FC<{scale: number; cx: number; cy: number}> = ({
  scale,
  cx,
  cy,
}) => {
  const frame = useCurrentFrame();
  const settle = progress(frame, [0, 150], easeInOut);
  const rotX = interpolate(settle, [0, 1], [9, 0]);
  const rotY = interpolate(settle, [0, 1], [-7, 0]);
  const push = 1 + 0.035 * progress(frame, T.push, easeInOut);
  const shadow = 0.1 + 0.08 * progress(frame, [T.set[0], T.push[1]]);

  return (
    <div style={{position: 'absolute', inset: 0, perspective: 1800}}>
      <div
        style={{
          position: 'absolute',
          left: cx - CONTENT_CX,
          top: cy - CONTENT_CY,
          width: LOGO_W,
          height: LOGO_H,
          transformOrigin: `${CONTENT_CX}px ${CONTENT_CY}px`,
          transform: `scale(${scale * push}) rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          filter: `drop-shadow(0 16px 22px rgba(16, 40, 90, ${shadow}))`,
        }}
      >
        <Intro />
        <LogoReveal />
        <Airplane />
        <Final />
      </div>
    </div>
  );
};
