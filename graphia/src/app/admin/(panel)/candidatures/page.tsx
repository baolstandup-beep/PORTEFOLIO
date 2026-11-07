import Link from 'next/link';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, FileText, Printer, Search, X } from 'lucide-react';
import { StatusBadge } from '@/components/admin/status-badge';
import { buttonClass, Card, Input, Select } from '@/components/ui';
import { can, requireAdminPage } from '@/lib/auth';
import { filterOptions, listCandidates } from '@/lib/candidates';
import { LEVELS, PROFILES, STATUSES, labelOf } from '@/lib/constants';
import { formatPhone } from '@/lib/phone';
import { cn } from '@/lib/utils';

type SP = Record<string, string | undefined>;

const COLUMNS = [
  { key: 'numero', label: 'N°' },
  { key: 'nom', label: 'Nom complet' },
  { key: null, label: 'Téléphone' },
  { key: 'ville', label: 'Ville' },
  { key: null, label: 'Profil' },
  { key: null, label: 'Niveau' },
  { key: 'score', label: 'Score' },
  { key: 'date', label: 'Inscription' },
  { key: 'statut', label: 'Statut' },
] as const;

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const admin = await requireAdminPage();
  const sp = await searchParams;
  const filters = {
    q: sp.q,
    city: sp.ville,
    profile: sp.profil,
    level: sp.niveau,
    status: STATUSES.some((s) => s.value === sp.statut) ? sp.statut : undefined,
    sort: sp.tri,
    dir: sp.ordre,
    page: Number(sp.page) || 1,
  };
  const [data, opts] = await Promise.all([listCandidates(filters), filterOptions()]);
  const active = Boolean(sp.q || sp.ville || sp.profil || sp.niveau || sp.statut);

  const qs = (patch: SP) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...patch })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `?${s}` : '';
  };
  const exportQs = (format: string) => {
    const p = new URLSearchParams({ format });
    for (const k of ['q', 'ville', 'profil', 'niveau', 'statut', 'tri', 'ordre']) if (sp[k]) p.set(k, sp[k]!);
    return `/api/admin/export?${p}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Candidatures</h1>
          <p className="text-ink/60">{data.total} résultat{data.total > 1 ? 's' : ''}{active ? ' avec ces filtres' : ''}</p>
        </div>
        {can(admin, 'export') && (
          <div className="flex flex-wrap gap-2">
            <a href={exportQs('xlsx')} className={buttonClass('outline', 'sm')}><FileSpreadsheet className="h-4 w-4 text-brand" /> Excel</a>
            <a href={exportQs('pdf')} className={buttonClass('outline', 'sm')}><FileText className="h-4 w-4 text-red-600" /> PDF</a>
          </div>
        )}
      </div>

      <Card className="p-4 sm:p-5">
        <form method="get" className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_repeat(4,1fr)_auto]">
          <label className="relative">
            <span className="sr-only">Rechercher</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
            <Input name="q" defaultValue={sp.q} placeholder="Nom, téléphone, n°, e-mail…" className="h-11 pl-10" />
          </label>
          <Select name="ville" defaultValue={sp.ville ?? ''} className="h-11" aria-label="Ville">
            <option value="">Toutes les villes</option>
            {opts.cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select name="profil" defaultValue={sp.profil ?? ''} className="h-11" aria-label="Profil">
            <option value="">Tous les profils</option>
            {PROFILES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          <Select name="niveau" defaultValue={sp.niveau ?? ''} className="h-11" aria-label="Niveau">
            <option value="">Tous niveaux</option>
            {LEVELS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          <Select name="statut" defaultValue={sp.statut ?? ''} className="h-11" aria-label="Statut">
            <option value="">Tous statuts</option>
            {STATUSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </Select>
          {sp.tri && <input type="hidden" name="tri" value={sp.tri} />}
          {sp.ordre && <input type="hidden" name="ordre" value={sp.ordre} />}
          <div className="flex gap-2">
            <button type="submit" className={buttonClass('primary', 'md', 'h-11 flex-1')}>Filtrer</button>
            {active && (
              <Link href="/admin/candidatures" className={buttonClass('ghost', 'md', 'h-11 px-3')} aria-label="Effacer les filtres"><X className="h-4 w-4" /></Link>
            )}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        {data.rows.length === 0 ? (
          <p className="p-10 text-center text-ink/60">Aucune candidature ne correspond.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-mist text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  {COLUMNS.map((col) => {
                    const isSorted = (sp.tri ?? 'date') === col.key;
                    const nextDir = isSorted && (sp.ordre ?? (col.key === 'date' ? 'desc' : 'asc')) === 'asc' ? 'desc' : 'asc';
                    return (
                      <th key={col.label} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                        {col.key ? (
                          <Link href={qs({ tri: col.key, ordre: nextDir, page: undefined })} className={cn('inline-flex items-center gap-1 hover:text-ink', isSorted && 'text-ink')}>
                            {col.label}
                            {isSorted && ((sp.ordre ?? (col.key === 'date' ? 'desc' : 'asc')) === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                          </Link>
                        ) : (
                          col.label
                        )}
                      </th>
                    );
                  })}
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {data.rows.map((c) => (
                  <tr key={c.id} className="hover:bg-mist/50">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{c.application_number}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/candidatures/${c.id}`} className="font-semibold hover:text-brand">
                        {c.last_name.toUpperCase()} {c.first_name}
                      </Link>
                      {!c.available_five_days && <span className="ml-2 text-xs font-semibold text-amber-700" title="Non disponible les 5 jours">indispo.</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <a href={`tel:+${c.phone_normalized}`} className="hover:text-brand">{formatPhone(c.phone_normalized)}</a>
                    </td>
                    <td className="px-4 py-3">{c.city}</td>
                    <td className="px-4 py-3">{labelOf(PROFILES, c.professional_profile)}</td>
                    <td className="px-4 py-3">{labelOf(LEVELS, c.experience_level)}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{c.selection_score ?? <span className="text-ink/35">—</span>}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-ink/70">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Dakar' }).format(c.created_at)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/candidatures/${c.id}`} className={buttonClass('ghost', 'sm', 'px-2.5')} title="Consulter"><Eye className="h-4 w-4" /></Link>
                        <Link href={`/admin/fiche/${c.id}`} target="_blank" className={buttonClass('ghost', 'sm', 'px-2.5')} title="Imprimer la fiche"><Printer className="h-4 w-4" /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {data.pages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          {data.page > 1 && <Link href={qs({ page: String(data.page - 1) })} className={buttonClass('outline', 'sm')}><ChevronLeft className="h-4 w-4" /> Précédente</Link>}
          <span className="px-3 text-sm text-ink/60">Page {data.page} sur {data.pages}</span>
          {data.page < data.pages && <Link href={qs({ page: String(data.page + 1) })} className={buttonClass('outline', 'sm')}>Suivante <ChevronRight className="h-4 w-4" /></Link>}
        </nav>
      )}
    </div>
  );
}
