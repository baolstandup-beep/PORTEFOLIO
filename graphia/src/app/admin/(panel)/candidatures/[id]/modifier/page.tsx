import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAdminPage } from '@/lib/auth';
import { candidateToValues } from '@/lib/candidate-values';
import { getCandidate } from '@/lib/candidates';
import { EditForm } from './edit-form';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage('edit');
  const { id } = await params;
  const c = await getCandidate(id);
  if (!c) notFound();
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/admin/candidatures/${id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Retour à la candidature
      </Link>
      <h1 className="text-2xl font-extrabold">Modifier · {c.application_number}</h1>
      <EditForm id={id} initial={candidateToValues(c)} />
    </div>
  );
}
