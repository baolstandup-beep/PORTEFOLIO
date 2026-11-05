/**
 * Éléments d'ingrédients vectoriels (pas d'images tierces) :
 * rondelle de citron, morceau d'ananas, rondelle de gingembre,
 * calice de bissap blanc séché, pétale d'hibiscus.
 */
type P = { size: number };

export const LemonSlice: React.FC<P> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <radialGradient id="lemonFlesh" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF7B0" />
        <stop offset="70%" stopColor="#FFE14A" />
        <stop offset="100%" stopColor="#F7C600" />
      </radialGradient>
    </defs>
    <circle cx="100" cy="100" r="98" fill="#E9B500" />
    <circle cx="100" cy="100" r="91" fill="#FFF4C9" />
    <circle cx="100" cy="100" r="84" fill="url(#lemonFlesh)" />
    {new Array(10).fill(0).map((_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return (
        <line
          key={i}
          x1={100 + Math.cos(a) * 10}
          y1={100 + Math.sin(a) * 10}
          x2={100 + Math.cos(a) * 84}
          y2={100 + Math.sin(a) * 84}
          stroke="#FFF8D6"
          strokeWidth="5"
          strokeLinecap="round"
        />
      );
    })}
    <circle cx="100" cy="100" r="10" fill="#FFF8D6" />
    <ellipse cx="70" cy="62" rx="30" ry="12" fill="rgba(255,255,255,0.45)" transform="rotate(-35 70 62)" />
  </svg>
);

export const PineappleChunk: React.FC<P> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <linearGradient id="pine" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FFE680" />
        <stop offset="55%" stopColor="#FFC21A" />
        <stop offset="100%" stopColor="#E59400" />
      </linearGradient>
    </defs>
    <path d="M30 40 L170 25 L185 150 L120 185 L20 160 Z" fill="url(#pine)" />
    <path d="M30 40 L170 25 L185 150 L120 185 L20 160 Z" fill="none" stroke="#D88A00" strokeWidth="4" />
    {[60, 95, 130].map((y) => (
      <path key={y} d={`M28 ${y} Q100 ${y - 14} 180 ${y - 8}`} stroke="rgba(255,250,210,0.7)" strokeWidth="4" fill="none" />
    ))}
    <ellipse cx="80" cy="60" rx="34" ry="10" fill="rgba(255,255,255,0.5)" transform="rotate(-8 80 60)" />
  </svg>
);

export const GingerSlice: React.FC<P> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <radialGradient id="gingerFlesh" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF3C4" />
        <stop offset="65%" stopColor="#F6D77C" />
        <stop offset="100%" stopColor="#E3B755" />
      </radialGradient>
    </defs>
    <path
      d="M100 6 C150 4 196 40 194 98 C196 150 150 196 98 192 C45 196 6 152 8 100 C4 48 50 8 100 6 Z"
      fill="#B8844A"
    />
    <path
      d="M100 16 C145 15 184 45 182 98 C184 145 145 182 98 180 C52 183 18 145 20 100 C17 54 55 18 100 16 Z"
      fill="url(#gingerFlesh)"
    />
    <circle cx="100" cy="100" r="52" fill="none" stroke="rgba(215,160,70,0.55)" strokeWidth="3" />
    {new Array(14).fill(0).map((_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return (
        <circle key={i} cx={100 + Math.cos(a) * 70} cy={100 + Math.sin(a) * 70} r="2.4" fill="rgba(200,140,60,0.55)" />
      );
    })}
    <ellipse cx="72" cy="64" rx="28" ry="10" fill="rgba(255,255,255,0.4)" transform="rotate(-35 72 64)" />
  </svg>
);

/** Calice séché de bissap blanc (teinte crème/blond). */
export const BissapBlancFlake: React.FC<P> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <linearGradient id="bb" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F3E2C0" />
        <stop offset="60%" stopColor="#D9B887" />
        <stop offset="100%" stopColor="#B58A55" />
      </linearGradient>
    </defs>
    {[0, 72, 144, 216, 288].map((r) => (
      <path
        key={r}
        d="M100 100 C80 70 82 30 100 12 C118 30 120 70 100 100 Z"
        fill="url(#bb)"
        stroke="rgba(150,105,55,0.6)"
        strokeWidth="2"
        transform={`rotate(${r} 100 100)`}
      />
    ))}
    <circle cx="100" cy="100" r="12" fill="#C79A60" />
  </svg>
);

/** Pétale d'hibiscus (bissap rouge). */
export const HibiscusPetal: React.FC<P & { shade?: number }> = ({ size, shade = 0 }) => {
  const id = `hib${shade}`;
  const cols = [
    ["#FF4D6D", "#C4103A", "#6A0525"],
    ["#E8336A", "#9E0F45", "#4A0430"],
    ["#FF6F8E", "#D0204F", "#7A0A30"],
  ][shade % 3];
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 200 240">
      <defs>
        <radialGradient id={id} cx="50%" cy="85%" r="90%">
          <stop offset="0%" stopColor={cols[2]} />
          <stop offset="45%" stopColor={cols[1]} />
          <stop offset="100%" stopColor={cols[0]} />
        </radialGradient>
      </defs>
      <path
        d="M100 232 C40 200 6 130 20 70 C34 18 80 4 100 30 C120 4 166 18 180 70 C194 130 160 200 100 232 Z"
        fill={`url(#${id})`}
      />
      {[-40, -20, 0, 20, 40].map((dx) => (
        <path
          key={dx}
          d={`M100 228 Q${100 + dx * 0.6} 140 ${100 + dx * 1.8} 50`}
          stroke="rgba(255,190,210,0.25)"
          strokeWidth="2.5"
          fill="none"
        />
      ))}
      <ellipse cx="70" cy="80" rx="30" ry="12" fill="rgba(255,255,255,0.25)" transform="rotate(-50 70 80)" />
    </svg>
  );
};
