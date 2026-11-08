import React from 'react';
import { C } from '../theme';

/** Smartphone générique (aucune marque) : cadre noir, écran arrondi, encoche. */
export const Phone: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => {
  const h = w * 2.08;
  const b = w * 0.035;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.14, background: '#0d0d0d', padding: b, boxShadow: '0 50px 100px -30px rgba(8,8,8,0.55), inset 0 0 0 2px #2a2a2a', position: 'relative', ...style }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: w * 0.11, overflow: 'hidden', background: C.paper }}>
        {children}
        <div style={{ position: 'absolute', top: w * 0.025, left: '50%', width: w * 0.3, height: w * 0.075, borderRadius: 99, background: '#0d0d0d', transform: 'translateX(-50%)', zIndex: 10 }} />
      </div>
    </div>
  );
};
