import React from 'react';

/** Pictogrammes originaux (traits) — aucune icône de logiciel tiers. */
const P: Record<string, React.ReactNode> = {
  idea: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.2h5c0-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" /></>,
  learn: <><circle cx="8" cy="8" r="2.6" /><circle cx="16" cy="8" r="2.6" /><path d="M3.5 18c0-2.8 2-4.6 4.5-4.6s4.5 1.8 4.5 4.6M11.5 18c0-2.8 2-4.6 4.5-4.6s4.5 1.8 4.5 4.6" /></>,
  create: <><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M14 6l3 3" /></>,
  portfolio: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></>,
  rocket: <><path d="M5 19l3-1 8-8a6 6 0 0 0 3-6 6 6 0 0 0-6 3l-8 8z" /><path d="M8 13l3 3M14 8h.01" /></>,
  sparkle: <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
  move: <><path d="M12 3v18M3 12h18M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5M3 12l2.5-2.5M3 12l2.5 2.5M21 12l-2.5-2.5M21 12l-2.5 2.5" /></>,
  pen: <><path d="M12 3l5 6-5 12-5-12z" /><circle cx="12" cy="11" r="1.6" /></>,
  brush: <><path d="M18 3l3 3-9 9-3-3z" /><path d="M9 12c-3 0-5 2-5 5 0 1.5-1 2.5-2 3 3 1 7 0 8-3z" /></>,
  type: <><path d="M5 5h14M12 5v14M9 19h6" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>,
  wand: <><path d="M4 20L16 8M14 4v3M18 6h3M17 3l1.5 1.5M20 9l-1.5-1.5" /></>,
  palette: <><circle cx="12" cy="12" r="9" /><circle cx="8" cy="9" r="1.3" /><circle cx="12" cy="7" r="1.3" /><circle cx="16" cy="9" r="1.3" /><path d="M14 21c-1.5-1.5-1-4 1-4h3a3 3 0 0 0 3-3" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0z" /><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6" /></>,
  phone: <><rect x="7" y="2.5" width="10" height="19" rx="2.2" /><path d="M11 18.5h2" /></>,
  pin: <><path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  check: <><path d="M5 12.5l4.5 4.5L19 7" /></>,
};

export const Icon: React.FC<{ name: keyof typeof P | string; size: number; color: string; stroke?: number; style?: React.CSSProperties }> = ({ name, size, color, stroke = 1.8, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {P[name]}
  </svg>
);
