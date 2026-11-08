import React from 'react';

/** Flash lumineux bref (2–4 images) sur un impact. */
export const Flash: React.FC<{ t: number; at: number; dur?: number; color?: string; max?: number }> = ({ t, at, dur = 0.18, color = '#fff', max = 0.85 }) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  return <div style={{ position: 'absolute', inset: 0, background: color, opacity: max * (1 - k) ** 2, pointerEvents: 'none' }} />;
};
