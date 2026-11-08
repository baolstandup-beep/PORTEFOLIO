import React from 'react';
import { C } from '../../theme';

/**
 * « Visuels générés » : compositions graphiques originales (motifs géométriques inspirés des textiles
 * d'Afrique de l'Ouest, anneau du « g », soleil) — ce ne sont PAS des images d'IA réelles, et rien
 * n'est attribué à un logiciel existant.
 */
export const Tile: React.FC<{ i: number; s: number; t: number; enhanced?: number }> = ({ i, s, t, enhanced = 0 }) => {
  const sat = 0.75 + enhanced * 0.4;
  const common: React.CSSProperties = { position: 'absolute', inset: 0, filter: `saturate(${sat}) contrast(${1 + enhanced * 0.12})` };
  if (i === 0)
    return (
      <div style={{ ...common, background: `radial-gradient(circle at 50% 38%, ${C.sunLogo} 0%, ${C.sun} 14%, ${C.brand} 15%, ${C.brandDark} 60%, ${C.brandDeep} 100%)` }}>
        {Array.from({ length: 16 }, (_, k) => (
          <div key={k} style={{ position: 'absolute', left: '50%', top: '38%', width: s * 0.012, height: s * 0.42, background: 'rgba(245,229,0,0.35)', transformOrigin: '50% 0', transform: `rotate(${k * 22.5 + t * 6}deg)` }} />
        ))}
        <div style={{ position: 'absolute', left: '10%', right: '10%', bottom: '10%', height: s * 0.06, background: C.paper, borderRadius: 4 }} />
        <div style={{ position: 'absolute', left: '10%', width: '45%', bottom: '19%', height: s * 0.035, background: 'rgba(255,255,255,0.7)', borderRadius: 4 }} />
      </div>
    );
  if (i === 1)
    return (
      <div style={{ ...common, background: C.ink }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {Array.from({ length: 6 }, (_, r) =>
            Array.from({ length: 6 }, (_, c) => {
              const x = c * 17 + 2;
              const y = r * 17 + 2;
              const col = (r + c) % 3 === 0 ? C.sunLogo : (r + c) % 3 === 1 ? C.brand : C.paper;
              return <polygon key={`${r}-${c}`} points={`${x + 7.5},${y} ${x + 15},${y + 7.5} ${x + 7.5},${y + 15} ${x},${y + 7.5}`} fill={col} opacity={0.9} />;
            }),
          )}
        </svg>
      </div>
    );
  if (i === 2)
    return (
      <div style={{ ...common, background: C.paper }}>
        {Array.from({ length: 4 }, (_, k) => (
          <div key={k} style={{ position: 'absolute', left: '50%', top: '50%', width: s * (0.8 - k * 0.18), height: s * (0.8 - k * 0.18), borderRadius: '50%', border: `${s * 0.05}px solid ${k % 2 ? C.sunLogo : C.brand}`, transform: `translate(-50%,-50%) rotate(${t * 20 * (k % 2 ? 1 : -1)}deg)`, borderTopColor: 'transparent' }} />
        ))}
      </div>
    );
  return (
    <div style={{ ...common, background: `linear-gradient(180deg, ${C.sunLogo} 0 33%, ${C.brand} 33% 66%, ${C.ink} 66%)` }}>
      {Array.from({ length: 5 }, (_, k) => (
        <div key={k} style={{ position: 'absolute', left: `${10 + k * 18}%`, top: '20%', width: '8%', height: '60%', background: k % 2 ? C.paper : C.brandDeep, transform: `skewX(-18deg)`, opacity: 0.85 }} />
      ))}
    </div>
  );
};
