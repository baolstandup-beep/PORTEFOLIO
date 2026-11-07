/** Convertit une ligne de la base en valeurs de formulaire (texte, « oui »/« non »). */
export function candidateToValues(c: Record<string, unknown>): Record<string, string | string[]> {
  const yn = (b: unknown) => (b === true ? 'oui' : b === false ? 'non' : '');
  const s = (v: unknown) => (v == null ? '' : String(v));
  const date = (v: unknown) => {
    if (!v) return '';
    if (v instanceof Date) {
      const y = v.getFullYear(), m = String(v.getMonth() + 1).padStart(2, '0'), d = String(v.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return String(v).slice(0, 10);
  };
  return {
    first_name: s(c.first_name),
    last_name: s(c.last_name),
    birth_date: date(c.birth_date),
    gender: s(c.gender),
    phone: s(c.phone),
    whatsapp: c.whatsapp ? `+${c.whatsapp}` : '',
    email: s(c.email),
    city: s(c.city),
    neighborhood: s(c.neighborhood),
    professional_profile: s(c.professional_profile),
    professional_profile_other: s(c.professional_profile_other),
    experience_duration: s(c.experience_duration),
    experience_level: s(c.experience_level),
    work_mode: s(c.work_mode),
    has_clients: yn(c.has_clients),
    has_portfolio: yn(c.has_portfolio),
    software_skills: Array.isArray(c.software_skills) ? (c.software_skills as string[]) : [],
    software_other: s(c.software_other),
    uses_ai: yn(c.uses_ai),
    ai_tools: s(c.ai_tools),
    skill_to_improve: s(c.skill_to_improve),
    main_challenge: s(c.main_challenge),
    motivation: s(c.motivation),
    expectations: s(c.expectations),
    professional_ambition: s(c.professional_ambition),
    knowledge_usage: s(c.knowledge_usage),
    portfolio_url: s(c.portfolio_url),
    behance_url: s(c.behance_url),
    instagram_url: s(c.instagram_url),
    facebook_url: s(c.facebook_url),
    available_five_days: yn(c.available_five_days),
    commitment: yn(c.commitment),
  };
}
