import React from 'react';
import { geoGraticule10, geoInterpolate, geoMercator, geoNaturalEarth1, geoOrthographic, geoPath } from 'd3-geo';
import type { GeoProjection } from 'd3-geo';
import { useVideoConfig } from 'remotion';
import { COLORS } from '../config/setrans.config';
import { GAMBIA, SENEGAL, WEST_AFRICA_NEIGHBOURS, WORLD } from '../lib/geo';

type LonLat = [number, number];

/** Portion d'un grand cercle (0→t), en LineString (clippée par d3). */
const partialArc = (a: LonLat, b: LonLat, t: number) => {
  const interp = geoInterpolate(a, b);
  const steps = 64;
  const n = Math.max(2, Math.round(steps * t));
  const coords = Array.from({ length: n }, (_, i) => interp((i / (n - 1)) * t));
  return { type: 'LineString' as const, coordinates: coords };
};

export type Arc = { from: LonLat; to: LonLat; t: number; width?: number; color?: string };
export type Dot = { at: LonLat; r?: number; color?: string; opacity?: number; pulse?: number };

const ArcsAndDots: React.FC<{ projection: GeoProjection; arcs: Arc[]; dots: Dot[] }> = ({
  projection,
  arcs,
  dots,
}) => {
  const path = geoPath(projection);
  return (
    <g>
      {arcs.map((a, i) =>
        a.t > 0.001 ? (
          <g key={i}>
            <path
              d={path(partialArc(a.from, a.to, a.t)) ?? ''}
              stroke={a.color ?? COLORS.blueGlow}
              strokeWidth={(a.width ?? 1.6) * 4}
              opacity={0.12}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={path(partialArc(a.from, a.to, a.t)) ?? ''}
              stroke={a.color ?? COLORS.blueGlow}
              strokeWidth={a.width ?? 1.6}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ) : null,
      )}
      {dots.map((d, i) => {
        const p = projection(d.at);
        if (!p) return null;
        const r = d.r ?? 4;
        return (
          <g key={i} opacity={d.opacity ?? 1}>
            {d.pulse !== undefined && (
              <circle
                cx={p[0]}
                cy={p[1]}
                r={r + d.pulse * r * 5}
                fill="none"
                stroke={d.color ?? COLORS.white}
                strokeWidth={1.5}
                opacity={1 - d.pulse}
              />
            )}
            <circle cx={p[0]} cy={p[1]} r={r * 2.4} fill={d.color ?? COLORS.white} opacity={0.18} />
            <circle cx={p[0]} cy={p[1]} r={r} fill={d.color ?? COLORS.white} />
          </g>
        );
      })}
    </g>
  );
};

/** Globe terrestre stylisé (projection orthographique). */
export const Globe: React.FC<{
  rotate: [number, number];
  scale: number;
  cx?: number;
  cy?: number;
  arcs?: Arc[];
  dots?: Dot[];
  landOpacity?: number;
}> = ({ rotate, scale, cx, cy, arcs = [], dots = [], landOpacity = 1 }) => {
  const { width, height } = useVideoConfig();
  const projection = geoOrthographic()
    .scale(scale)
    .translate([cx ?? width / 2, cy ?? height / 2])
    .rotate([rotate[0], rotate[1], 0])
    .clipAngle(90);
  const path = geoPath(projection);
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <defs>
        <radialGradient id="globeFill" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#14306B" />
          <stop offset="70%" stopColor={COLORS.navy} />
          <stop offset="100%" stopColor={COLORS.night} />
        </radialGradient>
        <radialGradient id="globeAtmos" cx="50%" cy="50%" r="50%">
          <stop offset="88%" stopColor={COLORS.blueLight} stopOpacity={0} />
          <stop offset="96%" stopColor={COLORS.blueGlow} stopOpacity={0.35} />
          <stop offset="100%" stopColor={COLORS.blueGlow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle
        cx={cx ?? width / 2}
        cy={cy ?? height / 2}
        r={scale * 1.08}
        fill="url(#globeAtmos)"
      />
      <path d={path({ type: 'Sphere' }) ?? ''} fill="url(#globeFill)" stroke={COLORS.blueLight} strokeOpacity={0.5} />
      <path d={path(geoGraticule10()) ?? ''} fill="none" stroke={COLORS.blueGlow} strokeOpacity={0.08} />
      <g opacity={landOpacity}>
        {WORLD.features.map((f, i) => (
          <path
            key={i}
            d={path(f) ?? ''}
            fill={String(f.id) === '686' ? COLORS.blue : '#1A3470'}
            stroke={COLORS.blueGlow}
            strokeOpacity={0.35}
            strokeWidth={0.6}
          />
        ))}
      </g>
      <ArcsAndDots projection={projection} arcs={arcs} dots={dots} />
    </svg>
  );
};

