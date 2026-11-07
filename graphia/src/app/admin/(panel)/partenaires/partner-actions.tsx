'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { Button, Select, Textarea } from '@/components/ui';
import { PARTNER_STATUSES } from '@/lib/partners';

export function PartnerActions({ id, status, notes, canEdit, canDelete }: { id: string; status: string; notes: string; canEdit: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [s, setS] = useState(status);
  const [n, setN] = useState(notes);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  if (!canEdit) return null;

  async function save() {
    setBusy(true);
    setMsg('');
    const res = await fetch(`/api/admin/partners/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s, admin_notes: n }) }).catch(() => null);
    setMsg(res?.ok ? 'Enregistré.' : 'Échec de l’enregistrement.');
    setBusy(false);
    router.refresh();
  }
  async function del() {
    if (!window.confirm('Supprimer définitivement cette demande de partenariat ?')) return;
    const res = await fetch(`/api/admin/partners/${id}`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) router.refresh();
    else setMsg('Suppression impossible.');
  }

  return (
    <div className="space-y-2 border-t border-ink/8 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={s} onChange={(e) => setS(e.target.value)} className="h-10 w-auto text-sm" aria-label="Statut">
          {PARTNER_STATUSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Button type="button" size="sm" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer</Button>
        {canDelete && <Button type="button" size="sm" variant="ghost" className="text-red-700" onClick={del}><Trash2 className="h-4 w-4" /> Supprimer</Button>}
        {msg && <span className="text-sm text-ink/60">{msg}</span>}
      </div>
      <Textarea value={n} onChange={(e) => setN(e.target.value)} rows={2} className="min-h-16 text-sm" placeholder="Notes internes (montant convenu, suite à donner…)" maxLength={4000} />
    </div>
  );
}
