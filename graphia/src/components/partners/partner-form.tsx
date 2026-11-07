'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button, Field, Input, Select, Textarea } from '@/components/ui';
import { PACKS, PARTNER_TYPES } from '@/lib/partners';

type Errors = Partial<Record<string, string>>;

export function PartnerForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/partenaires', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) { setDone(true); setBusy(false); return; }
    setErrors(data.fields ?? {});
    setError(data.error ?? 'Envoi impossible. Vérifiez votre connexion et réessayez.');
    setBusy(false);
  }

  if (done) {
    return (
      <div className="animate-rise rounded-3xl bg-brand-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand" />
        <p className="mt-3 text-xl font-bold">Merci ! Votre demande de partenariat est bien enregistrée.</p>
        <p className="mt-2 text-ink/70">L’équipe GRAPHIA de Baol Up Graphic vous recontactera rapidement pour en discuter.</p>
      </div>
    );
  }

  const err = (k: string) => errors[k];
  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div aria-hidden className="absolute -left-[9999px]"><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="p-org" label="Structure / entreprise" required error={err('organization')}>
          <Input id="p-org" name="organization" invalid={Boolean(err('organization'))} autoComplete="organization" />
        </Field>
        <Field id="p-name" label="Nom du contact" required error={err('contact_name')}>
          <Input id="p-name" name="contact_name" invalid={Boolean(err('contact_name'))} autoComplete="name" />
        </Field>
        <Field id="p-role" label="Fonction" error={err('contact_role')}>
          <Input id="p-role" name="contact_role" autoComplete="organization-title" />
        </Field>
        <Field id="p-phone" label="Téléphone / WhatsApp" required error={err('phone')}>
          <Input id="p-phone" name="phone" type="tel" inputMode="tel" invalid={Boolean(err('phone'))} autoComplete="tel" />
        </Field>
        <Field id="p-email" label="E-mail" error={err('email')} className="sm:col-span-2">
          <Input id="p-email" name="email" type="email" inputMode="email" invalid={Boolean(err('email'))} autoComplete="email" />
        </Field>
        <Field id="p-type" label="Type de partenariat" required error={err('partner_type')}>
          <Select id="p-type" name="partner_type" defaultValue="" invalid={Boolean(err('partner_type'))}>
            <option value="" disabled>Choisir…</option>
            {PARTNER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </Field>
        <Field id="p-pack" label="Offre envisagée" error={err('pack')}>
          <Select id="p-pack" name="pack" defaultValue="a_definir">
            <option value="a_definir">À définir ensemble</option>
            {PACKS.map((p) => <option key={p.value} value={p.value}>{p.name} — {p.amount}</option>)}
          </Select>
        </Field>
      </div>
      <Field id="p-msg" label="Votre message" hint="Ce que vous souhaitez apporter, vos attentes, vos questions." error={err('message')}>
        <Textarea id="p-msg" name="message" rows={4} maxLength={2000} />
      </Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      <Button type="submit" size="lg" disabled={busy} className="btn-shine w-full sm:w-auto">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Envoyer ma demande
      </Button>
    </form>
  );
}
