import React from 'react';
import { C, EASE, FONT } from '../../theme';
import { prog, lerp } from '../../utils/anim';
import { Icon } from '../../components/Icons';

/** Mini-compositions animées illustrant chaque journée (originales, aucune interface de logiciel réel). */
type MP = { t: number; at: number; s: number }; // s = taille du carré

export const MiniBrand: React.FC<MP> = ({ t, at, s }) => {
  const sw = [C.brand, C.sunLogo, C.ink, C.brand50];
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.mist }}>
      <div style={{ position: 'absolute', left: s * 0.1, top: s * 0.1, fontFamily: FONT, fontWeight: 900, fontSize: s * 0.3, color: C.ink, lineHeight: 1, opacity: prog(t, at + 0.1, 0.4), transform: `translateY(${lerp(20, 0, prog(t, at + 0.1, 0.6, EASE.out))}px)` }}>
        Aa
      </div>
      <svg style={{ position: 'absolute', right: s * 0.08, top: s * 0.08 }} width={s * 0.34} height={s * 0.34} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke={C.brand} strokeWidth="16" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog(t, at + 0.2, 0.9, EASE.inOut)} />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(8,8,8,0.2)" strokeWidth="1" />
        <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(8,8,8,0.2)" strokeWidth="1" />
      </svg>
      <div style={{ position: 'absolute', left: s * 0.1, right: s * 0.1, bottom: s * 0.1, display: 'flex', gap: s * 0.04 }}>
        {sw.map((c, i) => (
          <div key={i} style={{ flex: 1, height: s * 0.26, borderRadius: s * 0.04, background: c, border: c === C.brand50 ? `1px solid ${C.line}` : 'none', transform: `scaleY(${prog(t, at + 0.3 + i * 0.08, 0.5, EASE.back)})`, transformOrigin: 'bottom' }} />
        ))}
      </div>
    </div>
  );
};

export const MiniProduction: React.FC<MP> = ({ t, at, s }) => {
  const p = prog(t, at + 0.15, 0.7, EASE.out);
  const sel = prog(t, at + 0.55, 0.4, EASE.out);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#1b1b1b' }}>
      <div style={{ position: 'absolute', left: s * 0.18, top: s * 0.1, width: s * 0.5, height: s * 0.8, background: C.brand, borderRadius: s * 0.02, transform: `translateY(${lerp(30, 0, p)}px) rotate(${lerp(-6, 0, p)}deg)`, opacity: p, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '15%', top: '12%', width: '70%', aspectRatio: '1', borderRadius: '50%', border: `${s * 0.05}px solid ${C.sunLogo}` }} />
        <div style={{ position: 'absolute', left: '12%', bottom: '22%', width: '76%', height: s * 0.05, background: C.paper, borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: '12%', bottom: '12%', width: '50%', height: s * 0.035, background: 'rgba(255,255,255,0.6)', borderRadius: 3 }} />
      </div>
      <div style={{ position: 'absolute', left: s * 0.16, top: s * 0.08, width: s * 0.54, height: s * 0.84, border: `2px solid ${C.sun}`, opacity: sel, clipPath: `inset(0 ${(1 - sel) * 100}% 0 0)` }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: 'absolute', right: s * 0.06, top: s * (0.14 + i * 0.13), width: s * 0.2, height: s * 0.09, borderRadius: 4, background: i === 0 ? C.brand : 'rgba(255,255,255,0.14)', opacity: prog(t, at + 0.3 + i * 0.1, 0.4) }} />
      ))}
    </div>
  );
};

