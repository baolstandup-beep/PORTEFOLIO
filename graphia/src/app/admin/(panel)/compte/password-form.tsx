'use client';

import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Button, Field, Input } from '@/components/ui';

export function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get('next') !== fd.get('confirm')) {
      setMsg({ ok: false, text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current: fd.get('current'), next: fd.get('next') }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    if (res?.ok) {
      form.reset();
      setMsg({ ok: true, text: 'Mot de passe changé. Vos autres sessions ont été fermées.' });
    } else {
      setMsg({ ok: false, text: data.error ?? 'Modification impossible.' });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field id="current" label="Mot de passe actuel" required>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field id="next" label="Nouveau mot de passe" required hint="12 caractères minimum">
        <Input id="next" name="next" type="password" autoComplete="new-password" minLength={12} required />
      </Field>
      <Field id="confirm" label="Confirmer le nouveau mot de passe" required>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      </Field>
      {msg && <p role={msg.ok ? 'status' : 'alert'} className={`rounded-xl p-3 text-sm ${msg.ok ? 'bg-brand-50 text-brand-dark' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}
      <Button type="submit" disabled={busy} className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer
      </Button>
    </form>
  );
}
