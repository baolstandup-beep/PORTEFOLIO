import { DURATIONS, GENDERS, LEVELS, PROFILES, SOFTWARE, WORK_MODES, labelOf } from '@/lib/constants';

export type RecapValues = Record<string, string | string[]>;

const yn = (v: unknown) => (v === 'oui' ? 'Oui' : v === 'non' ? 'Non' : '—');
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : '—');

export function recapSections(v: RecapValues) {
  const software = Array.isArray(v.software_skills) ? v.software_skills.map((s) => labelOf(SOFTWARE, s)) : [];
  if (typeof v.software_other === 'string' && v.software_other.trim()) software.push(v.software_other.trim());
  const profile =
    v.professional_profile === 'autre' && typeof v.professional_profile_other === 'string' && v.professional_profile_other
      ? `Autre : ${v.professional_profile_other}`
      : labelOf(PROFILES, v.professional_profile as string);
  const birth = typeof v.birth_date === 'string' && v.birth_date ? new Date(v.birth_date).toLocaleDateString('fr-FR', { timeZone: 'UTC' }) : '—';
  return [
    {
      step: 0,
      title: 'Informations personnelles',
      items: [
        ['Prénom et nom', `${str(v.first_name)} ${typeof v.last_name === 'string' ? v.last_name : ''}`.trim()],
        ['Date de naissance', birth],
        ['Sexe', labelOf(GENDERS, v.gender as string)],
        ['Téléphone', str(v.phone)],
        ['WhatsApp', str(v.whatsapp)],
        ['E-mail', str(v.email)],
        ['Ville ou localité', str(v.city)],
        ['Quartier', str(v.neighborhood)],
      ],
    },
    {
      step: 1,
      title: 'Profil professionnel',
      items: [
        ['Profil', profile],
        ['Pratique depuis', labelOf(DURATIONS, v.experience_duration as string)],
        ['Niveau', labelOf(LEVELS, v.experience_level as string)],
        ['Cadre de travail', labelOf(WORK_MODES, v.work_mode as string)],
        ['A déjà des clients', yn(v.has_clients)],
        ['Possède un portfolio', yn(v.has_portfolio)],
      ],
    },
    {
      step: 2,
      title: 'Compétences et outils',
      items: [
        ['Logiciels et outils', software.length ? software.join(', ') : '—'],
        ['Utilise déjà l’IA', yn(v.uses_ai)],
        ['Outils IA connus', str(v.ai_tools)],
        ['Compétence à améliorer', str(v.skill_to_improve)],
        ['Principal défi', str(v.main_challenge)],
      ],
    },
    {
      step: 3,
      title: 'Motivation',
      items: [
        ['Pourquoi participer', str(v.motivation)],
        ['Attentes', str(v.expectations)],
        ['Ambitions professionnelles', str(v.professional_ambition)],
        ['Utilisation des acquis', str(v.knowledge_usage)],
      ],
    },
    {
      step: 4,
      title: 'Portfolio et disponibilité',
      items: [
        ['Portfolio', str(v.portfolio_url)],
        ['Behance', str(v.behance_url)],
        ['Instagram', str(v.instagram_url)],
        ['Facebook', str(v.facebook_url)],
        ['Disponible les 5 jours', yn(v.available_five_days)],
        ['Engagement à participer activement', yn(v.commitment)],
      ],
    },
  ];
}

export function RecapList({ values, onEdit }: { values: RecapValues; onEdit?: (step: number) => void }) {
  return (
    <div className="space-y-5">
      {recapSections(values).map((s) => (
        <section key={s.title} className="print-break rounded-2xl border border-ink/10 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-bold text-brand">{s.title}</h3>
            {onEdit && (
              <button type="button" onClick={() => onEdit(s.step)} className="no-print text-sm font-semibold text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                Modifier
              </button>
            )}
          </div>
          <dl className="grid gap-x-6 gap-y-2.5 text-[15px] sm:grid-cols-[minmax(0,14rem)_1fr]">
            {s.items.map(([k, val]) => (
              <div key={k} className="contents">
                <dt className="text-ink/55">{k}</dt>
                <dd className="whitespace-pre-line break-words font-medium">{val}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
