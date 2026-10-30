import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Layer} from '../Layer';
import {COLORS, LOGO, LOGO_H, LOGO_W, T, easeInOut, progress} from '../layout';

const {cx, cy, r} = LOGO.dome;

// Le globe gris se dévoile en balayage autour de ce point (sous l'emblème).
const GLOBE_PIVOT = {x: 585, y: 420};

const conicReveal = (x: number, y: number, from: number, sweep: number) =>
  `conic-gradient(from ${from}deg at ${x}px ${y}px, #000 0deg, #000 ${sweep}deg, transparent ${sweep + 5}deg, transparent 360deg)`;

/** Point du cercle du dôme pour un angle mesuré depuis la gauche (0 = gauche, 180 = droite). */
const domePoint = (deg: number) => {
  const a = Math.PI - (deg * Math.PI) / 180;
  return {x: cx + r * Math.cos(a), y: cy - r * Math.sin(a)};
};

/**
 * Scène 1 : la lumière bleue trace l'arc du dôme, le globe se construit en
 * tracé, puis les arcs bleus se remplissent en balayage.
 */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // Ligne lumineuse : arc du dôme dessiné de gauche à droite.
  const line = progress(frame, T.lightLine, easeInOut);
  const lineFade = 1 - progress(frame, [T.dome[1] - 26, T.dome[1]]);
  const arcLen = Math.PI * r;
  const head = domePoint(line * 180);
  const start = domePoint(0);
  const end = domePoint(180);

  // Globe : balayage de 230° depuis la gauche.
  const globe = progress(frame, T.globe, easeInOut);
  // Dôme et arcs : balayage autour du centre du dôme.
  const dome = progress(frame, T.dome, easeInOut);
  const domeLift = (1 - progress(frame, T.dome)) * 14;

  return (
    <>
      <Layer
        name="globe"
        style={{
          opacity: globe > 0 ? 1 : 0,
          maskImage: conicReveal(GLOBE_PIVOT.x, GLOBE_PIVOT.y, 245, globe * 240),
          WebkitMaskImage: conicReveal(GLOBE_PIVOT.x, GLOBE_PIVOT.y, 245, globe * 240),
        }}
      />
      <Layer
        name="dome"
        style={{
          opacity: dome > 0 ? 1 : 0,
          transform: `translateY(${domeLift}px)`,
          maskImage: conicReveal(cx, cy, 262, dome * 205),
          WebkitMaskImage: conicReveal(cx, cy, 262, dome * 205),
        }}
      />
      <svg
        width={LOGO_W}
        height={LOGO_H}
        style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: lineFade}}
      >
        <defs>
          <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke={COLORS.blueGlow}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={arcLen * (1 - line)}
          filter="url(#lineGlow)"
        />
        {line > 0 && line < 1 ? (
          <circle cx={head.x} cy={head.y} r={7} fill="#fff" filter="url(#lineGlow)" />
        ) : null}
      </svg>
    </>
  );
};
