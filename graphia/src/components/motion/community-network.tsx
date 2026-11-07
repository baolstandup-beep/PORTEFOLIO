/**
 * Réseau animé : les profils du public cible (contenu réel du site) reliés au cœur GRAPHIA.
 * Les lignes se tracent puis les nœuds apparaissent quand la section entre à l'écran (data-observe).
 */
const R = 150;
const CX = 200;
const CY = 200;

export function CommunityNetwork({ labels }: { labels: string[] }) {
  const pts = labels.map((label, i) => {
    const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
    return { label, x: CX + Math.cos(a) * R, y: CY + Math.sin(a) * R };
  });
  return (
    <svg data-observe="" viewBox="0 0 400 400" className="h-auto w-full max-w-md" role="img" aria-label="Les profils du public GRAPHIA reliés au programme">
      <defs>
        <radialGradient id="net-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5E500" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F5E500" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r="120" fill="url(#net-core)" />
      {/* liens entre voisins */}
      {pts.map((p, i) => {
        const q = pts[(i + 1) % pts.length];
        const len = Math.hypot(q.x - p.x, q.y - p.y);
        return <line key={`r${i}`} className="net-line" x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke="rgb(255 255 255 / 0.18)" strokeWidth="1" style={{ ['--len' as string]: len, ['--i' as string]: i + labels.length }} />;
      })}
      {/* liens vers le centre */}
      {pts.map((p, i) => (
        <line key={`c${i}`} className="net-line" x1={CX} y1={CY} x2={p.x} y2={p.y} stroke="#078D43" strokeWidth="2" style={{ ['--len' as string]: R, ['--i' as string]: i }} />
      ))}
      {pts.map((p, i) => (
        <g key={`n${i}`} className="net-node" style={{ ['--i' as string]: i }}>
          <circle cx={p.x} cy={p.y} r="16" fill="#080808" stroke="#F5E500" strokeWidth="2" />
          <circle className="net-pulse" cx={p.x} cy={p.y} r="16" fill="none" stroke="#F5E500" strokeWidth="1.5" style={{ animationDelay: `${i * 0.35}s` }} />
          <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#F5E500">{i + 1}</text>
        </g>
      ))}
      <g className="net-node" style={{ ['--i' as string]: 0 }}>
        <circle cx={CX} cy={CY} r="44" fill="#078D43" />
        <text x={CX} y={CY + 6} textAnchor="middle" fontSize="18" fontWeight="900" fill="#fff">GRAPHIA</text>
      </g>
    </svg>
  );
}
