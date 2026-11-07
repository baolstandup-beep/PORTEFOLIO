import { describe, expect, it } from 'vitest';
import { normalizePhone, formatPhone } from '@/lib/phone';
import { sniffMime, safeFileName, checkFileList } from '@/lib/files';
import { applicationSchema, submissionSchema, toCandidateRow, totalScore, validateStep } from '@/lib/validation';

const valid = {
  first_name: 'Awa', last_name: 'Diop', birth_date: '2000-05-12', gender: 'femme', phone: '77 123 45 67', whatsapp: '', email: 'awa@exemple.sn',
  city: 'Touba', neighborhood: 'Darou Marnane', professional_profile: 'designer', professional_profile_other: '', experience_duration: '1_2_ans',
  experience_level: 'intermediaire', work_mode: 'freelance', has_clients: 'oui', has_portfolio: 'non', software_skills: ['photoshop', 'canva'],
  software_other: '', uses_ai: 'oui', ai_tools: 'ChatGPT', skill_to_improve: 'Branding', main_challenge: '',
  motivation: 'Je veux progresser en design et en IA.', expectations: 'Apprendre les outils IA modernes.',
  professional_ambition: 'Ouvrir mon studio de design à Touba.', knowledge_usage: 'Former mes collègues et servir mes clients.',
  portfolio_url: 'behance.net/awa', behance_url: '', instagram_url: '', facebook_url: '', available_five_days: 'oui', commitment: 'oui',
};

describe('téléphone', () => {
  it('normalise les numéros sénégalais', () => {
    expect(normalizePhone('77 123 45 67')).toBe('221771234567');
    expect(normalizePhone('+221 77 123 45 67')).toBe('221771234567');
    expect(normalizePhone('00221771234567')).toBe('221771234567');
    expect(normalizePhone('33 961 00 00')).toBe('221339610000');
  });
  it('refuse les numéros invalides', () => {
    expect(normalizePhone('12')).toBeNull();
    expect(normalizePhone('+221 12 345 67 89')).toBeNull();
  });
  it('formate', () => expect(formatPhone('221771234567')).toBe('+221 77 123 45 67'));
});

describe('formulaire', () => {
  it('accepte une candidature complète', () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true);
  });
  it('exige les champs obligatoires de l’étape 1', () => {
    const errs = validateStep(0, { ...valid, first_name: '', phone: '' });
    expect(errs.first_name).toBeTruthy();
    expect(errs.phone).toBeTruthy();
  });
  it('exige la précision quand le profil est « Autre »', () => {
    expect(validateStep(1, { ...valid, professional_profile: 'autre' }).professional_profile_other).toBeTruthy();
  });
  it('exige 20 caractères pour la motivation', () => {
    expect(validateStep(3, { ...valid, motivation: 'court' }).motivation).toBeTruthy();
  });
  it('refuse une URL invalide', () => {
    expect(validateStep(4, { ...valid, behance_url: 'pas une url' }).behance_url).toBeTruthy();
  });
  it('refuse un logiciel inconnu', () => {
    expect(applicationSchema.safeParse({ ...valid, software_skills: ['hack'] }).success).toBe(false);
  });
  it('exige le consentement', () => {
    const base = { values: valid, submission_token: crypto.randomUUID(), started_at: Date.now() };
    expect(submissionSchema.safeParse({ ...base, consent: false }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...base, consent: true }).success).toBe(true);
  });
  it('convertit en ligne de base', () => {
    const row = toCandidateRow(applicationSchema.parse(valid));
    expect(row.phone_normalized).toBe('221771234567');
    expect(row.has_clients).toBe(true);
    expect(row.has_portfolio).toBe(false);
    expect(row.portfolio_url).toBe('https://behance.net/awa');
    expect(row.whatsapp).toBeNull();
  });
});

describe('fichiers', () => {
  it('détecte le vrai type', () => {
    expect(sniffMime(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffMime(new TextEncoder().encode('%PDF-1.7'))).toBe('application/pdf');
    expect(sniffMime(new TextEncoder().encode('<script>'))).toBeNull();
  });
  it('nettoie le nom', () => expect(safeFileName('../../Mon affiche été.png')).toBe('Mon-affiche-ete.png'));
  it('limite le volume', () => {
    expect(checkFileList([{ size: 5 * 1024 * 1024 }])).toBeTruthy();
    expect(checkFileList([{ size: 1 }, { size: 1 }, { size: 1 }, { size: 1 }])).toBeTruthy();
    expect(checkFileList([{ size: 1024 }])).toBeNull();
  });
});

describe('score', () => {
  it('additionne les critères notés', () => {
    expect(totalScore({ a: 5, b: 3, c: null })).toBe(8);
    expect(totalScore({ a: null })).toBeNull();
  });
});
