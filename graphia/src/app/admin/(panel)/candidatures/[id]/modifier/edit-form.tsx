'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Button, Card, Field, Input, Select, Textarea } from '@/components/ui';
import { DURATIONS, GENDERS, LEVELS, PROFILES, SOFTWARE, WORK_MODES } from '@/lib/constants';
import type { FieldErrors } from '@/lib/validation';

type Values = Record<string, string | string[]>;
type Opt = readonly { value: string; label: string }[];
type Def = { k: string; label: string; required?: boolean; kind?: 'text' | 'textarea' | 'select' | 'date' | 'yesno'; options?: Opt };

const YESNO: Opt = [{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }];
const SECTIONS: { title: string; fields: Def[] }[] = [
  {
    title: 'Informations personnelles',
    fields: [
      { k: 'first_name', label: 'Prénom', required: true },
      { k: 'last_name', label: 'Nom', required: true },
      { k: 'birth_date', label: 'Date de naissance', kind: 'date' },
      { k: 'gender', label: 'Sexe', kind: 'select', options: GENDERS },
      { k: 'phone', label: 'Téléphone', required: true },
      { k: 'whatsapp', label: 'WhatsApp' },
      { k: 'email', label: 'E-mail' },
      { k: 'city', label: 'Ville ou localité', required: true },
      { k: 'neighborhood', label: 'Quartier' },
    ],
  },
  {
    title: 'Profil professionnel',
    fields: [
      { k: 'professional_profile', label: 'Profil', required: true, kind: 'select', options: PROFILES },
      { k: 'professional_profile_other', label: 'Profil (si « Autre »)' },
      { k: 'experience_duration', label: 'Pratique depuis', required: true, kind: 'select', options: DURATIONS },
      { k: 'experience_level', label: 'Niveau', required: true, kind: 'select', options: LEVELS },
      { k: 'work_mode', label: 'Cadre de travail', kind: 'select', options: WORK_MODES },
      { k: 'has_clients', label: 'A des clients', kind: 'yesno' },
      { k: 'has_portfolio', label: 'A un portfolio', kind: 'yesno' },
    ],
  },
  {
    title: 'Compétences',
    fields: [
      { k: 'software_other', label: 'Autres logiciels' },
      { k: 'uses_ai', label: 'Utilise l’IA', kind: 'yesno' },
      { k: 'ai_tools', label: 'Outils IA' },
      { k: 'skill_to_improve', label: 'Compétence à améliorer' },
      { k: 'main_challenge', label: 'Principal défi', kind: 'textarea' },
    ],
  },
  {
    title: 'Motivation',
    fields: [
      { k: 'motivation', label: 'Pourquoi participer', required: true, kind: 'textarea' },
      { k: 'expectations', label: 'Attentes', required: true, kind: 'textarea' },
      { k: 'professional_ambition', label: 'Ambitions', required: true, kind: 'textarea' },
      { k: 'knowledge_usage', label: 'Utilisation des acquis', required: true, kind: 'textarea' },
    ],
  },
  {
    title: 'Portfolio et disponibilité',
    fields: [
      { k: 'portfolio_url', label: 'Portfolio' },
      { k: 'behance_url', label: 'Behance' },
      { k: 'instagram_url', label: 'Instagram' },
      { k: 'facebook_url', label: 'Facebook' },
      { k: 'available_five_days', label: 'Disponible les 5 jours', required: true, kind: 'yesno' },
      { k: 'commitment', label: 'Engagement', required: true, kind: 'yesno' },
    ],
  },
];

export function EditForm({ id, initial }: { id: string; initial: Values }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: string, v: string | string[]) => setValues((p) => ({ ...p, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    const res = await fetch(`/api/admin/candidates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      router.push(`/admin/candidatures/${id}`);
      router.refresh();
      return;
    }
    setErrors(data.fields ?? {});
    setError(data.error ?? 'Enregistrement impossible.');
    setBusy(false);
  }

  return (
    <form onSubmit={save} noValidate className="space-y-6">
      {SECTIONS.map((s) => (
        <Card key={s.title} className="space-y-5 p-5 sm:p-6">
          <h2 className="font-bold text-brand">{s.title}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {s.fields.map((f) => {
              const id = `e-${f.k}`;
              const v = (values[f.k] as string) ?? '';
              const common = { id, value: v, invalid: Boolean(errors[f.k]), onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(f.k, e.target.value) };
              return (
                <Field key={f.k} id={id} label={f.label} required={f.required} error={errors[f.k]} className={f.kind === 'textarea' ? 'sm:col-span-2' : ''}>
                  {f.kind === 'textarea' ? (
                    <Textarea {...common} rows={4} />
                  ) : f.kind === 'select' || f.kind === 'yesno' ? (
                    <Select {...common}>
                      <option value="">—</option>
                      {(f.kind === 'yesno' ? YESNO : f.options!).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  ) : (
                    <Input {...common} type={f.kind === 'date' ? 'date' : 'text'} />
                  )}
                </Field>
              );
            })}
          </div>
          {s.title === 'Compétences' && (
            <fieldset>
              <legend className="mb-2 text-[15px] font-semibold">Logiciels et outils</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {SOFTWARE.map((o) => {
                  const list = values.software_skills as string[];
                  const checked = list.includes(o.value);
                  return (
                    <label key={o.value} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={checked} onChange={() => set('software_skills', checked ? list.filter((x) => x !== o.value) : [...list, o.value])} className="h-4 w-4 accent-[#078D43]" />
                      {o.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
        </Card>
      ))}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" disabled={busy} className="shadow-lg">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
