import React from 'react';
import { Img, staticFile } from 'remotion';
import { MEDIAS } from '../config';

/**
 * Avion (image remplaçable) + traînée de condensation.
 * Positionné par son centre ; `rotate` en degrés (0 = vers la droite).
 */
export const Plane: React.FC<{
  x: number;
  y: number;
  width?: number;
  rotate?: number;
  trail?: number; // longueur de la traînée en px (0 = aucune)
  opacity?: number;
  shadow?: boolean;
}> = ({ x, y, width = 760, rotate = 0, trail = 0, opacity = 1, shadow = true }) => {
  const h = width * 0.35;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - h / 2,
        width,
        height: h,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'center',
        opacity,
      }}
    >
      {trail > 0 && (
        <>
          {[0.36, 0.48].map((t, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                right: width * 0.86,
                top: h * t,
                width: trail,
                height: width * 0.018,
                borderRadius: 99,
                background:
                  'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.9) 100%)',
                filter: 'blur(3px)',
              }}
            />
          ))}
        </>
      )}
      <Img
        src={staticFile(MEDIAS.avion)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: shadow ? 'drop-shadow(0 30px 30px rgba(10, 42, 94, 0.35))' : undefined,
        }}
      />
    </div>
  );
};
