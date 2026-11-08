import React from 'react';
import { C, EASE } from '../theme';
import { prog } from '../utils/anim';

/**
 * Rideau en lames (même courbe que la révélation `mask` du site) : n lames montent
 * en décalé et couvrent l'écran (p 0→1). `dir="out"` les fait sortir par le haut pour découvrir.
 */
export const PanelWipe: React.FC<{ p: number; color?: string; n?: number; dir?: 'in' | 'out'; vertical?: boolean }> = ({
  p, color = C.brand, n = 4, dir = 'in', vertical = true,
}) => {
  if (p <= 0 || (dir === 'out' && p >= 1)) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: vertical ? 'row' : 'column', pointerEvents: 'none' }}>
      {Array.from({ length: n }, (_, i) => {
        const k = prog(p, i * 0.08, 1 - (n - 1) * 0.08, EASE.mask);
        const s = dir === 'in' ? k : 1 - k;
        const origin = dir === 'in' ? (vertical ? 'bottom' : 'left') : vertical ? 'top' : 'right';
        return (
          <div
            key={i}
            style={{
              flex: 1, background: color === C.brand ? `linear-gradient(180deg, ${color}, ${C.brandDark})` : color, transformOrigin: origin,
              transform: vertical ? `scaleY(${s})` : `scaleX(${s})`, marginLeft: vertical && i ? -1 : 0, marginTop: !vertical && i ? -1 : 0,
            }}
          />
        );
      })}
    </div>
  );
};
