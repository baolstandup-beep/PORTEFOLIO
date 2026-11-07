import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Gift, ShieldCheck } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { buttonClass } from '@/components/ui';
import { applicationsClosed } from '@/lib/env';
import { ApplicationForm } from './application-form';

export const metadata: Metadata = { title: 'Formulaire de candidature' };
export const dynamic = 'force-dynamic';

export default function CandidaterPage() {
  const closed = applicationsClosed();
  return (
    <>
      <SiteHeader cta={false} />
      <main className="bg-gradient-to-b from-mist to-white">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
          <header className="hero-in mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Candidature · GRAPHIA</p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Rejoignez les 50 talents de GRAPHIA</h1>
            <ul className="mt-5 flex flex-wrap gap-2 text-sm">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium shadow-sm ring-1 ring-ink/5"><Clock className="h-4 w-4 text-brand" /> Environ 10 minutes</li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium shadow-sm ring-1 ring-ink/5"><Gift className="h-4 w-4 text-brand" /> 80 % gratuit</li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 font-medium shadow-sm ring-1 ring-ink/5"><ShieldCheck className="h-4 w-4 text-brand" /> Données protégées</li>
            </ul>
          </header>
          {closed ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-card">
              <h2 className="text-2xl font-bold">Les candidatures sont closes</h2>
              <p className="mt-2 text-ink/70">Merci de votre intérêt. Les candidats retenus seront contactés par téléphone ou WhatsApp.</p>
              <Link href="/" className={buttonClass('primary', 'md', 'mt-6')}>Retour à l’accueil</Link>
            </div>
          ) : (
            <ApplicationForm />
          )}
        </div>
      </main>
    </>
  );
}
