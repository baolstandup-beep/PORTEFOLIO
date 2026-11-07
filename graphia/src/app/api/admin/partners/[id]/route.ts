import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminFor } from '@/lib/auth';
import { audit } from '@/lib/candidates';
import { query } from '@/lib/db';
import { jsonError, sameOrigin } from '@/lib/request';

export const runtime = 'nodejs';
const schema = z.object({
  status: z.enum(['nouveau', 'en_discussion', 'confirme', 'decline']).optional(),
  admin_notes: z.string().max(4000).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const admin = await adminFor('edit');
  if (!admin) return jsonError('Accès refusé.', 403);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return jsonError('Introuvable.', 404);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Données invalides.', 400);
  const res = await query(
    'UPDATE partner_requests SET status = COALESCE($2, status), admin_notes = COALESCE($3, admin_notes) WHERE id = $1',
    [id, parsed.data.status ?? null, parsed.data.admin_notes ?? null],
  );
  if (!res.rowCount) return jsonError('Introuvable.', 404);
  await audit(null, admin.id, null, 'partner', { id, ...parsed.data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const admin = await adminFor('delete');
  if (!admin) return jsonError('Accès refusé.', 403);
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return jsonError('Introuvable.', 404);
  const res = await query('DELETE FROM partner_requests WHERE id = $1', [id]);
  if (!res.rowCount) return jsonError('Introuvable.', 404);
  await audit(null, admin.id, null, 'partner_delete', { id });
  return NextResponse.json({ ok: true });
}
