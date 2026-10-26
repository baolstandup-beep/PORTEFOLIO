import {VIDEO} from './video';

// Zones à éviter pour les informations essentielles (interface TikTok).
// Repères de composition, ajustables : la validation (scripts/validate-project.py)
// signale les éléments qui en sortent sur le plan final.
export const SAFE_ZONE = {
	top: 180,
	bottom: 300,
	side: 80,
} as const;

export const SAFE_RECT = {
	left: SAFE_ZONE.side,
	top: SAFE_ZONE.top,
	right: VIDEO.width - SAFE_ZONE.side,
	bottom: VIDEO.height - SAFE_ZONE.bottom,
} as const;
