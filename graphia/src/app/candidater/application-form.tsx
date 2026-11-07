'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, FileText, Loader2, Paperclip, RotateCcw, Send, X } from 'lucide-react';
import {
  ATTACHMENT_MAX_FILES,
  ATTACHMENT_MAX_TOTAL_BYTES,
  ATTACHMENT_TYPES,
  DURATIONS,
  GENDERS,
  LEVELS,
  PROFILES,
  SOFTWARE,
  WORK_MODES,
} from '@/lib/constants';
import { STEP_FIELDS, validateStep, type FieldErrors } from '@/lib/validation';
import { cn } from '@/lib/utils';
import { RecapList } from '@/components/recap';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';

const DRAFT_KEY = 'graphia_draft_v1';
const STEPS = ['Informations personnelles', 'Profil professionnel', 'Compétences et outils', 'Motivation', 'Portfolio et disponibilité', 'Validation'];

type Values = Record<string, string | string[]>;
const EMPTY: Values = {
  first_name: '', last_name: '', birth_date: '', gender: '', phone: '', whatsapp: '', email: '', city: '', neighborhood: '',
  professional_profile: '', professional_profile_other: '', experience_duration: '', experience_level: '', work_mode: '',
  has_clients: '', has_portfolio: '',
  software_skills: [], software_other: '', uses_ai: '', ai_tools: '', skill_to_improve: '', main_challenge: '',
  motivation: '', expectations: '', professional_ambition: '', knowledge_usage: '',
  portfolio_url: '', behance_url: '', instagram_url: '', facebook_url: '', available_five_days: '', commitment: '',
};
const REQUIRED = ['first_name', 'last_name', 'phone', 'city', 'professional_profile', 'experience_duration', 'experience_level',
  'motivation', 'expectations', 'professional_ambition', 'knowledge_usage', 'available_five_days', 'commitment'];

type Draft = { values: Values; step: number; token: string; startedAt: number; savedAt: number };

function newToken() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
        (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
      );
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    if (!d?.values || typeof d.token !== 'string') return null;
    return { ...d, values: { ...EMPTY, ...d.values } };
  } catch {
    return null;
  }
}

const formatBytes = (n: number) => (n < 1024 * 1024 ? `${Math.round(n / 1024)} Ko` : `${(n / 1024 / 1024).toFixed(1)} Mo`);

