// P4 — Le programme : colonne décorative, pastille PROGRAMME, puis les 9 lignes.
import React from 'react';
import {PROGRAMME_ROWS} from '../config/assets';
import {SceneLayers} from './SceneLayers';

export const SceneShowcase: React.FC = () => (
	<SceneLayers ids={['colonne-motifs', 'programme-titre', ...PROGRAMME_ROWS]} />
);
