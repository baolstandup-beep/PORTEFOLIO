import React from 'react';

/** Grain photo très léger (texture fixe, décalée à chaque image) : évite l'aspect « vectoriel plat ». */
export const Grain: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 0.06 }) => {
  const ox = (frame * 37) % 200;
  const oy = (frame * 91) % 200;
  return (
    <div style={{ position: 'absolute', inset: -200, pointerEvents: 'none', opacity, mixBlendMode: 'overlay', transform: `translate(${ox}px, ${oy}px)` }}>
      <svg width="100%" height="100%">
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={3} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </div>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.7 }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)` }} />
);
