import { notFound } from 'next/navigation';
import { Logo } from '@/components/logo';
import { RecapList } from '@/components/recap';
import { PrintButton } from '@/components/admin/print-button';
import { requireAdminPage } from '@/lib/auth';
import { candidateToValues } from '@/lib/candidate-values';
import { getCandidate } from '@/lib/candidates';
import { SCORE_CRITERIA, STATUSES, labelOf } from '@/lib/constants';
import { formatPhone } from '@/lib/phone';
import { formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Fiche candidat', robots: { index: false, follow: false } };

export default async function FichePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const c = await getCandidate(id);
  if (!c) notFound();
  return (
    <main className="mx-auto max-w-3xl bg-white px-4 py-8 text-[14px] sm:px-8">
      <div className="no-print mb-6 flex justify-end">
        <PrintButton />
      </div>
      <header className="mb-6 flex items-start justify-between gap-4 border-b-4 border-brand pb-4">
        <div>
          <Logo className="text-3xl" />
          <p className="mt-2 text-xs uppercase tracking-wider text-ink/55">Fiche de candidature · document confidentiel</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold">{c.application_number}</p>
          <p className="text-xs text-ink/55">Inscrit le {formatDate(c.created_at)}</p>
        </div>
      </header>
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Info label="Candidat" value={`${c.first_name} ${c.last_name}`} wide />
        <Info label="Téléphone" value={formatPhone(c.phone_normalized)} />
        <Info label="Statut" value={labelOf(STATUSES, c.status)} />
        {SCORE_CRITERIA.map((s) => (
          <Info key={s.key} label={s.label} value={c.score_details?.[s.key] != null ? `${c.score_details[s.key]} / 5` : '—'} />
        ))}
        <Info label="Score total" value={c.selection_score != null ? `${c.selection_score} / 25` : '—'} />
      </section>
      <RecapList values={candidateToValues(c)} />
      {c.admin_notes && (
        <section className="print-break mt-5 rounded-2xl border border-ink/10 p-4">
          <h3 className="mb-2 font-bold text-brand">Notes internes</h3>
          <p className="whitespace-pre-line">{c.admin_notes}</p>
        </section>
      )}
      <p className="mt-8 text-center text-xs text-ink/45">Imprimé le {formatDate(new Date())} · GRAPHIA · Baol Up Graphic</p>
    </main>
  );
}

function Info({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-xl bg-mist p-3 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[11px] uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
