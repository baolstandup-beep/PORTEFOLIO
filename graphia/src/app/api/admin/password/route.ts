import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, getAdmin } from '@/lib/auth';
import { query } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { jsonError, sameOrigin } from '@/lib/request';

export const runtime = 'nodejs';

const schema = z.object({
  current: z.string().min(1).max(200),
  next: z.string().min(12, 'Le nouveau mot de passe doit contenir au moins 12 caractères.').max(200),
});

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const admin = await getAdmin();
  if (!admin) return jsonError('Non authentifié.', 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? 'Données invalides.', 400);
  if (!(await rateLimit(`password:${admin.id}`, 5, 900))) return jsonError('Trop de tentatives. Patientez 15 minutes.', 429);

  const { rows } = await query<{ password_hash: string }>('SELECT password_hash FROM administrators WHERE id = $1', [admin.id]);
  if (!rows[0] || !(await bcrypt.compare(parsed.data.current, rows[0].password_hash))) {
    return jsonError('Mot de passe actuel incorrect.', 400);
  }
  // Nouvelle version de session : les autres appareils connectés sont déconnectés.
  const upd = await query<{ session_version: number }>(
    'UPDATE administrators SET password_hash = $2, session_version = session_version + 1 WHERE id = $1 RETURNING session_version',
    [admin.id, await bcrypt.hash(parsed.data.next, 12)],
  );
  await createSession(admin.id, upd.rows[0].session_version);
  return NextResponse.json({ ok: true });
}
