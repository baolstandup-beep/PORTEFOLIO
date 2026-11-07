import { z } from 'zod';
import { DURATIONS, GENDERS, LEVELS, PROFILES, SOFTWARE, STATUSES, WORK_MODES, SCORE_CRITERIA, SCORE_MAX_PER_CRITERION } from './constants';
import { normalizePhone } from './phone';

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as unknown as [T[number]['value'], ...T[number]['value'][]];

const req = (label: string, max = 120) =>
  z.string().trim().min(1, `${label} est obligatoire.`).max(max, `${label} : ${max} caractères maximum.`);
const opt = (max = 200) => z.string().trim().max(max, `${max} caractères maximum.`).optional().default('');
const longText = (label: string) =>
  z.string().trim().min(20, `${label} : écrivez au moins 20 caractères.`).max(2000, `${label} : 2000 caractères maximum.`);
const yesNo = (msg: string) => z.enum(['oui', 'non'], { error: msg });
const optYesNo = z.enum(['oui', 'non', '']).optional().default('');
const choice = <T extends readonly { value: string }[]>(list: T, msg: string) => z.enum(values(list), { error: msg });

const url = z
  .string()
  .trim()
  .max(300, '300 caractères maximum.')
  .optional()
  .default('')
  .refine((v) => {
    if (!v) return true;
    try {
      const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      return ['http:', 'https:'].includes(u.protocol) && u.hostname.includes('.');
    } catch {
      return false;
    }
  }, 'Lien invalide. Exemple : https://www.behance.net/votre-nom');

const phone = (label: string, required: boolean) =>
  (required ? z.string().trim().min(1, `${label} est obligatoire.`) : z.string().trim().optional().default('')).refine(
    (v) => !v || normalizePhone(v) !== null,
    `${label} invalide. Exemple : 77 123 45 67`,
  );

/** Champs du formulaire public, tels qu'ils sont saisis (texte), étape par étape. */
export const applicationFields = {
  // Étape 1
  first_name: req('Le prénom', 80),
  last_name: req('Le nom', 80),
  birth_date: z
    .string()
    .optional()
    .default('')
    .refine((v) => {
      if (!v) return true;
      const d = new Date(v);
      if (Number.isNaN(d.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
      const year = d.getUTCFullYear();
      return year >= 1940 && year <= new Date().getUTCFullYear() - 10;
    }, 'Date de naissance invalide.'),
  gender: z.enum(['', ...values(GENDERS)]).optional().default(''),
  phone: phone('Le numéro de téléphone', true),
  whatsapp: phone('Le numéro WhatsApp', false),
  email: z
    .string()
    .trim()
    .max(160)
    .optional()
    .default('')
    .refine((v) => !v || z.email().safeParse(v).success, 'Adresse e-mail invalide.'),
  city: req('La ville ou localité', 80),
  neighborhood: opt(80),
  // Étape 2
  professional_profile: choice(PROFILES, 'Choisissez votre profil.'),
  professional_profile_other: opt(120),
  experience_duration: choice(DURATIONS, 'Indiquez depuis combien de temps vous pratiquez.'),
  experience_level: choice(LEVELS, 'Indiquez votre niveau.'),
  work_mode: z.enum(['', ...values(WORK_MODES)]).optional().default(''),
  has_clients: optYesNo,
  has_portfolio: optYesNo,
  // Étape 3
  software_skills: z.array(z.enum(values(SOFTWARE))).max(SOFTWARE.length).default([]),
  software_other: opt(200),
  uses_ai: optYesNo,
  ai_tools: opt(300),
  skill_to_improve: opt(300),
  main_challenge: opt(600),
  // Étape 4
  motivation: longText('Votre motivation'),
  expectations: longText('Vos attentes'),
  professional_ambition: longText('Vos ambitions'),
  knowledge_usage: longText("L'utilisation des connaissances"),
  // Étape 5
  portfolio_url: url,
  behance_url: url,
  instagram_url: url,
  facebook_url: url,
  available_five_days: yesNo('Indiquez votre disponibilité.'),
  commitment: yesNo('Indiquez votre engagement.'),
};

export type ApplicationField = keyof typeof applicationFields;

export const STEP_FIELDS: ApplicationField[][] = [
  ['first_name', 'last_name', 'birth_date', 'gender', 'phone', 'whatsapp', 'email', 'city', 'neighborhood'],
  ['professional_profile', 'professional_profile_other', 'experience_duration', 'experience_level', 'work_mode', 'has_clients', 'has_portfolio'],
  ['software_skills', 'software_other', 'uses_ai', 'ai_tools', 'skill_to_improve', 'main_challenge'],
  ['motivation', 'expectations', 'professional_ambition', 'knowledge_usage'],
  ['portfolio_url', 'behance_url', 'instagram_url', 'facebook_url', 'available_five_days', 'commitment'],
];

const crossChecks = (v: { professional_profile?: string; professional_profile_other?: string }, ctx: z.RefinementCtx) => {
  if (v.professional_profile === 'autre' && !v.professional_profile_other?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['professional_profile_other'], message: 'Précisez votre profil.' });
  }
};

