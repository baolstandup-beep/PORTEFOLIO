'use client';

import { buttonClass } from '@/components/ui';

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">Une erreur est survenue</h1>
      <p className="max-w-md text-ink/70">Le serveur n’a pas pu répondre. Vérifiez votre connexion puis réessayez.</p>
      <button type="button" onClick={reset} className={buttonClass('primary')}>Réessayer</button>
    </main>
  );
}
