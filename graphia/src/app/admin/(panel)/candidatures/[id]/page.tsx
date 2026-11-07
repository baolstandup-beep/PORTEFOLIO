import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, ImageIcon, MessageCircle, Pencil, Phone, Printer } from 'lucide-react';
import { DeleteButton, NotifyPanel, ScorePanel, StatusControl } from '@/components/admin/actions';
import { StatusBadge } from '@/components/admin/status-badge';
import { RecapList } from '@/components/recap';
import { buttonClass, Card } from '@/components/ui';
import { can, requireAdminPage } from '@/lib/auth';
import { candidateToValues } from '@/lib/candidate-values';
import { getAttachments, getCandidate, getNotifications, getStats } from '@/lib/candidates';
import { autoNotifyEnabled, emailConfigured, NOTIFICATION_LABELS, whatsappConfigured, type NotificationType } from '@/lib/notifications';
import { formatPhone } from '@/lib/phone';
import { formatDate } from '@/lib/utils';

const NOTIF_STATUS: Record<string, string> = { sent: 'Envoyé', failed: 'Échec', not_configured: 'Non envoyé (service non configuré)', skipped: 'Ignoré' };

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPage();
  const { id } = await params;
  const c = await getCandidate(id);
  if (!c) notFound();
  const [files, notifs, stats] = await Promise.all([getAttachments(id), getNotifications(id), getStats()]);
  const name = `${c.first_name} ${c.last_name}`;
  const wa = c.whatsapp || c.phone_normalized;

  return (
    <div className="space-y-6">
      <Link href="/admin/candidatures" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/60 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Toutes les candidatures
      </Link>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-ink px-2.5 py-1 font-mono text-xs font-bold text-sun">{c.application_number}</span>
              <StatusBadge status={c.status} />
              {c.selection_score !== null && <span className="text-sm font-semibold text-ink/70">Score {c.selection_score}/25</span>}
            </div>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">{name}</h1>
            <p className="mt-1 text-sm text-ink/55">
              Inscrit le {formatDate(c.created_at)} · {c.city}
              {c.updated_at.getTime() - c.created_at.getTime() > 1000 && <> · modifié le {formatDate(c.updated_at)}</>}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`tel:+${c.phone_normalized}`} className={buttonClass('outline', 'sm')}><Phone className="h-4 w-4" /> {formatPhone(c.phone_normalized)}</a>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'sm')}><MessageCircle className="h-4 w-4 text-brand" /> WhatsApp</a>
            <Link href={`/admin/fiche/${c.id}`} target="_blank" className={buttonClass('outline', 'sm')}><Printer className="h-4 w-4" /> Fiche</Link>
            {can(admin, 'edit') && <Link href={`/admin/candidatures/${c.id}/modifier`} className={buttonClass('outline', 'sm')}><Pencil className="h-4 w-4" /> Modifier</Link>}
            {can(admin, 'delete') && <DeleteButton id={c.id} name={name} />}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <RecapList values={candidateToValues(c)} />
          </Card>

          {files.length > 0 && (
            <Card className="p-5 sm:p-6">
              <h2 className="mb-3 font-bold text-brand">Réalisations jointes</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {files.map((f) => (
                  <li key={f.id}>
                    <a href={`/api/admin/attachments/${f.id}`} target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl border border-ink/10 px-4 py-3 text-sm hover:border-brand">
                      {f.mime_type === 'application/pdf' ? <FileText className="h-5 w-5 text-red-600" /> : <ImageIcon className="h-5 w-5 text-brand" />}
                      <span className="min-w-0 flex-1 truncate font-medium">{f.file_name}</span>
                      <span className="text-ink/45">{Math.round(f.size_bytes / 1024)} Ko</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card className="p-5 sm:p-6">
            <h2 className="mb-3 font-bold text-brand">Historique des notifications</h2>
            {notifs.length === 0 ? (
              <p className="text-sm text-ink/55">Aucune notification.</p>
            ) : (
              <ul className="divide-y divide-ink/6 text-sm">
                {notifs.map((n) => (
                  <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span>
                      <strong>{NOTIFICATION_LABELS[n.notification_type as NotificationType] ?? n.notification_type}</strong>
                      <span className="text-ink/55"> · {n.channel === 'email' ? 'E-mail' : 'WhatsApp'}{n.sent_by_name ? ` · par ${n.sent_by_name}` : ''}</span>
                    </span>
                    <span className={n.status === 'sent' ? 'font-semibold text-brand' : n.status === 'failed' ? 'font-semibold text-red-700' : 'text-ink/55'} title={n.error ?? undefined}>
                      {NOTIF_STATUS[n.status] ?? n.status} · {formatDate(n.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 font-bold">Décision</h2>
            <StatusControl id={c.id} status={c.status} canEdit={can(admin, 'status')} retenus={stats.retenu} max={stats.max} autoNotify={autoNotifyEnabled()} />
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 font-bold">Évaluation</h2>
            <ScorePanel id={c.id} initial={c.score_details} notes={c.admin_notes} />
          </Card>
          {can(admin, 'notify') && (
            <Card className="p-5">
              <h2 className="mb-3 font-bold">Notifier le candidat</h2>
              <NotifyPanel id={c.id} status={c.status} configured={{ email: emailConfigured() && Boolean(c.email), whatsapp: whatsappConfigured() }} />
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
