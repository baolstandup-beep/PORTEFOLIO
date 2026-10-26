import generated from './assets.generated.json';

// Éléments extraits du PSD par scripts/extract-assets.py (positions en px document).
export type ElementId =
	| 'colonne-motifs'
	| 'pupitre'
	| 'logo-paspas'
	| 'bandeau-plateforme'
	| 'titre-conference'
	| 'titre-de-presse'
	| 'info-date'
	| 'info-lieu'
	| 'programme-titre'
	| `programme-ligne-0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
	| 'bandeau-contacts';

export type PsdElement = {
	id: ElementId;
	category: string;
	role: string;
	src: string;
	x: number;
	y: number;
	width: number;
	height: number;
	// Boîte des pixels visibles (opacité > 8/255), sans les ombres très faibles.
	visible: {x: number; y: number; width: number; height: number};
	zIndex: number;
	opacity: number;
};

export const ELEMENTS = generated.elements as PsdElement[];

const byId = new Map(ELEMENTS.map((e) => [e.id, e]));

export const getElement = (id: ElementId): PsdElement => {
	const el = byId.get(id);
	if (!el) {
		throw new Error(`Élément « ${id} » absent de assets.generated.json : relancer npm run extract`);
	}
	return el;
};

export const PROGRAMME_ROWS = ELEMENTS.filter((e) => e.id.startsWith('programme-ligne-')).map((e) => e.id);
