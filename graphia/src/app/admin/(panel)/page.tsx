import Link from 'next/link';
import { AlertTriangle, ArrowRight, CalendarCheck, Clock, Inbox, Mail, MessageCircle, UserCheck, UserX, Users, Armchair } from 'lucide-react';
import { AutoRefresh } from '@/components/admin/auto-refresh';
import { StatusBadge } from '@/components/admin/status-badge';
import { Card } from '@/components/ui';
import { requireAdminPage } from '@/lib/auth';
import { getStats, listCandidates } from '@/lib/candidates';
import { PROFILES, labelOf } from '@/lib/constants';
import { emailConfigured, whatsappConfigured } from '@/lib/notifications';
import { formatDate } from '@/lib/utils';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ refus?: string }> }) {
  const admin = await requireAdminPage();
  const sp = await searchParams;
  const [stats, latest] = await Promise.all([getStats(), listCandidates({ perPage: 8 })]);
  const pct = Math.round((stats.retenu / stats.max) * 100);
  const mail = emailConfigured();
  const wa = whatsappConfigured();

  const cards = [
    { label: 'Candidatures reçues', value: stats.total, icon: Inbox, href: '/admin/candidatures' },
    { label: "Reçues aujourd'hui", value: stats.today, icon: CalendarCheck, href: '/admin/candidatures?tri=date' },
    { label: 'En attente', value: stats.en_attente, icon: Clock, href: '/admin/candidatures?statut=en_attente' },
    { label: 'Présélectionnées', value: stats.preselectionne, icon: Users, href: '/admin/candidatures?statut=preselectionne' },
    { label: 'Retenues', value: stats.retenu, icon: UserCheck, href: '/admin/candidatures?statut=retenu' },
    { label: 'Non retenues', value: stats.non_retenu, icon: UserX, href: '/admin/candidatures?statut=non_retenu' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Bonjour {admin.name.split(' ')[0]}</h1>
          <p className="text-ink/60">Suivi des candidatures GRAPHIA</p>
        </div>
        <AutoRefresh />
      </div>

      {sp.refus && (
        <p className="flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="h-4 w-4" /> Votre rôle ne permet pas d’accéder à cette page.
        </p>
      )}

      {/* Compteur de places */}
      <Card data-reveal="scale" className="overflow-hidden">
        <div className="grid gap-6 bg-ink p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-sun">Participants retenus</p>
            <p className="mt-2 text-5xl font-black tabular-nums sm:text-6xl">
              {stats.retenu}
              <span className="text-2xl text-white/50 sm:text-3xl"> / {stats.max}</span>
            </p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuenow={stats.retenu} aria-valuemin={0} aria-valuemax={stats.max} aria-label="Places attribuées">
              <div className="h-full rounded-full bg-sun transition-[width]" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-white/10 px-6 py-5">
            <Armchair className="h-9 w-9 text-sun" />
            <div>
              <p className="text-3xl font-black tabular-nums">{stats.places}</p>
              <p className="text-sm text-white/70">place{stats.places > 1 ? 's' : ''} disponible{stats.places > 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} data-reveal="up" style={{ ['--d' as string]: cards.indexOf(c) * 60 }} className="group rounded-2xl border border-ink/8 bg-white p-4 shadow-card transition-transform hover:-translate-y-0.5 sm:p-5">
            <c.icon className="h-5 w-5 text-brand" />
            <p className="mt-3 text-3xl font-black tabular-nums">{c.value}</p>
            <p className="mt-1 text-sm text-ink/60">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Dernières candidatures</h2>
            <Link href="/admin/candidatures" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {latest.rows.length === 0 ? (
            <p className="rounded-xl bg-mist p-6 text-center text-sm text-ink/60">Aucune candidature pour le moment. Partagez le lien du formulaire : /candidater</p>
          ) : (
            <ul className="divide-y divide-ink/8">
              {latest.rows.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/candidatures/${c.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-mist/60">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.first_name} {c.last_name}</p>
                      <p className="truncate text-sm text-ink/55">{c.application_number} · {c.city} · {labelOf(PROFILES, c.professional_profile)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={c.status} />
                      <p className="mt-1 text-xs text-ink/45">{formatDate(c.created_at)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-bold">Répartition</h2>
            <Breakdown title="Par ville" items={stats.byCity} total={stats.total} />
            <Breakdown title="Par profil" items={stats.byProfile.map((x) => ({ ...x, label: labelOf(PROFILES, x.label) }))} total={stats.total} />
            <p className="mt-4 text-sm text-ink/55">{stats.scored} candidature(s) notée(s) sur {stats.total}.</p>
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="mb-3 text-lg font-bold">Notifications</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" /> E-mail (Resend)</span>
                <span className={mail ? 'font-semibold text-brand' : 'font-semibold text-amber-700'}>{mail ? 'Configuré' : 'Non configuré'}</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp Business</span>
                <span className={wa ? 'font-semibold text-brand' : 'font-semibold text-amber-700'}>{wa ? 'Configuré' : 'Non configuré'}</span>
              </li>
            </ul>
            {(!mail || !wa) && (
              <p className="mt-3 text-xs text-ink/55">Sans configuration, aucun message n’est envoyé : contactez les candidats manuellement. Voir le README, section « Notifications ».</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Breakdown({ title, items, total }: { title: string; items: { label: string; n: number }[]; total: number }) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/50">{title}</p>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label} className="text-sm">
            <div className="flex justify-between gap-2">
              <span className="truncate">{i.label}</span>
              <span className="font-semibold tabular-nums">{i.n}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-mist">
              <div className="h-full rounded-full bg-brand" style={{ width: `${total ? (i.n / total) * 100 : 0}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
