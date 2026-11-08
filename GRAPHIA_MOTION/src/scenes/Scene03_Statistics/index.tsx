import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp, mulberry32 } from '../../utils/anim';
import { useFormat } from '../../utils/layout';
import { Counter, DigitRoll } from '../../animations/Counter';
import { Grain } from '../../components/Grain';
import { PanelWipe } from '../../transitions/PanelWipe';
import { SceneProps } from '../types';

/**
 * SCÈNE 03 — LES OPPORTUNITÉS. Plan fixe frontal sur le vert de la marque (le bandeau « 50 / 5 / 1 »
 * de l'affiche officielle, réinterprété). Chaque chiffre a SA propre animation et apparaît quand la
 * voix off le prononce.
 */
type CellProps = { t: number; at: number; u: number; w: number; v: boolean };

const Card: React.FC<CellProps & { children: React.ReactNode; label: string; num: React.ReactNode }> = ({ t, at, u, w, children, label, num, v }) => {
  const p = prog(t, at - 0.15, 0.8, EASE.out);
  const numSize = (v ? 150 : 150) * u;
  return (
    <div
      style={{
        width: w, opacity: Math.min(1, p * 2), transform: `translateY(${lerp(80, 0, p) * u}px)`,
        background: 'rgba(3,56,27,0.55)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 28 * u,
        padding: `${30 * u}px ${28 * u}px ${34 * u}px`, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 * u,
        boxShadow: '0 30px 60px -30px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ height: 150 * u, width: '100%', position: 'relative' }}>{children}</div>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: numSize, lineHeight: 1, color: C.paper, letterSpacing: '-0.04em', height: numSize, display: 'flex', alignItems: 'flex-start' }}>{num}</div>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 25 * u, lineHeight: 1.2, color: C.paper, letterSpacing: '0.06em', textTransform: 'uppercase', minHeight: 62 * u }}>{label}</div>
    </div>
  );
};

/** 50 points qui volent se ranger en grille 10 × 5 : une place = un point. */
const Dots: React.FC<{ t: number; at: number; w: number; u: number }> = ({ t, at, w, u }) => {
  const pts = useMemo(() => {
    const r = mulberry32(50);
    return Array.from({ length: 50 }, () => ({ x: (r() - 0.5) * 600, y: (r() - 0.5) * 400, d: r() * 0.5 }));
  }, []);
  const cols = 10;
  const gap = w / cols;
  const dot = gap * 0.5;
  return (
    <>
      {pts.map((p, i) => {
        const k = prog(t, at + p.d, 0.75, EASE.out);
        const gx = (i % cols) * gap + gap / 2;
        const gy = Math.floor(i / cols) * gap * 0.95 + gap / 2;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: lerp(gx + p.x * u, gx, k) - dot / 2, top: lerp(gy + p.y * u, gy, k) - dot / 2, width: dot, height: dot,
              borderRadius: '50%', background: i < 50 ? (i % 7 === 3 ? C.sun : C.paper) : C.paper, opacity: k,
            }}
          />
        );
      })}
    </>
  );
};

const Ring: React.FC<{ t: number; at: number; pct: number; size: number }> = ({ t, at, pct, size }) => {
  const p = prog(t, at, 1.2, EASE.out);
  const r = size / 2 - 10;
  const L = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={14} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.sun} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${L * pct * p} ${L}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2 + 8} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={22} fill="rgba(255,255,255,0.8)">
        pratique
      </text>
    </svg>
  );
};

const Days: React.FC<{ t: number; at: number; w: number; u: number }> = ({ t, at, w, u }) => {
  const g = 10 * u;
  const bw = (w - g * 4) / 5;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: g, alignItems: 'flex-end' }}>
      {Array.from({ length: 5 }, (_, i) => {
        const k = prog(t, at + 0.15 + i * 0.12, 0.5, EASE.back);
        return (
          <div key={i} style={{ width: bw, height: lerp(10, 60 + i * 20, k) * u, borderRadius: 12 * u, background: i === 4 ? C.sun : 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 8 * u, fontFamily: FONT, fontWeight: 800, fontSize: 20 * u, color: C.brandDark }}>
            {k > 0.6 ? `J${i + 1}` : ''}
          </div>
        );
      })}
    </div>
  );
};

