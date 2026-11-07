import { NextResponse } from 'next/server';
import { adminFor } from '@/lib/auth';
import { CapacityError, setStatus } from '@/lib/candidates';
import { jsonError, sameOrigin } from '@/lib/request';
import { statusSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const admin = await adminFor('status');
  if (!admin) return jsonError('Accès refusé.', 403);
  const parsed = statusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Statut invalide.', 400);
  const { id } = await params;
  try {
    const res = await setStatus(id, parsed.data.status, admin.id);
    return res ? NextResponse.json({ ok: true, ...res }) : jsonError('Candidature introuvable.', 404);
  } catch (e) {
    if (e instanceof CapacityError) return jsonError(e.message, 409);
    throw e;
  }
}
