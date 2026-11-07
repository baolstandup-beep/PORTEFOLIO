import { NextResponse } from 'next/server';
import { adminFor } from '@/lib/auth';
import { setScores } from '@/lib/candidates';
import { jsonError, sameOrigin } from '@/lib/request';
import { scoreSchema, totalScore } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const admin = await adminFor('score');
  if (!admin) return jsonError('Accès refusé.', 403);
  const parsed = scoreSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Notes invalides (0 à 5 par critère).', 400);
  const { id } = await params;
  const total = totalScore(parsed.data.scores);
  const ok = await setScores(id, parsed.data.scores, total, parsed.data.admin_notes, admin.id);
  return ok ? NextResponse.json({ ok: true, total }) : jsonError('Candidature introuvable.', 404);
}
