import React from "react";
import { Img, staticFile } from "remotion";
import { FLYER_H, FLYER_W, Rect } from "../regions";

export const FLYER_SRC = staticFile("flyer.jpg");

type Props = {
  /** Zone du flyer (coordonnées flyer) affichée par ce calque. */
  rect: Rect;
  /** Image source alternative couvrant exactement `rect` (ex. clean plate). */
  plateSrc?: string;
  /** Transformations appliquées au calque entier (origine = centre de la zone). */
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  /** Décalage du contenu À L'INTÉRIEUR de la zone (révélations « glissées »). */
  innerX?: number;
  innerY?: number;
  /** Polygone en coordonnées flyer (converti en clip-path local). */
  poly?: [number, number][];
  /** Trou optionnel dans le polygone (règle evenodd). */
  hole?: [number, number][];
  clipPath?: string;
  mask?: string;
  maskComposite?: "add" | "intersect" | "subtract" | "exclude";
  borderRadius?: number;
  filter?: string;
  transformOrigin?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * Calque = découpe exacte du flyer original. Les pixels ne sont jamais
 * régénérés : seule leur position / opacité / échelle est animée.
 */
export const FlyerCrop: React.FC<Props> = ({
  rect,
  plateSrc,
  x = 0,
  y = 0,
  scale = 1,
  rotate = 0,
  opacity = 1,
  innerX = 0,
  innerY = 0,
  poly,
  hole,
  clipPath,
  mask,
  maskComposite,
  borderRadius,
  filter,
  transformOrigin = "50% 50%",
  children,
  style,
}) => {
  const pts = (list: [number, number][]) => list.map(([px, py]) => `${px - rect.x}px ${py - rect.y}px`);
  const polyClip = poly
    ? hole
      ? `polygon(evenodd, ${[...pts(poly), pts(poly)[0], ...pts(hole), pts(hole)[0], pts(poly)[0]].join(", ")})`
      : `polygon(${pts(poly).join(", ")})`
    : undefined;

  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        overflow: "hidden",
        opacity,
        transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin,
        clipPath: clipPath ?? polyClip,
        WebkitMaskImage: mask,
        maskImage: mask,
        maskComposite,
        WebkitMaskComposite: maskComposite === "intersect" ? "source-in" : undefined,
        borderRadius,
        filter,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {/* Le contenu glissé (innerX/innerY) est lui-même une découpe fermée :
          il ne dévoile jamais les pixels voisins du flyer. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: rect.w,
          height: rect.h,
          overflow: "hidden",
          transform: `translate(${innerX}px, ${innerY}px)`,
        }}
      >
        <Img
          src={plateSrc ?? FLYER_SRC}
          style={
            plateSrc
              ? { position: "absolute", left: 0, top: 0, width: rect.w, height: rect.h }
              : {
                  position: "absolute",
                  left: -rect.x,
                  top: -rect.y,
                  width: FLYER_W,
                  height: FLYER_H,
                  maxWidth: "none",
                }
          }
        />
      </div>
      {children}
    </div>
  );
};

/** Masque à bords adoucis (fondu de `f` px sur les 4 côtés). */
export const featherMask = (f: number) =>
  `linear-gradient(to right, transparent, #000 ${f}px, #000 calc(100% - ${f}px), transparent), ` +
  `linear-gradient(to bottom, transparent, #000 ${f}px, #000 calc(100% - ${f}px), transparent)`;

/** Fondu indépendant par côté (gauche, haut, droite, bas) en px. */
export const featherSides = (l: number, t: number, r: number, b: number) =>
  `linear-gradient(to right, transparent, #000 ${l}px, #000 calc(100% - ${r}px), transparent), ` +
  `linear-gradient(to bottom, transparent, #000 ${t}px, #000 calc(100% - ${b}px), transparent)`;

/** Masque circulaire (cx, cy, r en px locaux). */
export const circleMask = (cx: number, cy: number, r: number, soft = 3) =>
  `radial-gradient(circle at ${cx}px ${cy}px, #000 ${r - soft}px, transparent ${r}px)`;
