import React from 'react';

/**
 * Pictogrammes minimalistes (trait fin, 48×48). Couleur via `color`,
 * dessin progressif via `draw` (0→1) grâce à pathLength normalisé.
 */
export type IconName =
  | 'ship'
  | 'plane'
  | 'port'
  | 'customs'
  | 'container'
  | 'truck'
  | 'client'
  | 'folder'
  | 'search'
  | 'check'
  | 'stamp'
  | 'lock'
  | 'shield'
  | 'store'
  | 'building'
  | 'warehouse'
  | 'boxes'
  | 'chart'
  | 'pin';

const PATHS: Record<IconName, string[]> = {
  ship: [
    'M6 30 L42 30 L37 39 L11 39 Z',
    'M12 30 L12 22 L22 22 L22 30',
    'M22 26 L34 26 L34 30',
    'M16 22 L16 16 L20 16 L20 22',
    'M4 43 C8 41 12 45 16 43 C20 41 24 45 28 43 C32 41 36 45 40 43 C42 42 44 42 44 42',
  ],
  plane: [
    'M4 27 L44 21',
    'M20 24 L14 10 L18 10 L28 23',
    'M22 26 L18 38 L22 38 L30 25',
    'M8 26 L5 19 L8 19 L12 25',
  ],
  port: [
    'M10 42 L10 8 L30 8',
    'M10 14 L24 8',
    'M26 8 L26 18',
    'M22 18 L30 18 L30 24 L22 24 Z',
    'M4 42 L44 42',
    'M30 42 L30 32 L42 32 L42 42',
    'M6 42 L6 34 L14 34',
  ],
  customs: [
    'M24 5 L40 11 L40 23 C40 33 33 40 24 43 C15 40 8 33 8 23 L8 11 Z',
    'M17 24 L22 29 L31 19',
  ],
  container: [
    'M5 13 L43 13 L43 37 L5 37 Z',
    'M11 17 L11 33',
    'M17 17 L17 33',
    'M23 17 L23 33',
    'M29 17 L29 33',
    'M35 17 L35 33',
  ],
  truck: [
    'M3 12 L29 12 L29 33 L3 33 Z',
    'M29 19 L38 19 L45 26 L45 33 L29 33',
    'M14 37 A4 4 0 1 1 6 37 A4 4 0 1 1 14 37',
    'M41 37 A4 4 0 1 1 33 37 A4 4 0 1 1 41 37',
  ],
  client: [
    'M24 23 A8 8 0 1 1 24 7 A8 8 0 1 1 24 23',
    'M9 42 C9 33 16 28 24 28 C32 28 39 33 39 42',
  ],
  folder: ['M5 13 L5 39 L43 39 L43 17 L22 17 L18 11 L5 11 Z', 'M5 20 L43 20'],
  search: ['M30 20 A10 10 0 1 1 10 20 A10 10 0 1 1 30 20', 'M27 28 L41 42'],
  check: ['M24 44 A20 20 0 1 1 24 4 A20 20 0 1 1 24 44', 'M15 25 L21 31 L33 18'],
  stamp: [
    'M18 6 L30 6 L28 22 L20 22 Z',
    'M8 26 L40 26 L40 33 L8 33 Z',
    'M8 40 L40 40',
  ],
  lock: [
    'M10 21 L38 21 L38 43 L10 43 Z',
    'M16 21 L16 14 C16 4 32 4 32 14 L32 21',
    'M24 29 L24 35',
  ],
  shield: ['M24 5 L40 11 L40 23 C40 33 33 40 24 43 C15 40 8 33 8 23 L8 11 Z'],
  store: [
    'M6 18 L10 8 L38 8 L42 18',
    'M6 18 C6 23 14 23 14 18 C14 23 22 23 22 18 C22 23 30 23 30 18 C30 23 38 23 38 18 C38 23 42 23 42 18',
    'M9 22 L9 42 L39 42 L39 22',
    'M20 42 L20 31 L28 31 L28 42',
  ],
  building: [
    'M10 43 L10 7 L30 7 L30 43',
    'M30 17 L40 17 L40 43',
    'M5 43 L44 43',
    'M16 13 L16 15 M24 13 L24 15 M16 21 L16 23 M24 21 L24 23 M16 29 L16 31 M24 29 L24 31',
    'M35 23 L35 25 M35 31 L35 33',
  ],
  warehouse: [
    'M4 18 L24 7 L44 18 L44 42 L4 42 Z',
    'M12 42 L12 25 L36 25 L36 42',
    'M12 31 L36 31 M12 37 L36 37',
  ],
  boxes: [
    'M6 26 L22 26 L22 42 L6 42 Z',
    'M26 26 L42 26 L42 42 L26 42 Z',
    'M16 8 L32 8 L32 24 L16 24 Z',
    'M14 26 L14 31 M34 26 L34 31 M24 8 L24 13',
  ],
  chart: ['M6 6 L6 42 L44 42', 'M11 34 L19 26 L26 30 L40 14', 'M33 14 L40 14 L40 21'],
  pin: [
    'M24 44 C24 44 10 29 10 19 A14 14 0 0 1 38 19 C38 29 24 44 24 44 Z',
    'M29 19 A5 5 0 1 1 19 19 A5 5 0 1 1 29 19',
  ],
};

export const Icon: React.FC<{
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  draw?: number;
  style?: React.CSSProperties;
}> = ({ name, size = 48, color = '#fff', strokeWidth = 1.6, draw = 1, style }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    {PATHS[name].map((d, i) => (
      <path
        key={i}
        d={d}
        pathLength={1}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={1}
        strokeDashoffset={1 - Math.max(0, Math.min(1, draw))}
      />
    ))}
  </svg>
);
