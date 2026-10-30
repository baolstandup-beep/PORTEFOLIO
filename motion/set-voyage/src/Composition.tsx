import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {LogoAnimation} from './LogoAnimation';
import {CONTENT, T, progress} from './layout';

export type SetVoyageProps = {
  /** Sans fond : pour l'export avec couche alpha. */
  transparent: boolean;
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const bloom = progress(frame, T.bloom);
  const breathe = 0.85 + 0.15 * Math.sin((frame / 300) * Math.PI);
  const size = Math.max(width, height);
  return (
    <AbsoluteFill style={{backgroundColor: '#ffffff'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${size * 0.55}px at 50% 46%, rgba(52,110,220,0.13) 0%, rgba(52,110,220,0.05) 45%, transparent 75%)`,
          opacity: bloom * breathe,
          transform: `scale(${0.7 + 0.3 * bloom})`,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at 50% 46%, transparent 55%, rgba(25,63,136,0.07) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Cadre de la vidéo : fond, échelle et centrage selon le format. */
export const SetVoyageComposition: React.FC<SetVoyageProps> = ({transparent}) => {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  const contentW = CONTENT.x1 - CONTENT.x0;
  const contentH = CONTENT.y1 - CONTENT.y0;
  // Vertical (TikTok) : 88 % de la largeur, un peu au-dessus du centre pour
  // rester hors de la zone couverte par la légende et les boutons.
  const scale = vertical
    ? (width * 0.88) / contentW
    : Math.min((width * 0.62) / contentW, (height * 0.62) / contentH);
  const cy = vertical ? height * 0.45 : height * 0.5;

  return (
    <AbsoluteFill>
      {transparent ? null : <Background />}
      <Audio src={staticFile('assets/audio/soundtrack.wav')} />
      <LogoAnimation scale={scale} cx={width / 2} cy={cy} />
    </AbsoluteFill>
  );
};