export function ApplicationForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState<Values>(EMPTY);
  const [step, setStep] = useState(0);
  const [token, setToken] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const [restored, setRestored] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  // Restauration du brouillon enregistré sur l'appareil
  useEffect(() => {
    const d = readDraft();
    if (d) {
      setValues(d.values);
      setStep(Math.min(Math.max(d.step, 0), STEPS.length - 1));
      setToken(d.token);
      setStartedAt(d.startedAt);
      const filled = Object.entries(d.values).some(([, v]) => (Array.isArray(v) ? v.length : v));
      setRestored(filled);
    } else {
      setToken(newToken());
      setStartedAt(Date.now());
    }
    setReady(true);
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ values, step, token, startedAt, savedAt: Date.now() } satisfies Draft));
      } catch {
        /* stockage plein ou désactivé : le formulaire fonctionne quand même */
      }
    }, 300);
    return () => clearTimeout(t);
  }, [values, step, token, startedAt, ready]);

  const set = useCallback((name: string, v: string | string[]) => {
    setValues((prev) => ({ ...prev, [name]: v }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev));
  }, []);

  const progress = useMemo(() => {
    const all = Object.keys(EMPTY);
    const filled = all.filter((k) => {
      const v = values[k];
      return Array.isArray(v) ? v.length > 0 : Boolean(v);
    }).length;
    const req = REQUIRED.filter((k) => Boolean(values[k])).length;
    // Les champs obligatoires comptent davantage que les facultatifs
    const pct = ((req / REQUIRED.length) * 0.75 + (filled / all.length) * 0.2 + (consent ? 0.05 : 0)) * 100;
    return Math.min(100, Math.round(pct));
  }, [values, consent]);

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function focusFirstError(errs: FieldErrors) {
    const first = Object.keys(errs).find((k) => errs[k]);
    if (!first) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(`f-${first}`) || document.querySelector<HTMLElement>(`[name="${first}"]`);
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function goNext() {
    const errs = validateStep(step, values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    scrollTop();
  }

  function goBack() {
    setErrors({});
    setConfirming(false);
    setStep((s) => Math.max(s - 1, 0));
    scrollTop();
  }

  function goTo(s: number) {
    setErrors({});
    setConfirming(false);
    setStep(s);
    scrollTop();
  }

  function restart() {
    if (!window.confirm('Effacer toutes vos réponses et recommencer ?')) return;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
    setValues(EMPTY);
    setFiles([]);
    setConsent(false);
    setStep(0);
    setToken(newToken());
    setStartedAt(Date.now());
    setRestored(false);
    setErrors({});
  }

  function addFiles(list: FileList | null) {
    setFileError('');
    if (!list) return;
    const incoming = Array.from(list);
    const bad = incoming.find((f) => !(ATTACHMENT_TYPES as readonly string[]).includes(f.type));
    if (bad) return setFileError(`« ${bad.name} » : seuls les fichiers JPG, PNG, WebP et PDF sont acceptés.`);
    const next = [...files, ...incoming];
    if (next.length > ATTACHMENT_MAX_FILES) return setFileError(`${ATTACHMENT_MAX_FILES} fichiers maximum.`);
    const total = next.reduce((s, f) => s + f.size, 0);
    if (total > ATTACHMENT_MAX_TOTAL_BYTES) return setFileError('4 Mo au total maximum. Réduisez la taille de vos images ou ajoutez plutôt un lien vers votre portfolio.');
    setFiles(next);
  }

  function askConfirm() {
    // Revalide toutes les étapes avant l'envoi
    for (let s = 0; s < STEP_FIELDS.length; s++) {
      const errs = validateStep(s, values);
      if (Object.keys(errs).length) {
        setErrors(errs);
        setStep(s);
        scrollTop();
        focusFirstError(errs);
        return;
      }
    }
    if (!consent) {
      setConsentError('Cochez cette case pour pouvoir envoyer votre candidature.');
      document.getElementById('f-consent')?.focus();
      return;
    }
    setConfirming(true);
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError('');
    const body = new FormData();
    body.append('payload', JSON.stringify({ values, consent, submission_token: token, started_at: startedAt, website: honeypot }));
    files.forEach((f) => body.append('files', f, f.name));
    try {
      const res = await fetch('/api/candidatures', { method: 'POST', body, signal: AbortSignal.timeout(90_000) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 422 && data.fields) {
          const errs = data.fields as FieldErrors;
          const s = STEP_FIELDS.findIndex((fields) => fields.some((f) => errs[f]));
          setErrors(errs);
          if (s >= 0) setStep(s);
          setConfirming(false);
          scrollTop();
          focusFirstError(errs);
        }
        setSubmitError(data.error || 'La candidature n’a pas pu être envoyée. Réessayez.');
        setSubmitting(false);
        return;
      }
      try {
        sessionStorage.setItem('graphia_confirmation', JSON.stringify({ ...data, recap: values }));
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      router.push('/candidater/confirmation');
    } catch {
      setSubmitError('Connexion interrompue. Vos réponses sont conservées sur votre téléphone : vérifiez votre connexion puis appuyez de nouveau sur « Envoyer ». Votre candidature ne sera pas enregistrée en double.');
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-ink/60">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement du formulaire…
      </div>
    );
  }

  const err = (k: string) => errors[k];
  const text = (k: string) => (values[k] as string) ?? '';
  const describedBy = (k: string, hint = false) => [hint && `f-${k}-hint`, err(k) && `f-${k}-error`].filter(Boolean).join(' ') || undefined;
  const inputProps = (k: string, hint = false) => ({
    id: `f-${k}`,
    name: k,
    value: text(k),
    invalid: Boolean(err(k)),
    'aria-describedby': describedBy(k, hint),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => set(k, e.target.value),
  });

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* Progression */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-ink/5 bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <p className="font-semibold">
            <span className="text-brand">Étape {step + 1}</span>
            <span className="text-ink/50"> sur {STEPS.length}</span>
            <span className="hidden text-ink/70 sm:inline"> · {STEPS[step]}</span>
          </p>
          <p className="font-bold tabular-nums" aria-live="polite">{progress} %</p>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-mist" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Remplissage du formulaire">
          <div className="h-full rounded-full bg-gradient-to-r from-brand to-[#2bb36a] transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-3 hidden grid-cols-6 gap-1.5 sm:grid" aria-label="Étapes">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                disabled={i > step}
                onClick={() => i < step && goTo(i)}
                className={cn(
                  'w-full truncate rounded-lg px-2 py-1 text-left text-[11px] font-semibold transition-colors',
                  i === step ? 'bg-ink text-white' : i < step ? 'bg-brand-50 text-brand-dark hover:bg-brand/15' : 'bg-mist text-ink/40',
                )}
                aria-current={i === step ? 'step' : undefined}
              >
                {i < step && <Check className="mr-1 inline h-3 w-3" />}
                {i + 1}. {s}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {restored && step < 5 && (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            <strong>Bon retour !</strong> Nous avons retrouvé vos réponses enregistrées sur cet appareil.
          </p>
          <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 font-semibold text-ink/70 hover:text-ink">
            <RotateCcw className="h-4 w-4" /> Recommencer
          </button>
        </div>
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 5) goNext();
          else if (!confirming) askConfirm();
        }}
        className="space-y-6"
      >
        {/* Piège à robots : invisible pour les humains */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Site web
            <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />
          </label>
        </div>

        <div key={step} className="animate-rise rounded-3xl border border-ink/8 bg-white p-5 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold">{STEPS[step]}</h2>
          <p className="mt-1 text-sm text-ink/55">
            Les champs marqués <span className="font-bold text-red-600">*</span> sont obligatoires.
          </p>

          <div className="mt-7 space-y-6">
            {step === 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="f-first_name" label="Prénom" required error={err('first_name')}>
                    <Input {...inputProps('first_name')} autoComplete="given-name" />
                  </Field>
                  <Field id="f-last_name" label="Nom" required error={err('last_name')}>
                    <Input {...inputProps('last_name')} autoComplete="family-name" />
                  </Field>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="f-birth_date" label="Date de naissance" error={err('birth_date')}>
                    <Input {...inputProps('birth_date')} type="date" autoComplete="bday" max={`${new Date().getFullYear() - 10}-12-31`} />
                  </Field>
                  <ChoiceGroup label="Sexe" name="gender" options={GENDERS} value={text('gender')} onChange={(v) => set('gender', v)} error={err('gender')} columns={2} />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="f-phone" label="Numéro de téléphone" required hint="Exemple : 77 123 45 67" error={err('phone')}>
                    <Input {...inputProps('phone', true)} type="tel" inputMode="tel" autoComplete="tel" />
                  </Field>
                  <Field id="f-whatsapp" label="Numéro WhatsApp" hint="Si différent du téléphone" error={err('whatsapp')}>
                    <Input {...inputProps('whatsapp', true)} type="tel" inputMode="tel" />
                  </Field>
                </div>
                <Field id="f-email" label="Adresse e-mail" hint="Pour recevoir la confirmation par e-mail" error={err('email')}>
                  <Input {...inputProps('email', true)} type="email" inputMode="email" autoComplete="email" />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="f-city" label="Ville ou localité" required error={err('city')}>
                    <Input {...inputProps('city')} list="villes" autoComplete="address-level2" />
                    <datalist id="villes">
                      <option value="Touba" />
                      <option value="Mbacké" />
                      <option value="Darou Mousty" />
                      <option value="Diourbel" />
                    </datalist>
                  </Field>
                  <Field id="f-neighborhood" label="Quartier de résidence" error={err('neighborhood')}>
                    <Input {...inputProps('neighborhood')} />
                  </Field>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <ChoiceGroup label="Quel est votre profil ?" name="professional_profile" required options={PROFILES} value={text('professional_profile')} onChange={(v) => set('professional_profile', v)} error={err('professional_profile')} columns={2} />
                {text('professional_profile') === 'autre' && (
                  <Field id="f-professional_profile_other" label="Précisez votre profil" required error={err('professional_profile_other')}>
                    <Input {...inputProps('professional_profile_other')} />
                  </Field>
                )}
                <Field id="f-experience_duration" label="Depuis combien de temps pratiquez-vous l’infographie ?" required error={err('experience_duration')}>
                  <Select {...inputProps('experience_duration')}>
                    <option value="">Choisir…</option>
                    {DURATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </Field>
                <ChoiceGroup label="Êtes-vous débutant, intermédiaire ou avancé ?" name="experience_level" required options={LEVELS} value={text('experience_level')} onChange={(v) => set('experience_level', v)} error={err('experience_level')} columns={3} />
                <ChoiceGroup label="Travaillez-vous en freelance, en agence ou personnellement ?" name="work_mode" options={WORK_MODES} value={text('work_mode')} onChange={(v) => set('work_mode', v)} error={err('work_mode')} columns={2} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <YesNo label="Avez-vous déjà des clients ?" name="has_clients" value={text('has_clients')} onChange={(v) => set('has_clients', v)} />
                  <YesNo label="Possédez-vous un portfolio ?" name="has_portfolio" value={text('has_portfolio')} onChange={(v) => set('has_portfolio', v)} />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <fieldset>
                  <legend className="text-[15px] font-semibold">
                    Quels logiciels et outils utilisez-vous ? <span className="ml-1.5 text-xs font-normal text-ink/45">plusieurs choix possibles</span>
                  </legend>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {SOFTWARE.map((o) => {
                      const list = values.software_skills as string[];
                      const checked = list.includes(o.value);
                      return (
                        <label key={o.value} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors', checked ? 'border-brand bg-brand-50' : 'border-ink/12 hover:border-ink/30')}>
                          <input
                            type="checkbox"
                            name="software_skills"
                            value={o.value}
                            checked={checked}
                            onChange={() => set('software_skills', checked ? list.filter((x) => x !== o.value) : [...list, o.value])}
                            className="h-5 w-5 shrink-0 accent-[#078D43]"
                          />
                          <span className="text-[15px] font-medium">{o.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {(values.software_skills as string[]).includes('autres') && (
                  <Field id="f-software_other" label="Quels autres logiciels ?" error={err('software_other')}>
                    <Input {...inputProps('software_other')} />
                  </Field>
                )}
                <YesNo label="Utilisez-vous déjà l’intelligence artificielle ?" name="uses_ai" value={text('uses_ai')} onChange={(v) => set('uses_ai', v)} />
                <Field id="f-ai_tools" label="Quels outils IA connaissez-vous ?" hint="Exemple : ChatGPT, Midjourney, Gemini, Firefly…" error={err('ai_tools')}>
                  <Input {...inputProps('ai_tools', true)} />
                </Field>
                <Field id="f-skill_to_improve" label="Quelle compétence souhaitez-vous améliorer ?" error={err('skill_to_improve')}>
                  <Input {...inputProps('skill_to_improve')} />
                </Field>
                <Field id="f-main_challenge" label="Quel est votre principal défi dans votre activité créative ?" error={err('main_challenge')}>
                  <Textarea {...inputProps('main_challenge')} rows={3} className="min-h-24" />
                </Field>
              </>
            )}

            {step === 3 && (
              <>
                {[
                  ['motivation', 'Pourquoi souhaitez-vous participer à GRAPHIA ?'],
                  ['expectations', 'Qu’attendez-vous de cette formation ?'],
                  ['professional_ambition', 'Quelles sont vos ambitions professionnelles dans le domaine créatif ?'],
                  ['knowledge_usage', 'Comment comptez-vous utiliser les connaissances acquises après la formation ?'],
                ].map(([k, label]) => (
                  <Field key={k} id={`f-${k}`} label={label} required error={err(k)} hint={<Counter n={text(k).trim().length} />}>
                    <Textarea {...inputProps(k, true)} rows={5} maxLength={2000} />
                  </Field>
                ))}
              </>
            )}

            {step === 4 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="f-portfolio_url" label="Lien vers votre portfolio" error={err('portfolio_url')}>
                    <Input {...inputProps('portfolio_url')} type="url" inputMode="url" placeholder="https://" />
                  </Field>
                  <Field id="f-behance_url" label="Lien Behance" error={err('behance_url')}>
                    <Input {...inputProps('behance_url')} type="url" inputMode="url" placeholder="https://behance.net/…" />
                  </Field>
                  <Field id="f-instagram_url" label="Instagram professionnel" error={err('instagram_url')}>
                    <Input {...inputProps('instagram_url')} type="url" inputMode="url" placeholder="https://instagram.com/…" />
                  </Field>
                  <Field id="f-facebook_url" label="Facebook professionnel" error={err('facebook_url')}>
                    <Input {...inputProps('facebook_url')} type="url" inputMode="url" placeholder="https://facebook.com/…" />
                  </Field>
                </div>

                <div className="space-y-2">
                  <p className="text-[15px] font-semibold">
                    Exemples de réalisations <span className="ml-1.5 text-xs font-normal text-ink/45">facultatif</span>
                  </p>
                  <p className="text-sm text-ink/55">JPG, PNG, WebP ou PDF · {ATTACHMENT_MAX_FILES} fichiers maximum · 4 Mo au total. Les fichiers ne sont pas conservés si vous quittez la page.</p>
                  {files.length > 0 && (
                    <ul className="space-y-2">
                      {files.map((f, i) => (
                        <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl bg-mist px-4 py-2.5 text-sm">
                          <span className="flex min-w-0 items-center gap-2">
                            <FileText className="h-4 w-4 shrink-0 text-brand" />
                            <span className="truncate font-medium">{f.name}</span>
                            <span className="shrink-0 text-ink/50">{formatBytes(f.size)}</span>
                          </span>
                          <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="rounded-full p-1 hover:bg-white" aria-label={`Retirer ${f.name}`}>
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {files.length < ATTACHMENT_MAX_FILES && (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 px-4 py-5 text-sm font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand">
                      <Paperclip className="h-4 w-4" /> Ajouter des fichiers
                      <input type="file" multiple accept={ATTACHMENT_TYPES.join(',')} className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
                    </label>
                  )}
                  {fileError && <p role="alert" className="text-sm font-medium text-red-600">{fileError}</p>}
                </div>

                <ChoiceGroup
                  label="Êtes-vous disponible pendant les cinq jours de formation ?"
                  name="available_five_days"
                  required
                  options={[
                    { value: 'oui', label: 'Oui, je suis disponible pendant les cinq jours.' },
                    { value: 'non', label: 'Non, je ne suis pas disponible.' },
                  ]}
                  value={text('available_five_days')}
                  onChange={(v) => set('available_five_days', v)}
                  error={err('available_five_days')}
                />
                {text('available_five_days') === 'non' && (
                  <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> La présence aux cinq jours est un critère de sélection important. Vous pouvez tout de même envoyer votre candidature.
                  </p>
                )}
                <ChoiceGroup
                  label="Êtes-vous prêt à participer activement aux ateliers pratiques et aux activités de GRAPHIA ?"
                  name="commitment"
                  required
                  options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]}
                  value={text('commitment')}
                  onChange={(v) => set('commitment', v)}
                  error={err('commitment')}
                  columns={2}
                />
              </>
            )}

            {step === 5 && (
              <>
                <p className="text-[15px] text-ink/70">Relisez vos réponses. Vous pouvez encore les modifier avant l’envoi.</p>
                <RecapList values={values} onEdit={goTo} />
                {files.length > 0 && (
                  <p className="text-sm text-ink/70">
                    <Paperclip className="mr-1 inline h-4 w-4" /> {files.length} fichier(s) joint(s) : {files.map((f) => f.name).join(', ')}
                  </p>
                )}
                <div className={cn('rounded-2xl border-2 p-4 sm:p-5', consentError ? 'border-red-500' : 'border-brand/30 bg-brand-50/50')}>
                  <label className="flex cursor-pointer gap-3">
                    <input
                      id="f-consent"
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => { setConsent(e.target.checked); setConsentError(''); setConfirming(false); }}
                      className="mt-1 h-5 w-5 shrink-0 accent-[#078D43]"
                      aria-describedby={consentError ? 'f-consent-error' : undefined}
                    />
                    <span className="text-[15px] leading-relaxed">
                      Je certifie que les informations fournies sont exactes et j’accepte que mes informations soient utilisées par
                      l’équipe d’organisation dans le cadre de la gestion des candidatures GRAPHIA.{' '}
                      <a href="/confidentialite" target="_blank" className="font-semibold text-brand underline">En savoir plus</a>
                      <span className="text-red-600"> *</span>
                    </span>
                  </label>
                  {consentError && <p id="f-consent-error" role="alert" className="mt-2 text-sm font-medium text-red-600">{consentError}</p>}
                </div>
                <p className="rounded-xl bg-mist p-3 text-sm text-ink/70">
                  <strong className="text-ink">Important :</strong> l’envoi du formulaire ne signifie pas que vous êtes sélectionné. Les candidats retenus seront contactés par téléphone ou WhatsApp.
                </p>
              </>
            )}
          </div>
        </div>

        {submitError && (
          <div role="alert" className="flex gap-3 rounded-2xl bg-red-50 p-4 text-[15px] text-red-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /> <p>{submitError}</p>
          </div>
        )}

        {confirming ? (
          <div className="animate-rise rounded-3xl bg-ink p-5 text-white sm:p-6" role="dialog" aria-labelledby="confirm-title">
            <p id="confirm-title" className="text-lg font-bold">Confirmer l’envoi de votre candidature ?</p>
            <p className="mt-1 text-sm text-white/70">Une seule candidature est acceptée par personne. Vous ne pourrez plus la modifier après l’envoi.</p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setConfirming(false)} disabled={submitting}>
                Relire encore
              </Button>
              <Button type="button" variant="sun" size="lg" onClick={submit} disabled={submitting} autoFocus>
                {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Envoi en cours…</> : <><Send className="h-5 w-5" /> ENVOYER MA CANDIDATURE</>}
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn('flex gap-3', step === 5 ? 'flex-col-reverse sm:flex-row sm:items-center sm:justify-between' : 'items-center justify-between')}>
            {step > 0 ? (
              <Button type="button" variant="outline" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" /> Précédent
              </Button>
            ) : (
              <span />
            )}
            {step < 5 ? (
              <Button type="submit" size="lg">
                Suivant <ArrowRight className="h-5 w-5" />
              </Button>
            ) : (
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                <Send className="h-5 w-5" /> ENVOYER MA CANDIDATURE
              </Button>
            )}
          </div>
        )}
        <p className="text-center text-xs text-ink/45">Vos réponses sont enregistrées automatiquement sur cet appareil.</p>
      </form>
    </div>
  );
}

function Counter({ n }: { n: number }) {
  return (
    <span className={cn('tabular-nums', n > 0 && n < 20 ? 'text-amber-700' : '')}>
      {n < 20 ? `Au moins 20 caractères (${n}/20)` : `${n} caractères`}
    </span>
  );
}

function ChoiceGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
  required,
  columns = 1,
}: {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  columns?: 1 | 2 | 3;
}) {
  return (
    <fieldset aria-describedby={error ? `f-${name}-error` : undefined}>
      <legend className="text-[15px] font-semibold">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : <span className="ml-1.5 text-xs font-normal text-ink/45">facultatif</span>}
      </legend>
      <div className={cn('mt-3 grid gap-2.5', columns === 2 && 'sm:grid-cols-2', columns === 3 && 'grid-cols-1 sm:grid-cols-3')}>
        {options.map((o, i) => {
          const checked = value === o.value;
          return (
            <label key={o.value} className={cn('flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors', checked ? 'border-brand bg-brand-50 ring-1 ring-brand' : error ? 'border-red-300' : 'border-ink/12 hover:border-ink/30')}>
              <input
                type="radio"
                id={i === 0 ? `f-${name}` : undefined}
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                onClick={() => !required && checked && onChange('')}
                className="h-5 w-5 shrink-0 accent-[#078D43]"
              />
              <span className="text-[15px] font-medium">{o.label}</span>
            </label>
          );
        })}
      </div>
      {error && <p id={`f-${name}-error`} role="alert" className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </fieldset>
  );
}

function YesNo({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (v: string) => void }) {
  return (
    <ChoiceGroup label={label} name={name} options={[{ value: 'oui', label: 'Oui' }, { value: 'non', label: 'Non' }]} value={value} onChange={onChange} columns={2} />
  );
}
