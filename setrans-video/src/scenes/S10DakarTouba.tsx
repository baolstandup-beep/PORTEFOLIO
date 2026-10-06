import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FONTS, PLACES, TEXTS } from '../config/setrans.config';
import { DarkBackground, Grid, Particles } from '../components/Base';
import { SenegalMap } from '../components/Maps';
import { EASE, progress } from '../lib/anim';
import { useLayout } from '../lib/layout';
import type { SceneProps } from './types';

const SECONDARY = ['saintLouis', 'thies', 'kaolack', 'ziguinchor', 'tambacounda'] as const;

/** SCÈNE 10 — Carte du Sénégal : Dakar, puis la ligne vers Touba (point principal). */
export const S10DakarTouba: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const { W, V } = useLayout();
  const intro = progress(f, 0, 1.0, EASE.soft);
  const dakar = progress(f, 0.6, 1.2, EASE.out);
  const route = progress(f, 1.4, 3.6, EASE.inOut);
  const touba = progress(f, 3.3, 4.0, EASE.out);
  const zoom = 1 + (V ? 0.05 : 0.1) * progress(f, 0, duration, EASE.soft);
  const pulse = touba > 0 ? ((f / 30 - 3.3) % 1.4) / 1.4 : 0;
  return (
    <DarkBackground glow={0.3}>
      <Grid opacity={0.04} />
      <Particles count={30} seed={11} opacity={0.25} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: V ? '62% 50%' : '52% 50%', opacity: intro }}>
        <SenegalMap
          box={V ? { x: 150, y: 520, w: W - 230, h: 900 } : { x: 360, y: 110, w: 1200, h: 860 }}
          dots={SECONDARY.map((k) => ({ at: PLACES[k], r: 3, opacity: 0.45 * intro }))}
        >
          {(project) => {
            const [dx, dy] = project(PLACES.dakar);
            const [tx, ty] = project(PLACES.touba);
            // Courbe élégante (quadratique) Dakar → Touba
            const cx = (dx + tx) / 2;
            const cy = Math.min(dy, ty) - 150;
            const d = `M ${dx} ${dy} Q ${cx} ${cy} ${tx} ${ty}`;
            return (
              <g>
                <path d={d} fill="none" stroke={COLORS.blueGlow} strokeWidth={12} strokeOpacity={0.12}
                  pathLength={1} strokeDasharray={1} strokeDashoffset={1 - route} strokeLinecap="round" />
                <path d={d} fill="none" stroke={COLORS.white} strokeWidth={3}
                  pathLength={1} strokeDasharray={1} strokeDashoffset={1 - route} strokeLinecap="round" />
                {/* Dakar */}
                <g opacity={dakar}>
                  <circle cx={dx} cy={dy} r={9} fill={COLORS.white} />
                  <circle cx={dx} cy={dy} r={20} fill={COLORS.white} opacity={0.15} />
                  <text x={dx - 26} y={dy + 52} fill={COLORS.greyLight} fontFamily={FONTS.title} fontSize={30}
                    fontWeight={600} letterSpacing="0.2em">{TEXTS.cities.dakar}</text>
                </g>
                {/* Touba — marqueur principal */}
                <g opacity={touba} transform={`translate(${tx} ${ty}) scale(${0.6 + 0.4 * touba})`}>
                  <circle r={22 + pulse * 70} fill="none" stroke={COLORS.blueGlow} strokeWidth={2} opacity={1 - pulse} />
                  <circle r={46} fill={COLORS.blueGlow} opacity={0.18} />
                  <circle r={22} fill={COLORS.blue} stroke={COLORS.white} strokeWidth={3} />
                  <circle r={8} fill={COLORS.white} />
                  <text x={44} y={14} fill={COLORS.white} fontFamily={FONTS.title} fontSize={54} fontWeight={800}
                    letterSpacing="0.2em">{TEXTS.cities.touba}</text>
                </g>
              </g>
            );
          }}
        </SenegalMap>
      </AbsoluteFill>
    </DarkBackground>
  );
};
