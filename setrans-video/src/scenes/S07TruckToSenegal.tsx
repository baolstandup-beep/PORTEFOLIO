import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS } from '../config/setrans.config';
import { Clip, DarkBackground, Grid } from '../components/Base';
import { SenegalMap } from '../components/Maps';
import { EASE, progress } from '../lib/anim';
import type { SceneProps } from './types';

/**
 * SCÈNE 07 — Le camion quitte le port ; la route devient une ligne,
 * la ligne dessine la silhouette du Sénégal. Pas de coupure franche.
 */
export const S07TruckToSenegal: React.FC<SceneProps> = () => {
  const f = useCurrentFrame();
  const road = progress(f, 0.4, 3.0, EASE.inOut);
  const toGraphic = progress(f, 2.6, 3.6, EASE.inOut);
  const lineCollapse = progress(f, 3.4, 4.4, EASE.inOut);
  const draw = progress(f, 3.5, 5.6, EASE.inOut);
  const fill = progress(f, 4.8, 6.2, EASE.soft);
  const y = 900;
  // La route lumineuse se resserre vers le point de départ du contour (Saint-Louis).
  const xStart = 120 + 700 * lineCollapse;
  const xEnd = 120 + 1680 * road - 520 * lineCollapse;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.night }}>
      <AbsoluteFill style={{ opacity: 1 - toGraphic }}>
        <Clip src={ASSETS.clips.truckHighway} zoomFrom={1.02} zoomTo={1.1} panX={-30} dim={0.1} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: toGraphic }}>
        <DarkBackground glow={0.3}>
          <Grid opacity={0.04} />
        </DarkBackground>
      </AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, opacity: 1 - progress(f, 3.5, 4.4, EASE.soft) }}>
        <line
          x1={xStart}
          y1={y - 320 * lineCollapse}
          x2={Math.max(xStart, xEnd)}
          y2={y - 320 * lineCollapse}
          stroke={COLORS.blueGlow}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <line
          x1={xStart}
          y1={y - 320 * lineCollapse}
          x2={Math.max(xStart, xEnd)}
          y2={y - 320 * lineCollapse}
          stroke={COLORS.blueGlow}
          strokeWidth={14}
          strokeOpacity={0.15}
          strokeLinecap="round"
        />
      </svg>
      {draw > 0 && (
        <AbsoluteFill style={{ transform: `scale(${0.96 + 0.04 * fill})` }}>
          <SenegalMap box={{ x: 560, y: 190, w: 800, h: 700 }} draw={draw} fill={fill} neighbours={0.4 * fill} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
