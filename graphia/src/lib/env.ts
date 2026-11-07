export const MAX_PARTICIPANTS = Math.max(1, Number.parseInt(process.env.MAX_PARTICIPANTS ?? '50', 10) || 50);

export function applicationsClosed(now = new Date()): boolean {
  const close = process.env.APPLICATIONS_CLOSE_AT;
  if (!close) return false;
  const d = new Date(close);
  return !Number.isNaN(d.getTime()) && now >= d;
}

export function sessionSecret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET manquant ou trop court (32 caractères minimum).');
  return new TextEncoder().encode(s);
}

export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