export const MiniAI: React.FC<MP> = ({ t, at, s }) => {
  const prompt = 'affiche afro-futuriste…';
  const n = Math.floor(prompt.length * prog(t, at + 0.1, 0.7, [0.3, 0, 0.7, 1]));
  const tiles = [C.brand, C.sunLogo, C.brandDark, '#2a2a2a'];
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.ink }}>
      <div style={{ position: 'absolute', left: s * 0.07, right: s * 0.07, top: s * 0.08, height: s * 0.17, borderRadius: 99, border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: s * 0.03, padding: `0 ${s * 0.05}px`, fontFamily: FONT, fontSize: s * 0.065, color: C.paper, whiteSpace: 'nowrap', overflow: 'hidden' }}>
        <Icon name="sparkle" size={s * 0.09} color={C.sun} stroke={2} />
        {prompt.slice(0, n)}
      </div>
      <div style={{ position: 'absolute', left: s * 0.07, right: s * 0.07, top: s * 0.32, bottom: s * 0.07, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: s * 0.04 }}>
        {tiles.map((c, i) => {
          const k = prog(t, at + 0.75 + i * 0.09, 0.5, EASE.out);
          return (
            <div key={i} style={{ borderRadius: s * 0.04, background: `linear-gradient(${135 + i * 40}deg, ${c}, ${tiles[(i + 1) % 4]})`, filter: `blur(${lerp(10, 0, k)}px)`, opacity: k, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: '25%', top: '20%', width: '50%', aspectRatio: '1', borderRadius: i % 2 ? '50%' : 8, background: 'rgba(255,255,255,0.35)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const MiniDigital: React.FC<MP> = ({ t, at, s }) => {
  const p = prog(t, at + 0.1, 0.6, EASE.out);
  const likes = Math.round(lerp(0, 248, prog(t, at + 0.4, 1.0, EASE.out)));
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.brand50 }}>
      <div style={{ position: 'absolute', left: s * 0.12, top: s * 0.08, width: s * 0.42, height: s * 0.84, borderRadius: s * 0.06, background: C.ink, padding: s * 0.025, transform: `translateY(${lerp(40, 0, p)}px)`, opacity: p }}>
        <div style={{ width: '100%', height: '62%', borderRadius: s * 0.035, background: `linear-gradient(160deg, ${C.brand}, ${C.brandDark})`, position: 'relative' }}>
          <div style={{ position: 'absolute', left: '20%', top: '22%', width: '60%', height: '18%', background: C.sunLogo, borderRadius: 4 }} />
        </div>
        <div style={{ marginTop: s * 0.04, fontFamily: FONT, fontWeight: 700, fontSize: s * 0.06, color: C.paper }}>♥ {likes}</div>
      </div>
      <div style={{ position: 'absolute', right: s * 0.06, top: s * 0.2, background: C.paper, borderRadius: s * 0.04, padding: s * 0.04, boxShadow: '0 10px 20px -10px rgba(0,0,0,0.3)', opacity: prog(t, at + 0.5, 0.4), transform: `scale(${prog(t, at + 0.5, 0.5, EASE.back)})` }}>
        <Icon name="rocket" size={s * 0.16} color={C.brand} stroke={2} />
      </div>
      <div style={{ position: 'absolute', right: s * 0.06, bottom: s * 0.16, background: C.ink, color: C.sun, borderRadius: 99, padding: `${s * 0.025}px ${s * 0.05}px`, fontFamily: FONT, fontWeight: 700, fontSize: s * 0.06, opacity: prog(t, at + 0.7, 0.4) }}>
        Client ✓
      </div>
    </div>
  );
};

export const MiniChallenge: React.FC<MP> = ({ t, at, s }) => {
  const p = prog(t, at + 0.1, 0.7, EASE.back);
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 45%, ${C.brand} 0%, ${C.brandDark} 70%)` }}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const k = prog(t, at + 0.3, 0.8, EASE.out);
        return <div key={i} style={{ position: 'absolute', left: '50%', top: '45%', width: s * 0.02, height: s * 0.09 * k, background: C.sun, opacity: 0.7 * (1 - prog(t, at + 1.1, 0.6)), transformOrigin: '50% 0', transform: `rotate(${(a * 180) / Math.PI}deg) translateY(${s * 0.2}px)` }} />;
      })}
      <div style={{ position: 'absolute', left: '50%', top: '45%', width: s * 0.36, height: s * 0.36, borderRadius: '50%', background: C.sunLogo, transform: `translate(-50%,-50%) scale(${p})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="trophy" size={s * 0.22} color={C.ink} stroke={2} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: s * 0.08, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: s * 0.075, letterSpacing: '0.15em', color: C.paper, opacity: prog(t, at + 0.6, 0.4) }}>
        JURY · ATTESTATION
      </div>
    </div>
  );
};
