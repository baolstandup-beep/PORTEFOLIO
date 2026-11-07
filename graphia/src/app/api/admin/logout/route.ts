import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';
import { jsonError, sameOrigin } from '@/lib/request';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
  await destroySession();
  return NextResponse.json({ ok: true });
}
