import React from 'react';
import {Img} from 'remotion';
import {LOGO_H, LOGO_W, layer} from './layout';

/** Calque du logo à sa position exacte dans le repère du JPG source. */
export const Layer: React.FC<{
  name: string;
  style?: React.CSSProperties;
}> = ({name, style}) => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: LOGO_W,
      height: LOGO_H,
      ...style,
    }}
  >
    <Img
      src={layer(name)}
      style={{width: LOGO_W, height: LOGO_H, display: 'block'}}
    />
  </div>
);