const Bar: React.FC<{ t: number; at: number; w: number; u: number }> = ({ t, at, w, u }) => {
  const p = prog(t, at + 0.1, 1.2, EASE.out);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40 * u }}>
      <div style={{ height: 34 * u, borderRadius: 99, background: 'rgba(255,255,255,0.16)', overflow: 'hidden' }}>
        <div style={{ width: `${80 * p}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${C.sunLogo}, ${C.sun})` }} />
      </div>
      <div style={{ position: 'absolute', left: `${80 * p}%`, top: -10 * u, width: 4 * u, height: 54 * u, background: C.paper, borderRadius: 4, opacity: p, transform: 'translateX(-50%)' }} />
    </div>
  );
};

export const Scene03Statistics: React.FC<SceneProps> = ({ dur, cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { v, W, u } = useFormat();
  const cardW = v ? 430 * u : 390 * u;
  const inner = cardW - 56 * u;
  const outP = prog(t, cues.out, dur - cues.out, [0.6, 0, 0.4, 1]);
  const camZ = lerp(1.04, 1, prog(t, 0, 2, EASE.out)) * lerp(1, 1.03, prog(t, 2, dur - 2, [0.4, 0, 0.6, 1]));
  const pctStyle = { color: C.sun, fontSize: '0.55em', marginLeft: '0.04em', marginTop: '0.08em' } as const;

  const cells = [
    <Card key="p" t={t} at={cues.participants} u={u} w={cardW} v={v} label="participants sélectionnés" num={<Counter t={t} at={cues.participants} to={50} dur={1.1} />}>
      <Dots t={t} at={cues.participants - 0.1} w={inner} u={u} />
    </Card>,
    <Card key="j" t={t} at={cues.jours} u={u} w={cardW} v={v} label="jours de formation intensive" num={<DigitRoll t={t} at={cues.jours} to={5} size={150 * u} color={C.paper} />}>
      <Days t={t} at={cues.jours} w={inner} u={u} />
    </Card>,
    <Card key="pr" t={t} at={cues.pratique} u={u} w={cardW} v={v} label="de pratique, 30 % de théorie" num={<Counter t={t} at={cues.pratique} to={70} dur={1.2} suffix={<span style={pctStyle}>%</span>} />}>
      <Ring t={t} at={cues.pratique} pct={0.7} size={150 * u} />
    </Card>,
    <Card key="c" t={t} at={cues.prise} u={u} w={cardW} v={v} label="de la formation prise en charge" num={<Counter t={t} at={cues.prise} to={80} dur={1.2} suffix={<span style={pctStyle}>%</span>} />}>
      <Bar t={t} at={cues.prise} w={inner} u={u} />
    </Card>,
  ];

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 80% at 50% 40%, ${C.brand} 0%, ${C.brandDark} 70%, ${C.brandDeep} 100%)`, overflow: 'hidden' }}>
      {/* motif : anneaux du « g » en filigrane */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.08 }}>
        {[1, 2, 3, 4].map((k) => (
          <circle key={k} cx={W * 0.5} cy={v ? 300 * u : -100 * u} r={k * 260 * u + t * 20 * u} fill="none" stroke="#fff" strokeWidth={50 * u} />
        ))}
      </svg>
      <AbsoluteFill style={{ transform: `scale(${camZ})`, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 50 * u }}>
        <div style={{ textAlign: 'center', opacity: prog(t, 0, 0.6), transform: `translateY(${lerp(20, 0, prog(t, 0, 0.8, EASE.out))}px)` }}>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 26 * u, letterSpacing: '0.24em', color: C.sun }}>GRAPHIA EN CHIFFRES</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: (v ? 60 : 56) * u, color: C.paper, letterSpacing: '-0.02em', marginTop: 6 * u, lineHeight: 1.15 }}>Un programme conçu{v ? <br /> : ' '}pour la pratique.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: v ? `repeat(2, ${cardW}px)` : `repeat(4, ${cardW}px)`, gap: 30 * u }}>{cells}</div>
      </AbsoluteFill>
      <Grain frame={frame} opacity={0.05} />
      <PanelWipe p={outP} color={C.paper} n={v ? 3 : 5} />
    </AbsoluteFill>
  );
};
