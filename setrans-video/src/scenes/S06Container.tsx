import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { ASSETS, COLORS } from '../config/setrans.config';
import { Clip, DarkBackground, Grid } from '../components/Base';
import { Icon } from '../components/Icons';
import { EASE, progress, sec } from '../lib/anim';
import type { SceneProps } from './types';

/** Conteneur stylisé : portes qui se ferment, scellé, cadenas, validation, suivi numérique. */
const ContainerMG: React.FC = () => {
  const f = useCurrentFrame();
  const W = 760;
  const H = 400;
  const x = (1920 - W) / 2;
  const y = (1080 - H) / 2 + 10;
  const doors = progress(f, 0.2, 1.3, EASE.inOut); // 0 ouvert → 1 fermé
  const seal = progress(f, 1.3, 1.8, EASE.out);
  const lock = progress(f, 1.6, 2.2, EASE.out);
  const track = progress(f, 1.4, 3.0, EASE.inOut);
  const ok = progress(f, 2.2, 2.7, EASE.out);
  const zoom = 1 + 0.05 * progress(f, 0, 3.6, EASE.soft);
  const ribs = Array.from({ length: 11 }, (_, i) => x + 30 + i * ((W - 60) / 10));
  const doorW = W / 2;
  const perim = 2 * (W + 80 + H + 80);
  const dotPos = (track * 3) % 1;
  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="cont" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A55AE" />
            <stop offset="1" stopColor={COLORS.blue} />
          </linearGradient>
        </defs>
        {/* Ombre au sol */}
        <ellipse cx={960} cy={y + H + 40} rx={W * 0.62} ry={22} fill="#000" opacity={0.35} />
        {/* Intérieur (visible quand les portes sont ouvertes) */}
        <rect x={x} y={y} width={W} height={H} fill="#081430" />
        {/* Porte gauche */}
        <g transform={`translate(${x}, ${y}) scale(${0.08 + 0.92 * doors}, 1)`}>
          <rect width={doorW} height={H} fill="url(#cont)" stroke={COLORS.blueGlow} strokeOpacity={0.5} />
          {ribs.slice(0, 5).map((rx, i) => (
            <line key={i} x1={rx - x} y1={18} x2={rx - x} y2={H - 18} stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
          ))}
        </g>
        {/* Porte droite */}
        <g transform={`translate(${x + W}, ${y}) scale(${-(0.08 + 0.92 * doors)}, 1)`}>
          <rect width={doorW} height={H} fill="url(#cont)" stroke={COLORS.blueGlow} strokeOpacity={0.5} />
          {ribs.slice(0, 5).map((rx, i) => (
            <line key={i} x1={rx - x} y1={18} x2={rx - x} y2={H - 18} stroke="#fff" strokeOpacity={0.12} strokeWidth={6} />
          ))}
        </g>
        {/* Barres de verrouillage */}
        <g opacity={doors}>
          {[x + doorW - 70, x + doorW - 30, x + doorW + 30, x + doorW + 70].map((bx, i) => (
            <line key={i} x1={bx} y1={y + 10} x2={bx} y2={y + H - 10} stroke="#C9D3E8" strokeWidth={5} strokeOpacity={0.85} />
          ))}
        </g>
        {/* Scellé */}
        <g opacity={seal} transform={`translate(${x + doorW - 30}, ${y + H / 2})`}>
          <rect x={-14} y={-6} width={88} height={12} rx={6} fill={COLORS.white} />
          <circle cx={30} cy={0} r={14 * seal} fill={COLORS.blueGlow} />
        </g>
        {/* Cadre de suivi numérique */}
        <rect
          x={x - 40}
          y={y - 40}
          width={W + 80}
          height={H + 80}
          rx={18}
          fill="none"
          stroke={COLORS.blueGlow}
          strokeWidth={1.6}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - track}
          opacity={0.9}
        />
        {track > 0.99 && (
          <rect
            x={x - 40}
            y={y - 40}
            width={W + 80}
            height={H + 80}
            rx={18}
            fill="none"
            stroke={COLORS.white}
            strokeWidth={3}
            strokeDasharray={`40 ${perim - 40}`}
            strokeDashoffset={-dotPos * perim}
            opacity={0.8}
          />
        )}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 960 - 46,
          top: y - 150,
          opacity: lock,
          transform: `translateY(${(1 - lock) * 20}px)`,
        }}
      >
        <Icon name="lock" size={92} color={COLORS.white} strokeWidth={1.4} draw={lock} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: x + W + 70,
          top: y - 90,
          opacity: ok,
          transform: `scale(${0.7 + 0.3 * ok})`,
        }}
      >
        <Icon name="check" size={84} color={COLORS.success} strokeWidth={1.6} draw={ok} />
      </div>
    </AbsoluteFill>
  );
};

/** SCÈNE 06 — Scellé posé sur le terrain, puis conteneur « jumeau numérique » sécurisé. */
export const S06Container: React.FC<SceneProps> = ({ duration }) => {
  const f = useCurrentFrame();
  const cut = 2.6;
  const xf = progress(f, cut, cut + 0.6, EASE.soft);
  return (
    <AbsoluteFill>
      <Clip src={ASSETS.clips.seal} zoomFrom={1.04} zoomTo={1.12} dim={0.1} />
      <Sequence from={sec(cut)} durationInFrames={sec(duration - cut)}>
        <AbsoluteFill style={{ opacity: xf }}>
          <DarkBackground glow={0.4}>
            <Grid opacity={0.05} />
            <ContainerMG />
          </DarkBackground>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
