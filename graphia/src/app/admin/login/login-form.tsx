'use client';

import { useState } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Button, Field, Input } from '@/components/ui';

export function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
      });
      if (res.ok) {
        window.location.assign('/admin');
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Connexion impossible.');
    } catch {
      setError('Connexion au serveur impossible. Vérifiez votre réseau.');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-5">
      <Field id="email" label="Adresse e-mail" required>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </Field>
      <Field id="password" label="Mot de passe" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Se connecter
      </Button>
    </form>
  );
}
