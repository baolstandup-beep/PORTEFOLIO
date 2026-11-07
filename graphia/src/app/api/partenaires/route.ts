import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { partnerSchema } from '@/lib/partners';
import { normalizePhone } from '@/lib/phone';
import { rateLimit } from '@/lib/rate-limit';
import { clientIp, jsonError, sameOrigin } from '@/lib/request';
import { issuesToErrors } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) return jsonError('Requête refusée.', 403);
    const ip = await clientIp();
    if (!(await rateLimit(`partner:${ip}`, 5, 3600))) return jsonError('Trop de demandes envoyées. Réessayez dans une heure.', 429);
    const parsed = partnerSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return jsonError('Certains champs sont à corriger.', 422, { fields: issuesToErrors(parsed.error.issues) });
    const v = parsed.data;
    if (v.website) return jsonError('La demande n’a pas pu être envoyée.', 400);
    await query(
      `INSERT INTO partner_requests (organization, contact_name, contact_role, phone, email, partner_type, pack, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [v.organization, v.contact_name, v.contact_role || null, normalizePhone(v.phone), v.email ? v.email.toLowerCase() : null, v.partner_type, v.pack, v.message || null],
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[partenaires]', err);
    return jsonError('Service momentanément indisponible. Réessayez dans quelques minutes.', 503);
  }
}
