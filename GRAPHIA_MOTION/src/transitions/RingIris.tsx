import React from 'react';
import { C } from '../theme';
import { EASE } from '../theme';
import { prog } from '../utils/anim';
import { useFormat } from '../utils/layout';

/**
 * Transition signature : l'anneau du « g » du logo s'ouvre depuis le centre et remplit l'écran de vert.
 * p : 0 → 1.
 */
export const RingIris: React.FC<{ p: number; color?: string; cx?: number; cy?: number }> = ({ p, color = C.brand, cx, cy }) => {
  const { W, H } = useFormat();
  if (p <= 0) return null;
  const R = Math.hypot(W, H) * 0.62;
  const outer = R * prog(p, 0, 0.75, EASE.mask);
  const inner = Math.max(0, R * prog(p, 0.25, 0.75, EASE.mask) - 2);
  const x = cx ?? W / 2;
  const y = cy ?? H / 2;
  const ring = outer - inner;
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute', left: x - outer, top: y - outer, width: outer * 2, height: outer * 2, borderRadius: '50%',
          boxSizing: 'border-box', border: `${ring}px solid ${color}`, background: p > 0.98 ? color : 'transparent',
        }}
      />
      {inner > 0 && <div style={{ position: 'absolute', left: x - inner, top: y - inner, width: inner * 2, height: inner * 2, borderRadius: '50%', background: color }} />}
    </div>
  );
};
