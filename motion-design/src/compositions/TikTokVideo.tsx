// Composition principale verticale 1080×1920 : un seul plateau (l'affiche) filmé
// par une caméra 2D ; les « scènes » regroupent les éléments par plan. Tous les
// éléments restent à l'écran une fois apparus, si bien que la dernière image
// reproduit exactement l'affiche d'origine.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background} from '../components/Background';
import {CameraMotion} from '../components/CameraMotion';
import {Soundtrack} from '../components/Soundtrack';
import {SceneInformation} from '../scenes/SceneInformation';
import {SceneIntro} from '../scenes/SceneIntro';
import {SceneOutro} from '../scenes/SceneOutro';
import {SceneReveal} from '../scenes/SceneReveal';
import {SceneShowcase} from '../scenes/SceneShowcase';

// voice : voix off (désactivée par défaut à la demande du client ; les prises restent dans le projet).
export type TikTokVideoProps = {bgm: boolean; voice: boolean};

export const TikTokVideo: React.FC<TikTokVideoProps> = ({bgm, voice}) => (
	<AbsoluteFill style={{backgroundColor: '#fff'}}>
		<CameraMotion>
			<Background />
			<AbsoluteFill>
				<SceneShowcase />
				<SceneInformation />
				<SceneReveal />
				<SceneIntro />
				<SceneOutro />
			</AbsoluteFill>
		</CameraMotion>
		<Soundtrack bgm={bgm} voice={voice} />
	</AbsoluteFill>
);
