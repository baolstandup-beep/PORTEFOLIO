import { after, NextResponse } from 'next/server';
import { adminFor } from '@/lib/auth';
import { CapacityError, getCandidate, setStatus } from '@/lib/candidates';
import { alreadySent, autoNotifyEnabled, notify, STATUS_NOTIFICATION } from '@/lib/notifications';
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
    if (!res) return jsonError('Candidature introuvable.', 404);
    const type = STATUS_NOTIFICATION[res.to];
    const auto = Boolean(type && res.from !== res.to && autoNotifyEnabled());
    if (auto && type) {
      // Envoi après la réponse : l'interface n'attend pas WhatsApp / l'e-mail.
      after(async () => {
        try {
          if (await alreadySent(id, type)) return;
          const c = await getCandidate(id);
          if (c && c.status === res.to) await notify(c, type, admin.id);
        } catch (e) {
          console.error('[statut] notification automatique', e);
        }
      });
    }
    return NextResponse.json({ ok: true, ...res, notified: auto });
  } catch (e) {
    if (e instanceof CapacityError) return jsonError(e.message, 409);
    throw e;
  }
}
