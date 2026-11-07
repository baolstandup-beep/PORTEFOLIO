import 'server-only';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip') || h.get('x-forwarded-for')?.split(',')[0].trim() || 'inconnu';
}

/** Refuse les requêtes de modification venant d'un autre site (protection CSRF en plus du cookie SameSite=Strict). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}
