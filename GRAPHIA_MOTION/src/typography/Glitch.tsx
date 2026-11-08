import React from 'react';
import { C } from '../theme';
import { mulberry32 } from '../utils/anim';

/**
 * Glitch subtil : deux copies colorées aux teintes de la marque (vert / jaune) décalées + tranches déplacées.
 * Actif seulement quand `amount` > 0 (quelques images autour d'une transition), jamais en continu.
 * `render(color)` doit dessiner le contenu ; color = undefined → couleurs d'origine.
 */
export const Glitch: React.FC<{ amount: number; frame: number; render: (color?: string) => React.ReactNode }> = ({ amount, frame, render }) => {
  if (amount <= 0.001) return <>{render()}</>;
  const r = mulberry32(frame * 7919 + 13);
  const dx = (r() - 0.5) * 30 * amount + 6 * amount;
  const slices = Array.from({ length: 3 }, () => ({ y: r() * 90, h: 3 + r() * 9, x: (r() - 0.5) * 70 * amount }));
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${dx}px)`, opacity: 0.85 * amount }}>{render(C.brand)}</div>
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-dx}px)`, opacity: 0.85 * amount }}>{render(C.sun)}</div>
      <div style={{ position: 'relative' }}>{render()}</div>
      {slices.map((s, i) => (
        <div key={i} style={{ position: 'absolute', inset: 0, clipPath: `inset(${s.y}% 0 ${Math.max(0, 100 - s.y - s.h)}% 0)`, transform: `translateX(${s.x}px)` }}>
          {render()}
        </div>
      ))}
    </div>
  );
};
