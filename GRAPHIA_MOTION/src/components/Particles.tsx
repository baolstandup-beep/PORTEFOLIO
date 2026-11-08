import React, { useMemo } from 'react';
import { C } from '../theme';
import { mulberry32 } from '../utils/anim';
import { useFormat } from '../utils/layout';

/**
 * Particules lumineuses sur trois plans de profondeur (bokeh) : les proches sont plus grandes,
 * plus floues et plus rapides → parallaxe. Déterministe (graine).
 */
export const Particles: React.FC<{ t: number; count?: number; seed?: number; opacity?: number; colors?: string[]; rise?: number; push?: number }> = ({
  t, count = 70, seed = 3, opacity = 1, colors = [C.brand, C.sun, '#ffffff'], rise = 1, push = 0,
}) => {
  const { W, H } = useFormat();
  const ps = useMemo(() => {
    const r = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => {
      const z = r();
      return {
        x: r() * W, y: r() * H, z, size: 2 + z * z * 16, speed: 12 + z * 60,
        color: colors[i % colors.length], phase: r() * 10, tw: 0.4 + r() * 1.2,
      };
    });
  }, [W, H, count, seed, colors]);
  const cx = W / 2;
  const cy = H / 2;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity, pointerEvents: 'none' }}>
      {ps.map((p, i) => {
        let y = (p.y - t * p.speed * rise) % (H + 60);
        if (y < -30) y += H + 60;
        // poussée radiale (effet de traversée vers la caméra)
        const k = 1 + push * (0.3 + p.z);
        const x = cx + (p.x + Math.sin(t * 0.5 + p.phase) * 18 * p.z - cx) * k;
        const yy = cy + (y - cy) * k;
        const a = (0.35 + 0.65 * Math.abs(Math.sin(t * p.tw + p.phase))) * (0.35 + p.z * 0.65);
        const blur = p.z > 0.75 ? (p.z - 0.75) * 24 : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x, top: yy, width: p.size, height: p.size, borderRadius: '50%',
              background: p.color, opacity: a, filter: blur ? `blur(${blur}px)` : undefined,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`, transform: 'translate(-50%,-50%)',
            }}
          />
        );
      })}
    </div>
  );
};
