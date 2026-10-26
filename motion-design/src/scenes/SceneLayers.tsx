// Rend les éléments d'un plan, avec le reflet lumineux éventuel de la timeline.
import React from 'react';
import type {ElementId} from '../config/assets';
import {LIGHT_SWEEPS} from '../config/timeline';
import {Layer} from '../components/Layer';
import {LightSweep} from '../components/LightSweep';

export const SceneLayers: React.FC<{ids: ElementId[]}> = ({ids}) => (
	<>
		{ids.map((id) => (
			<Layer key={id} id={id}>
				{LIGHT_SWEEPS.filter((s) => s.id === id).map((s) => (
					<LightSweep key={s.at} {...s} />
				))}
			</Layer>
		))}
	</>
);
