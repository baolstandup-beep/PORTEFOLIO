import { Img, interpolate, random, useCurrentFrame } from "remotion";

/**
 * Bouteille détourée (photo originale, non modifiée) + habillage studio :
 * ombre/halo coloré, reflet spéculaire qui balaye la bouteille (masqué à sa
 * silhouette), gouttes de condensation, reflet au sol.
 */
export const Bottle: React.FC<{
  src: string;
  ratio: number;
  height: number;
  glow?: string;
  /** progression 0→1 du balayage de lumière (undefined = pas de balayage) */
  sheen?: number;
  condensation?: boolean;
  reflection?: boolean;
  reflectionOpacity?: number;
  seed?: string;
  style?: React.CSSProperties;
}> = ({
  src,
  ratio,
  height,
  glow = "rgba(255,255,255,0.4)",
  sheen,
  condensation = true,
  reflection = false,
  reflectionOpacity = 0.28,
  seed = "b",
  style,
}) => {
  const frame = useCurrentFrame();
  const width = height * ratio;
  const mask: React.CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
  const sheenX = sheen === undefined ? -2 : interpolate(sheen, [0, 1], [-1.2, 1.6]);
  return (
    <div style={{ position: "relative", width, height, ...style }}>
      {/* halo coloré derrière la bouteille */}
      <div
        style={{
          position: "absolute",
          inset: `-${height * 0.08}px -${width * 0.6}px`,
          background: `radial-gradient(ellipse 50% 50% at 50% 55%, ${glow} 0%, transparent 70%)`,
          filter: "blur(30px)",
        }}
      />
      <Img
        src={src}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          filter: `drop-shadow(0 30px 40px rgba(0,0,0,0.55)) contrast(1.06) saturate(1.08)`,
        }}
      />
      {/* contour lumineux (rim light) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...mask,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 9%, rgba(255,255,255,0) 88%, rgba(255,255,255,0.28) 100%)",
          mixBlendMode: "screen",
        }}
      />
      {/* balayage spéculaire */}
      {sheen !== undefined ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...mask,
            background: `linear-gradient(105deg, transparent ${(sheenX - 0.18) * 100}%, rgba(255,255,255,0.65) ${sheenX * 100}%, transparent ${(sheenX + 0.18) * 100}%)`,
            mixBlendMode: "screen",
          }}
        />
      ) : null}
      {/* condensation */}
      {condensation ? (
        <div style={{ position: "absolute", inset: 0, ...mask }}>
          {new Array(46).fill(0).map((_, i) => {
            const rx = random(`${seed}-cx-${i}`);
            const ry = 0.22 + random(`${seed}-cy-${i}`) * 0.75;
            const s = 4 + random(`${seed}-cs-${i}`) * 13;
            const slide = random(`${seed}-sl-${i}`) > 0.85 ? (frame * 0.6 * s) / 10 : 0;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${rx * 100}%`,
                  top: ry * height + slide,
                  width: s,
                  height: s * 1.15,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.25) 35%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.5) 100%)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                }}
              />
            );
          })}
        </div>
      ) : null}
      {/* reflet au sol */}
      {reflection ? (
        <Img
          src={src}
          style={{
            position: "absolute",
            left: 0,
            top: height,
            width: "100%",
            height: "100%",
            transform: "scaleY(-1)",
            opacity: reflectionOpacity,
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 22%)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 22%)",
            filter: "blur(2px)",
          }}
        />
      ) : null}
    </div>
  );
};
