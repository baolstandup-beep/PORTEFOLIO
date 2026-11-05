import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

export type FloatItem = { el: (size: number, i: number) => React.ReactNode };

/**
 * Champ d'ingrédients en 3D simulée : chaque élément a une profondeur z qui
 * pilote taille, flou (profondeur de champ), vitesse (parallaxe) et rotation.
 * `layer="back"` ne rend que les éléments derrière la bouteille, `front` ceux devant.
 * mode "burst" : explosion depuis le centre ; "orbit" : orbite elliptique 3D.
 */
export const FloatingField: React.FC<{
  items: FloatItem[];
  count: number;
  seed: string;
  layer: "back" | "front";
  mode: "burst" | "orbit" | "fall";
  delay?: number;
  center?: [number, number];
}> = ({ items, count, seed, layer, mode, delay = 0, center = [540, 1050] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const enter = spring({ frame: f, fps, config: { damping: 18, stiffness: 70 } });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const r = (k: string) => random(`${seed}-${k}-${i}`);
        let x = 0,
          y = 0,
          z = 0;
        if (mode === "orbit") {
          const ang = r("a") * Math.PI * 2 + f / (38 + r("s") * 20);
          const radius = 330 + r("r") * 170;
          x = center[0] + Math.cos(ang) * radius * enter;
          z = Math.sin(ang); // -1 derrière, 1 devant
          y = center[1] + (r("y") - 0.5) * 1100 + Math.sin(ang) * 60 - (1 - enter) * 300;
        } else if (mode === "burst") {
          const ang = r("a") * Math.PI * 2;
          const dist = (420 + r("d") * 520) * enter + f * (1.2 + r("v"));
          z = r("z") * 2 - 1;
          x = center[0] + Math.cos(ang) * dist * 0.85;
          y = center[1] + Math.sin(ang) * dist * 0.9 + f * f * 0.01;
        } else {
          z = r("z") * 2 - 1;
          x = r("x") * 1180 - 50 + Math.sin(f / 20 + i) * 50;
          y = ((r("y") * 2200 + f * (2.5 + (z + 1) * 3)) % 2300) - 200;
        }
        if ((layer === "front") !== z > 0) return null;
        // au premier plan, on écarte les éléments de l'axe central pour ne
        // jamais masquer l'étiquette ni le logo de la bouteille
        if (layer === "front") {
          const dxc = x - center[0];
          if (Math.abs(dxc) < 300) x = center[0] + Math.sign(dxc || 1) * (300 + Math.abs(dxc) * 0.4);
        }
        const depth = (z + 1) / 2; // 0 loin → 1 proche
        const size = 60 + depth * depth * 230 + r("sz") * 40;
        const blur = depth > 0.82 ? (depth - 0.82) * 60 : depth < 0.25 ? (0.25 - depth) * 14 : 0;
        const rot = r("rot") * 360 + f * (r("rs") - 0.5) * 6;
        const rotX = Math.sin(f / 22 + i) * 45;
        const op = interpolate(f, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
          (0.55 + depth * 0.45);
        const item = items[i % items.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%,-50%) rotate(${rot}deg) rotateX(${rotX}deg)`,
              filter: `blur(${blur}px) brightness(${0.7 + depth * 0.4}) drop-shadow(0 12px 18px rgba(0,0,0,0.35))`,
              opacity: op,
            }}
          >
            {item.el(size, i)}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
