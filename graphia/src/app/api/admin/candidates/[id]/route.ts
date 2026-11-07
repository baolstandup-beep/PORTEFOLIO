import { NextResponse } from 'next/server';
import { adminFor } from '@/lib/auth';
import { deleteCandidate, duplicateMessage, updateCandidate } from '@/lib/candidates';
import { jsonError, sameOrigin } from '@/lib/request';
import { applicationSchema, issuesToErrors, toCandidateRow } from '@/lib/validation';

export const runtime = 'nodejs';
type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const admin = await adminFor('edit');
  if (!admin) return jsonError('Accès refusé.', 403);
  const { id } = await params;
  const parsed = applicationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Certains champs sont à corriger.', 422, { fields: issuesToErrors(parsed.error.issues) });
  try {
    const ok = await updateCandidate(id, toCandidateRow(parsed.data), admin.id);
    return ok ? NextResponse.json({ ok: true }) : jsonError('Candidature introuvable.', 404);
  } catch (err) {
    const dup = duplicateMessage(err);
    if (dup) return jsonError(dup, 409);
    throw err;
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const admin = await adminFor('delete');
  if (!admin) return jsonError('Accès refusé.', 403);
  const { id } = await params;
  const deleted = await deleteCandidate(id, admin.id);
  return deleted ? NextResponse.json({ ok: true }) : jsonError('Candidature introuvable.', 404);
}
