import React from 'react';
import {Composition} from 'remotion';
import {TikTokVideo, type TikTokVideoProps} from './compositions/TikTokVideo';
import {TOTAL_FRAMES} from './config/timeline';
import {VIDEO} from './config/video';

const defaultProps: TikTokVideoProps = {bgm: true, voice: false};

export const Root: React.FC = () => (
	<Composition
		id="TikTokVideo"
		component={TikTokVideo}
		durationInFrames={TOTAL_FRAMES}
		fps={VIDEO.fps}
		width={VIDEO.width}
		height={VIDEO.height}
		defaultProps={defaultProps}
	/>
);
