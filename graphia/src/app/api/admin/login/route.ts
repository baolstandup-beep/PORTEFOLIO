import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { rateLimit, resetRateLimit } from '@/lib/rate-limit';
import { clientIp, jsonError, sameOrigin } from '@/lib/request';
import { loginSchema } from '@/lib/validation';

export const runtime = 'nodejs';

// Hachage factice : la vérification prend le même temps que l'adresse existe ou non.
const DUMMY_HASH = bcrypt.hashSync('graphia-dummy-password', 12);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError('Identifiant ou mot de passe incorrect.', 400);
  const { email, password } = parsed.data;

  const ip = await clientIp();
  const okIp = await rateLimit(`login-ip:${ip}`, 20, 900);
  const okEmail = await rateLimit(`login-email:${email}`, 5, 900);
  if (!okIp || !okEmail) return jsonError('Trop de tentatives. Patientez 15 minutes avant de réessayer.', 429);

  const { rows } = await query<{ id: string; password_hash: string; session_version: number }>(
    'SELECT id, password_hash, session_version FROM administrators WHERE lower(email) = $1',
    [email],
  );
  const admin = rows[0];
  const valid = await bcrypt.compare(password, admin?.password_hash ?? DUMMY_HASH);
  if (!admin || !valid) return jsonError('Identifiant ou mot de passe incorrect.', 401);

  await resetRateLimit(`login-email:${email}`);
  await query('UPDATE administrators SET last_login_at = now() WHERE id = $1', [admin.id]);
  await createSession(admin.id, admin.session_version);
  return NextResponse.json({ ok: true });
}
