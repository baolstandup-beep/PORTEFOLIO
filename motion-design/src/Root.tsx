import React from 'react';
import {Composition} from 'remotion';
import {TikTokRedesign, type TikTokRedesignProps} from './compositions/TikTokRedesign';
import {TikTokVideo, type TikTokVideoProps} from './compositions/TikTokVideo';
import {REDESIGN_FRAMES} from './config/redesign';
import {TOTAL_FRAMES} from './config/timeline';
import {VIDEO} from './config/video';

const redesignProps: TikTokRedesignProps = {bgm: true};
const cameraProps: TikTokVideoProps = {bgm: true, voice: false};

export const Root: React.FC = () => (
	<>
		{/* Vidéo principale : éléments recomposés pour le 9:16. */}
		<Composition
			id="TikTokVideo"
			component={TikTokRedesign}
			durationInFrames={REDESIGN_FRAMES}
			fps={VIDEO.fps}
			width={VIDEO.width}
			height={VIDEO.height}
			defaultProps={redesignProps}
		/>
		{/* Variante précédente : caméra 2D sur l'affiche d'origine, mise en page inchangée. */}
		<Composition
			id="AfficheCamera"
			component={TikTokVideo}
			durationInFrames={TOTAL_FRAMES}
			fps={VIDEO.fps}
			width={VIDEO.width}
			height={VIDEO.height}
			defaultProps={cameraProps}
		/>
	</>
);
