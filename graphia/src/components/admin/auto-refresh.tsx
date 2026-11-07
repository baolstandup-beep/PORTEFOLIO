'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

/** Recharge les données du serveur toutes les 30 s tant que l'onglet est visible. */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  const [at, setAt] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') {
        router.refresh();
        setAt(new Date());
      }
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return (
    <button
      type="button"
      onClick={() => { router.refresh(); setAt(new Date()); }}
      className="inline-flex items-center gap-1.5 text-xs text-ink/55 hover:text-ink"
      title="Actualiser maintenant"
    >
      <RefreshCw className="h-3.5 w-3.5" /> Mis à jour à {at.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · actualisation auto toutes les {seconds} s
    </button>
  );
}
