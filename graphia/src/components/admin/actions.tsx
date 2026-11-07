'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Loader2, Mail, MessageCircle, Save, Send, Trash2 } from 'lucide-react';
import { Button, Textarea } from '@/components/ui';
import { SCORE_CRITERIA, SCORE_MAX_PER_CRITERION, STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
  return data;
}

function Msg({ kind, text }: { kind: 'ok' | 'err'; text: string }) {
  return (
    <p role={kind === 'err' ? 'alert' : 'status'} className={cn('mt-3 flex gap-2 rounded-xl p-3 text-sm', kind === 'ok' ? 'bg-brand-50 text-brand-dark' : 'bg-red-50 text-red-700')}>
      {kind === 'ok' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />} {text}
    </p>
  );
}

export function StatusControl({ id, status, canEdit, retenus, max, autoNotify = false }: { id: string; status: string; canEdit: boolean; retenus: number; max: number; autoNotify?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const tones: Record<string, string> = {
    en_attente: 'border-ink/20 bg-mist text-ink',
    preselectionne: 'border-sky-400 bg-sky-50 text-sky-900',
    retenu: 'border-brand bg-brand text-white',
    non_retenu: 'border-red-400 bg-red-50 text-red-800',
  };
  async function change(s: string) {
    if (s === status) return;
    const label = STATUSES.find((x) => x.value === s)?.label ?? s;
    if (autoNotify && s !== 'en_attente' && !window.confirm(`Passer en « ${label} » ?\n\nLe candidat recevra automatiquement le message correspondant (WhatsApp / e-mail). Cette action ne peut pas être annulée.`)) return;
    setBusy(s);
    setMsg(null);
    try {
      const data = await call(`/api/admin/candidates/${id}/status`, 'POST', { status: s });
      setMsg({
        kind: 'ok',
        text: data.notified
          ? 'Statut mis à jour. Le message au candidat part automatiquement (résultat dans l’historique des notifications).'
          : 'Statut mis à jour. Aucun envoi automatique : contactez le candidat si nécessaire.',
      });
      router.refresh();
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    }
    setBusy(null);
  }
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={!canEdit || busy !== null}
            onClick={() => change(s.value)}
            aria-pressed={status === s.value}
            className={cn(
              'flex min-h-11 items-center justify-center gap-1.5 rounded-xl border-2 px-3 text-sm font-semibold transition-all disabled:cursor-not-allowed',
              status === s.value ? tones[s.value] : 'border-ink/10 bg-white text-ink/60 hover:border-ink/30',
              !canEdit && status !== s.value && 'opacity-50',
            )}
          >
            {busy === s.value && <Loader2 className="h-4 w-4 animate-spin" />} {s.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-ink/55">Places attribuées : <strong className="text-ink">{retenus} / {max}</strong></p>
      {!canEdit && <p className="mt-2 text-xs text-ink/55">Votre rôle (évaluateur) ne permet pas de changer le statut.</p>}
      {msg && <Msg {...msg} />}
    </div>
  );
}

export function ScorePanel({ id, initial, notes }: { id: string; initial: Record<string, number | null> | null; notes: string | null }) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number | null>>(
    Object.fromEntries(SCORE_CRITERIA.map((c) => [c.key, initial?.[c.key] ?? null])),
  );
  const [text, setText] = useState(notes ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const filled = Object.values(scores).filter((n): n is number => n !== null);
  const total = filled.length ? filled.reduce((a, b) => a + b, 0) : null;

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      await call(`/api/admin/candidates/${id}/score`, 'POST', { scores, admin_notes: text });
      setMsg({ kind: 'ok', text: 'Évaluation enregistrée.' });
      router.refresh();
    } catch (e) {
      setMsg({ kind: 'err', text: (e as Error).message });
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4">
      {SCORE_CRITERIA.map((c) => (
        <fieldset key={c.key}>
          <legend className="mb-1.5 text-sm font-semibold">{c.label}</legend>
          <div className="flex gap-1.5">
            {Array.from({ length: SCORE_MAX_PER_CRITERION + 1 }, (_, n) => (
              <button
                key={n}
                type="button"
                onClick={() => setScores((s) => ({ ...s, [c.key]: s[c.key] === n ? null : n }))}
                aria-pressed={scores[c.key] === n}
                aria-label={`${c.label} : ${n} sur ${SCORE_MAX_PER_CRITERION}`}
                className={cn(
                  'h-9 w-9 rounded-lg border text-sm font-bold transition-colors',
                  scores[c.key] === n ? 'border-brand bg-brand text-white' : 'border-ink/12 bg-white hover:border-ink/40',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      <div className="flex items-center justify-between rounded-xl bg-mist px-4 py-3">
        <span className="text-sm font-semibold">Score total</span>
        <span className="text-2xl font-black tabular-nums">{total ?? '—'}<span className="text-sm text-ink/45"> / 25</span></span>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Notes internes</span>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="min-h-24 text-sm" maxLength={4000} placeholder="Visibles uniquement par l’équipe" />
      </label>
      <Button type="button" onClick={save} disabled={busy} className="w-full">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer l’évaluation
      </Button>
      <p className="text-xs text-ink/50">Le score aide à classer les candidatures ; la décision finale reste humaine.</p>
      {msg && <Msg {...msg} />}
    </div>
  );
}

const NOTIF_FOR_STATUS: Record<string, { type: string; label: string } | undefined> = {
  preselectionne: { type: 'preselection', label: 'Notifier la présélection' },
  retenu: { type: 'selection', label: 'Notifier la sélection définitive' },
  non_retenu: { type: 'non_selection', label: 'Notifier la non-sélection' },
};

export function NotifyPanel({ id, status, configured }: { id: string; status: string; configured: { email: boolean; whatsapp: boolean } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ channel: string; status: string; error?: string }[] | null>(null);
  const [error, setError] = useState('');
  const action = NOTIF_FOR_STATUS[status];

  async function send(type: string) {
    if (!window.confirm('Envoyer ce message au candidat ?')) return;
    setBusy(true);
    setError('');
    setResults(null);
    try {
      const data = await call(`/api/admin/candidates/${id}/notify`, 'POST', { type });
      setResults(data.results);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  }

  const label: Record<string, string> = { sent: 'envoyé', failed: 'échec', not_configured: 'service non configuré', skipped: 'ignoré' };
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold', configured.email ? 'bg-brand-50 text-brand-dark' : 'bg-amber-50 text-amber-800')}>
          <Mail className="h-3.5 w-3.5" /> E-mail {configured.email ? 'actif' : 'non configuré'}
        </span>
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold', configured.whatsapp ? 'bg-brand-50 text-brand-dark' : 'bg-amber-50 text-amber-800')}>
          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp {configured.whatsapp ? 'actif' : 'non configuré'}
        </span>
      </div>
      {action ? (
        <Button type="button" variant="dark" className="w-full" onClick={() => send(action.type)} disabled={busy || (!configured.email && !configured.whatsapp)}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {action.label}
        </Button>
      ) : (
        <p className="text-sm text-ink/55">Changez le statut (présélectionné, retenu ou non retenu) pour envoyer le message correspondant.</p>
      )}
      {!configured.email && !configured.whatsapp && (
        <p className="text-xs text-ink/55">Aucun service d’envoi configuré : contactez le candidat directement par téléphone ou WhatsApp.</p>
      )}
      {error && <Msg kind="err" text={error} />}
      {results && (
        <ul className="space-y-1 text-sm">
          {results.map((r) => (
            <li key={r.channel} className={r.status === 'sent' ? 'text-brand-dark' : 'text-ink/70'}>
              {r.channel === 'email' ? 'E-mail' : 'WhatsApp'} : <strong>{label[r.status] ?? r.status}</strong>
              {r.error ? ` — ${r.error}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [step, setStep] = useState<'idle' | 'confirm' | 'busy'>('idle');
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');
  async function del() {
    setStep('busy');
    try {
      await call(`/api/admin/candidates/${id}`, 'DELETE');
      window.location.assign('/admin/candidatures');
    } catch (e) {
      setError((e as Error).message);
      setStep('confirm');
    }
  }
  if (step === 'idle') {
    return (
      <Button type="button" variant="outline" size="sm" className="text-red-700" onClick={() => setStep('confirm')}>
        <Trash2 className="h-4 w-4" /> Supprimer
      </Button>
    );
  }
  return (
    <div className="w-full space-y-3 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-sm">
      <p className="font-semibold text-red-800">Supprimer définitivement la candidature de {name} ?</p>
      <p className="text-red-800/80">Ses réponses, fichiers et notifications seront effacés. Cette action est irréversible. Tapez <strong>SUPPRIMER</strong> pour confirmer.</p>
      <input value={typed} onChange={(e) => setTyped(e.target.value)} className="h-10 w-full rounded-lg border border-red-300 bg-white px-3" aria-label="Tapez SUPPRIMER" />
      {error && <p className="text-red-700">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="danger" size="sm" disabled={typed !== 'SUPPRIMER' || step === 'busy'} onClick={del}>
          {step === 'busy' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Supprimer
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setStep('idle'); setTyped(''); }}>Annuler</Button>
      </div>
    </div>
  );
}