/**
 * Carte du monde « à plat », centrée et zoomée sur un point.
 * `zoom` 1 = monde entier, valeurs plus grandes = rapprochement.
 */
export const FlatWorld: React.FC<{
  center: LonLat;
  zoom: number;
  arcs?: Arc[];
  dots?: Dot[];
  landColor?: string;
  strokeColor?: string;
  highlight?: string[];
  opacity?: number;
}> = ({
  center,
  zoom,
  arcs = [],
  dots = [],
  landColor = '#132A5C',
  strokeColor = COLORS.blueGlow,
  highlight = ['686'],
  opacity = 1,
}) => {
  const { width, height } = useVideoConfig();
  const projection = geoNaturalEarth1()
    .scale(330 * zoom)
    .rotate([-center[0], 0, 0])
    .center([0, center[1]])
    .translate([width / 2, height / 2]);
  const path = geoPath(projection);
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0, opacity }}>
      <g>
        {WORLD.features.map((f, i) => (
          <path
            key={i}
            d={path(f) ?? ''}
            fill={highlight.includes(String(f.id)) ? COLORS.blue : landColor}
            stroke={strokeColor}
            strokeOpacity={0.25}
            strokeWidth={0.7}
          />
        ))}
      </g>
      <ArcsAndDots projection={projection} arcs={arcs} dots={dots} />
    </svg>
  );
};

/** Carte propre du Sénégal, ajustée à un cadre. */
export const SenegalMap: React.FC<{
  box: { x: number; y: number; w: number; h: number };
  /** Tracé progressif du contour (0→1). */
  draw?: number;
  fill?: number;
  arcs?: Arc[];
  dots?: Dot[];
  stroke?: string;
  fillColor?: string;
  neighbours?: number;
  children?: (project: (p: LonLat) => [number, number]) => React.ReactNode;
}> = ({
  box,
  draw = 1,
  fill = 1,
  arcs = [],
  dots = [],
  stroke = COLORS.blueGlow,
  fillColor = COLORS.blue,
  neighbours = 0.5,
  children,
}) => {
  const { width, height } = useVideoConfig();
  const projection = geoMercator().fitExtent(
    [
      [box.x, box.y],
      [box.x + box.w, box.y + box.h],
    ],
    SENEGAL,
  );
  const path = geoPath(projection);
  const project = (p: LonLat) => projection(p) as [number, number];
  return (
    <svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
      <g opacity={neighbours}>
        {WEST_AFRICA_NEIGHBOURS.map((f, i) => (
          <path key={i} d={path(f) ?? ''} fill="none" stroke={stroke} strokeOpacity={0.18} strokeWidth={1} />
        ))}
      </g>
      <path d={path(GAMBIA) ?? ''} fill={stroke} fillOpacity={0.05 * fill} stroke={stroke} strokeOpacity={0.3 * fill} />
      <path
        d={path(SENEGAL) ?? ''}
        fill={fillColor}
        fillOpacity={0.55 * fill}
        stroke={stroke}
        strokeWidth={2.2}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - draw}
        strokeLinejoin="round"
      />
      <ArcsAndDots projection={projection} arcs={arcs} dots={dots} />
      {children?.(project)}
    </svg>
  );
};
