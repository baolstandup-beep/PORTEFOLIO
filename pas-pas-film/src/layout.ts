// Mise en place du plateau, en pixels du repère 1920 × 1080 (avant mouvement de caméra).
import {config} from './config';

export const STAGE = {width: 1920, height: 1080, cx: 960, cy: 540};

const bottleHeight = 600;
export const BOTTLE = {
  height: bottleHeight,
  width: (bottleHeight * config.assets.bottleWidth) / config.assets.bottleHeight,
  cx: STAGE.cx,
  baseY: 846, // le culot repose sur le socle
};

export const PODIUM = {
  cx: STAGE.cx,
  topY: 852, // centre de l'ellipse supérieure
  rx: 270,
  ry: 40,
  depth: 78,
};
