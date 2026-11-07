export const PROFILES = [
  { value: 'infographiste', label: 'Infographiste professionnel' },
  { value: 'designer', label: 'Designer graphique' },
  { value: 'etudiant', label: 'Étudiant en communication ou numérique' },
  { value: 'photographe', label: 'Photographe' },
  { value: 'retoucheur', label: 'Retoucheur photo' },
  { value: 'createur_contenu', label: 'Créateur de contenu' },
  { value: 'community_manager', label: 'Community manager' },
  { value: 'entrepreneur', label: 'Entrepreneur créatif' },
  { value: 'passionne', label: "Jeune passionné d'infographie" },
  { value: 'autre', label: 'Autre' },
] as const;

export const SOFTWARE = [
  { value: 'photoshop', label: 'Adobe Photoshop' },
  { value: 'illustrator', label: 'Adobe Illustrator' },
  { value: 'indesign', label: 'Adobe InDesign' },
  { value: 'premiere', label: 'Adobe Premiere Pro' },
  { value: 'after_effects', label: 'After Effects' },
  { value: 'coreldraw', label: 'CorelDRAW' },
  { value: 'canva', label: 'Canva' },
  { value: 'figma', label: 'Figma' },
  { value: 'ia', label: "Outils d'intelligence artificielle" },
  { value: 'autres', label: 'Autres' },
] as const;

export const LEVELS = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
] as const;

export const DURATIONS = [
  { value: 'pas_encore', label: "Je n'ai pas encore commencé" },
  { value: 'moins_1_an', label: "Moins d'un an" },
  { value: '1_2_ans', label: '1 à 2 ans' },
  { value: '3_5_ans', label: '3 à 5 ans' },
  { value: 'plus_5_ans', label: 'Plus de 5 ans' },
] as const;

export const WORK_MODES = [
  { value: 'freelance', label: 'En freelance' },
  { value: 'agence', label: 'En agence / entreprise' },
  { value: 'personnel', label: 'Pour moi-même (projets personnels)' },
  { value: 'aucun', label: 'Je ne travaille pas encore dans le domaine' },
] as const;

export const GENDERS = [
  { value: 'homme', label: 'Homme' },
  { value: 'femme', label: 'Femme' },
] as const;

export const STATUSES = [
  { value: 'en_attente', label: 'En attente', tone: 'neutral' },
  { value: 'preselectionne', label: 'Présélectionné', tone: 'info' },
  { value: 'retenu', label: 'Retenu', tone: 'success' },
  { value: 'non_retenu', label: 'Non retenu', tone: 'danger' },
] as const;

export const SCORE_CRITERIA = [
  { key: 'motivation', label: 'Motivation' },
  { key: 'experience', label: 'Expérience' },
  { key: 'interet', label: 'Intérêt pour la création graphique' },
  { key: 'disponibilite', label: 'Disponibilité' },
  { key: 'potentiel', label: "Potentiel d'évolution" },
] as const;

export const SCORE_MAX_PER_CRITERION = 5;

export const ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const;
export const ATTACHMENT_MAX_FILES = 3;
/** Total maximum : Vercel refuse les requêtes de plus de 4,5 Mo. */
export const ATTACHMENT_MAX_TOTAL_BYTES = 4 * 1024 * 1024;

export type StatusValue = (typeof STATUSES)[number]['value'];
export type ScoreKey = (typeof SCORE_CRITERIA)[number]['key'];

type Opt = { readonly value: string; readonly label: string };
export function labelOf(list: readonly Opt[], value: string | null | undefined): string {
  if (!value) return '—';
  return list.find((o) => o.value === value)?.label ?? value;
}
