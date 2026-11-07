import { z } from 'zod';
import { normalizePhone } from './phone';

export const PARTNER_TYPES = [
  { value: 'institutionnel', label: 'Partenaire institutionnel', text: 'Accompagnement institutionnel, mobilisation, mise à disposition d’infrastructures, orientation des bénéficiaires, soutien financier ou logistique.' },
  { value: 'financier', label: 'Partenaire financier / sponsor', text: 'Contribution directe au financement du programme, avec une visibilité adaptée au niveau de contribution.' },
  { value: 'technique', label: 'Partenaire technique', text: 'Logiciels, accès à des plateformes, connexion Internet, ordinateurs, vidéoprojecteurs, impression, équipements, expertise.' },
  { value: 'media', label: 'Partenaire média', text: 'Couverture médiatique, reportages, interviews, diffusion sur les réseaux sociaux, promotion des participants et des résultats.' },
] as const;

/** Offres du dossier officiel GRAPHIA (montants indicatifs). */
export const PACKS = [
  {
    value: 'or', name: 'Pack Or', tag: 'Partenaire majeur', amount: 'À partir de 1 000 000 FCFA',
    perks: ['Statut de partenaire majeur', 'Logo en position prioritaire sur les principaux supports', 'Visibilité aux cérémonies d’ouverture et de clôture', 'Mention dans les principales communications', 'Possibilité de prise de parole', 'Stand ou espace partenaire, selon les possibilités', 'Visibilité sur les contenus photo et vidéo'],
  },
  {
    value: 'argent', name: 'Pack Argent', tag: 'Partenaire officiel', amount: '500 000 à 999 000 FCFA',
    perks: ['Logo sur les supports officiels', 'Mention sur les communications digitales', 'Visibilité pendant le Bootcamp', 'Présence lors de la cérémonie finale', 'Participation aux activités de networking'],
  },
  {
    value: 'bronze', name: 'Pack Bronze', tag: 'Partenaire soutien', amount: '200 000 à 499 000 FCFA',
    perks: ['Logo sur une sélection de supports', 'Mention sur certaines publications digitales', 'Reconnaissance lors de la clôture', 'Association à une action de soutien aux compétences créatives'],
  },
  {
    value: 'technique', name: 'Partenaire technique', tag: 'Contribution en nature', amount: 'Produits, services ou équipements',
    perks: ['Connexion Internet, impression, matériel informatique', 'Logiciels, restauration, salle', 'Équipements audiovisuels, prix pour les participants', 'Avantages définis selon la valeur et la nature de la contribution'],
  },
] as const;

export const PARTNER_STATUSES = [
  { value: 'nouveau', label: 'Nouveau', tone: 'sun' },
  { value: 'en_discussion', label: 'En discussion', tone: 'info' },
  { value: 'confirme', label: 'Confirmé', tone: 'success' },
  { value: 'decline', label: 'Décliné', tone: 'neutral' },
] as const;

const vals = <T extends readonly { value: string }[]>(l: T) => l.map((o) => o.value) as [T[number]['value'], ...T[number]['value'][]];

export const partnerSchema = z.object({
  organization: z.string().trim().min(1, 'Le nom de la structure est obligatoire.').max(160),
  contact_name: z.string().trim().min(1, 'Le nom du contact est obligatoire.').max(120),
  contact_role: z.string().trim().max(120).optional().default(''),
  phone: z.string().trim().min(1, 'Le téléphone est obligatoire.').refine((v) => normalizePhone(v) !== null, 'Numéro invalide. Exemple : 77 123 45 67'),
  email: z.string().trim().max(160).optional().default('').refine((v) => !v || z.email().safeParse(v).success, 'Adresse e-mail invalide.'),
  partner_type: z.enum(vals(PARTNER_TYPES), { error: 'Choisissez un type de partenariat.' }),
  pack: z.enum([...vals(PACKS), 'a_definir']).optional().default('a_definir'),
  message: z.string().trim().max(2000).optional().default(''),
  website: z.string().max(0).optional().default(''),
});
export type PartnerInput = z.input<typeof partnerSchema>;
