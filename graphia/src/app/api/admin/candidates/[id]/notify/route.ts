import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminFor } from '@/lib/auth';
import { audit, getCandidate } from '@/lib/candidates';
import { notify } from '@/lib/notifications';
import { jsonError, sameOrigin } from '@/lib/request';

export const runtime = 'nodejs';
const schema = z.object({ type: z.enum(['confirmation', 'preselection', 'selection', 'non_selection']) });

/** Envoi manuel : l'organisateur décide quand prévenir le candidat (un statut peut encore changer). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const admin = await adminFor('notify');
  if (!admin) return jsonError('Accès refusé.', 403);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Type de notification invalide.', 400);
  const { id } = await params;
  const c = await getCandidate(id);
  if (!c) return jsonError('Candidature introuvable.', 404);

  const expected: Record<string, string> = { preselection: 'preselectionne', selection: 'retenu', non_selection: 'non_retenu' };
  const need = expected[parsed.data.type];
  if (need && c.status !== need) {
    return jsonError("Le statut du candidat ne correspond pas à ce message. Changez d'abord le statut.", 409);
  }
  const results = await notify(c, parsed.data.type, admin.id);
  await audit(null, admin.id, id, 'notify', { type: parsed.data.type, results });
  return NextResponse.json({ results });
}
