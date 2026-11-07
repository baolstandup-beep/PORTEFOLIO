'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CheckCircle2, Home, Info, Printer } from 'lucide-react';
import { Logo } from '@/components/logo';
import { RecapList, type RecapValues } from '@/components/recap';
import { Button, buttonClass } from '@/components/ui';
import { formatDate } from '@/lib/utils';

type Result = { applicationNumber: string; createdAt: string; firstName: string; lastName: string; recap?: RecapValues };

export function ConfirmationView() {
  const [data, setData] = useState<Result | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('graphia_confirmation');
      setData(raw ? (JSON.parse(raw) as Result) : null);
    } catch {
      setData(null);
    }
  }, []);

  if (data === undefined) return null;

  if (data === null) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-card">
        <h1 className="text-2xl font-bold">Aucune candidature récente sur cet appareil</h1>
        <p className="mt-2 text-ink/70">Si vous avez déjà envoyé votre candidature, elle est bien enregistrée : gardez votre numéro de candidature.</p>
        <Link href="/" className={buttonClass('primary', 'md', 'mt-6')}>Retour à l’accueil</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="animate-rise overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="bg-brand px-6 py-8 text-center text-white sm:px-10 sm:py-10">
          <CheckCircle2 className="mx-auto h-14 w-14 text-sun" aria-hidden />
          <h1 className="mt-4 text-2xl font-black uppercase leading-tight sm:text-3xl">Félicitations ! Votre candidature a bien été enregistrée.</h1>
        </div>
        <div className="space-y-6 p-6 sm:p-10">
          <p className="text-[15px] leading-relaxed text-ink/80 sm:text-base">
            Merci de votre intérêt pour GRAPHIA 2026. Votre candidature sera étudiée par notre équipe de sélection.
            Les candidats retenus seront contactés par téléphone ou WhatsApp.
          </p>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-ink p-4 text-white sm:col-span-3 sm:flex sm:items-center sm:justify-between">
              <dt className="text-sm text-white/70">Numéro de candidature</dt>
              <dd className="mt-1 font-mono text-2xl font-bold tracking-wider text-sun sm:mt-0">{data.applicationNumber}</dd>
            </div>
            <div className="rounded-2xl bg-mist p-4 sm:col-span-2">
              <dt className="text-sm text-ink/55">Candidat</dt>
              <dd className="mt-1 font-semibold">{data.firstName} {data.lastName}</dd>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <dt className="text-sm text-ink/55">Enregistrée le</dt>
              <dd className="mt-1 font-semibold">{formatDate(data.createdAt)}</dd>
            </div>
          </dl>
          <p className="flex gap-3 rounded-2xl bg-sun/40 p-4 text-[15px]">
            <Info className="mt-0.5 h-5 w-5 shrink-0" />
            <span><strong>Important :</strong> l’envoi du formulaire ne signifie pas que vous êtes automatiquement sélectionné. Notez votre numéro de candidature.</span>
          </p>
          <div className="no-print flex flex-col gap-3 sm:flex-row">
            <Button type="button" variant="dark" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Imprimer ou enregistrer en PDF
            </Button>
            <Link href="/" className={buttonClass('outline')}>
              <Home className="h-4 w-4" /> Retour à l’accueil
            </Link>
          </div>
        </div>
      </div>

      {data.recap && (
        <section>
          <div className="mb-4 hidden items-center justify-between print:flex">
            <Logo className="text-2xl" />
            <span className="text-sm">Récapitulatif de candidature · {data.applicationNumber}</span>
          </div>
          <h2 className="mb-4 text-xl font-bold">Récapitulatif de vos réponses</h2>
          <RecapList values={data.recap} />
        </section>
      )}
    </div>
  );
}
