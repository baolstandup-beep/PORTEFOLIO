// Paramètres de rendu et couleurs mesurées dans le PSD.

export const VIDEO = {
	width: 1080,
	height: 1920,
	fps: 30,
} as const;

// Dimensions du document PSD : toutes les positions des éléments sont dans ce repère.
export const DOC = {
	width: 2317,
	height: 3014,
} as const;

// Couleurs échantillonnées dans les éléments extraits (voir rapport_psd.md).
export const BRAND = {
	green: '#149444',
	blue: '#2c74bc',
	white: '#ffffff',
} as const;
