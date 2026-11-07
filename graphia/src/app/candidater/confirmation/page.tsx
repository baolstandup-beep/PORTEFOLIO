import type { Metadata } from 'next';
import { SiteHeader } from '@/components/site-header';
import { ConfirmationView } from './view';

export const metadata: Metadata = { title: 'Candidature enregistrée', robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <>
      <SiteHeader cta={false} />
      <main className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
          <ConfirmationView />
        </div>
      </main>
    </>
  );
}