export const applicationSchema = z.object(applicationFields).superRefine(crossChecks);
export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationValues = z.output<typeof applicationSchema>;

export const submissionSchema = z.object({
  values: applicationSchema,
  consent: z.literal(true, { error: 'Vous devez certifier vos informations et accepter leur utilisation.' }),
  submission_token: z.uuid(),
  started_at: z.number().int(),
  website: z.string().max(0).optional().default(''), // piège à robots
});

export type FieldErrors = Partial<Record<string, string>>;

export function issuesToErrors(issues: readonly z.core.$ZodIssue[]): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of issues) {
    const key = issue.path.filter((p) => typeof p === 'string').at(-1) as string | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

export function validateStep(step: number, values: Record<string, unknown>): FieldErrors {
  const fields = STEP_FIELDS[step];
  if (!fields) return {};
  const shape = Object.fromEntries(fields.map((f) => [f, applicationFields[f]]));
  const res = z.object(shape).superRefine(crossChecks).safeParse(values);
  return res.success ? {} : issuesToErrors(res.error.issues);
}

/** Convertit les valeurs validées en colonnes de la table candidates. */
export function toCandidateRow(v: ApplicationValues) {
  const yn = (s: string) => (s === 'oui' ? true : s === 'non' ? false : null);
  const nul = (s: string) => (s ? s : null);
  const normUrl = (s: string) => (s ? (/^https?:\/\//i.test(s) ? s : `https://${s}`) : null);
  return {
    first_name: v.first_name,
    last_name: v.last_name,
    birth_date: nul(v.birth_date),
    gender: nul(v.gender),
    phone: v.phone,
    phone_normalized: normalizePhone(v.phone)!,
    whatsapp: v.whatsapp ? normalizePhone(v.whatsapp) : null,
    email: v.email ? v.email.toLowerCase() : null,
    city: v.city,
    neighborhood: nul(v.neighborhood),
    professional_profile: v.professional_profile,
    professional_profile_other: v.professional_profile === 'autre' ? nul(v.professional_profile_other) : null,
    experience_level: v.experience_level,
    experience_duration: v.experience_duration,
    work_mode: nul(v.work_mode),
    has_clients: yn(v.has_clients),
    has_portfolio: yn(v.has_portfolio),
    software_skills: v.software_skills,
    software_other: nul(v.software_other),
    uses_ai: yn(v.uses_ai),
    ai_tools: nul(v.ai_tools),
    skill_to_improve: nul(v.skill_to_improve),
    main_challenge: nul(v.main_challenge),
    motivation: v.motivation,
    expectations: v.expectations,
    professional_ambition: v.professional_ambition,
    knowledge_usage: v.knowledge_usage,
    portfolio_url: normUrl(v.portfolio_url),
    behance_url: normUrl(v.behance_url),
    instagram_url: normUrl(v.instagram_url),
    facebook_url: normUrl(v.facebook_url),
    available_five_days: v.available_five_days === 'oui',
    commitment: v.commitment === 'oui',
  };
}

export type CandidateRowInput = ReturnType<typeof toCandidateRow>;

// ── Administration ─────────────────────────────────────────────

export const statusSchema = z.object({ status: z.enum(values(STATUSES)) });

export const scoreSchema = z.object({
  scores: z.object(
    Object.fromEntries(
      SCORE_CRITERIA.map((c) => [c.key, z.number().int().min(0).max(SCORE_MAX_PER_CRITERION).nullable()]),
    ) as Record<(typeof SCORE_CRITERIA)[number]['key'], z.ZodNullable<z.ZodNumber>>,
  ),
  admin_notes: z.string().max(4000).optional(),
});

export function totalScore(scores: Record<string, number | null>): number | null {
  const vals = Object.values(scores).filter((n): n is number => typeof n === 'number');
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
}

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Adresse e-mail invalide.')),
  password: z.string().min(1, 'Mot de passe obligatoire.').max(200),
});
