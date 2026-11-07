import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Badge, buttonClass, Card } from '@/components/ui';
import { can, requireAdminPage } from '@/lib/auth';
import { query } from '@/lib/db';
import { PACKS, PARTNER_STATUSES, PARTNER_TYPES } from '@/lib/partners';
import { formatPhone } from '@/lib/phone';
import { formatDate } from '@/lib/utils';
import { PartnerActions } from './partner-actions';

type Row = {
  id: string; organization: string; contact_name: string; contact_role: string | null; phone: string; email: string | null;
  partner_type: string; pack: string | null; message: string | null; status: string; admin_notes: string | null; created_at: Date;
};

export default async function PartnersAdminPage() {
  const admin = await requireAdminPage();
  const { rows } = await query<Row>('SELECT * FROM partner_requests ORDER BY created_at DESC LIMIT 500');
  const label = (list: readonly { value: string; label?: string; name?: string }[], v: string | null) => {
    const o = list.find((x) => x.value === v);
    return o ? (o.label ?? o.name ?? v) : v === 'a_definir' ? 'À définir' : '—';
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Demandes de partenariat</h1>
        <p className="text-ink/60">{rows.length} demande{rows.length > 1 ? 's' : ''} reçue{rows.length > 1 ? 's' : ''} depuis la page « Devenir partenaire ».</p>
      </div>
      {rows.length === 0 ? (
        <Card className="p-10 text-center text-ink/60">Aucune demande pour le moment. Partagez le lien : /partenaires</Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((r) => {
            const st = PARTNER_STATUSES.find((s) => s.value === r.status);
            return (
              <Card key={r.id} className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold">{r.organization}</h2>
                    <p className="text-sm text-ink/60">{r.contact_name}{r.contact_role ? ` · ${r.contact_role}` : ''} · {formatDate(r.created_at)}</p>
                  </div>
                  <Badge tone={st?.tone ?? 'neutral'}>{st?.label ?? r.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge tone="success">{label(PARTNER_TYPES, r.partner_type)}</Badge>
                  <Badge tone="neutral">{label(PACKS, r.pack)}</Badge>
                </div>
                {r.message && <p className="whitespace-pre-line rounded-xl bg-mist p-3 text-sm">{r.message}</p>}
                <div className="flex flex-wrap gap-2">
                  <a href={`tel:+${r.phone}`} className={buttonClass('outline', 'sm')}><Phone className="h-4 w-4" /> {formatPhone(r.phone)}</a>
                  <a href={`https://wa.me/${r.phone}`} target="_blank" rel="noopener noreferrer" className={buttonClass('outline', 'sm')}><MessageCircle className="h-4 w-4 text-brand" /> WhatsApp</a>
                  {r.email && <a href={`mailto:${r.email}`} className={buttonClass('outline', 'sm')}><Mail className="h-4 w-4" /> {r.email}</a>}
                </div>
                <PartnerActions id={r.id} status={r.status} notes={r.admin_notes ?? ''} canEdit={can(admin, 'edit')} canDelete={can(admin, 'delete')} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
