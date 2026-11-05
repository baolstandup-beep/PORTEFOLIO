import {C} from '../theme';

export const PinIcon: React.FC<{size?: number; color?: string}> = ({size = 90, color = C.gold}) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 50 60">
    <path
      d="M25 3C14 3 6 11.5 6 22c0 14 19 34 19 34s19-20 19-34C44 11.5 36 3 25 3z"
      fill="none"
      stroke={color}
      strokeWidth={4}
    />
    <circle cx={25} cy={22} r={7} fill={color} />
  </svg>
);

export const PhoneIcon: React.FC<{size?: number; color?: string}> = ({size = 60, color = C.gold}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"
    />
  </svg>
);

/** Pictogramme enfant : fille (robe) ou garçon. */
export const ChildIcon: React.FC<{girl: boolean; size?: number; color: string}> = ({girl, size = 44, color}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 40 50">
    <circle cx={20} cy={9} r={7.5} fill={color} />
    {girl ? (
      <path d="M20 18 L33 40 H7 Z" fill={color} />
    ) : (
      <rect x={10} y={18} width={20} height={22} rx={6} fill={color} />
    )}
    <rect x={13} y={40} width={5} height={9} rx={2} fill={color} />
    <rect x={22} y={40} width={5} height={9} rx={2} fill={color} />
  </svg>
);
