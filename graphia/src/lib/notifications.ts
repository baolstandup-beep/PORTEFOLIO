import 'server-only';
import { query } from './db';
import { siteUrl } from './env';

export type NotificationType = 'confirmation' | 'preselection' | 'selection' | 'non_selection';
export type Channel = 'email' | 'whatsapp';
export type SendStatus = 'sent' | 'failed' | 'not_configured' | 'skipped';

export const NOTIFICATION_LABELS: Record<NotificationType, string> = {
  confirmation: "Confirmation d'inscription",
  preselection: 'Présélection',
  selection: 'Sélection définitive',
  non_selection: 'Non-sélection',
};

type Recipient = {
  id: string;
  first_name: string;
  last_name: string;
  application_number: string;
  email: string | null;
  phone_normalized: string;
  whatsapp: string | null;
};

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}
export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}
function whatsappTemplate(type: NotificationType): string | undefined {
  const map: Record<NotificationType, string | undefined> = {
    confirmation: process.env.WHATSAPP_TEMPLATE_CONFIRMATION,
    preselection: process.env.WHATSAPP_TEMPLATE_PRESELECTION,
    selection: process.env.WHATSAPP_TEMPLATE_SELECTION,
    non_selection: process.env.WHATSAPP_TEMPLATE_NON_SELECTION,
  };
  return map[type] || undefined;
}

export function buildMessage(type: NotificationType, c: Pick<Recipient, 'first_name' | 'application_number'>) {
  const hello = `Bonjour ${c.first_name},`;
  const sign = "L'équipe GRAPHIA — Baol Up Graphic";
  const ref = `Numéro de candidature : ${c.application_number}`;
  const bodies: Record<NotificationType, { subject: string; text: string }> = {
    confirmation: {
      subject: `GRAPHIA — Candidature reçue (${c.application_number})`,
      text: `${hello}\n\nNous avons bien reçu votre candidature au Bootcamp GRAPHIA.\n${ref}\n\nVotre dossier sera étudié par notre équipe de sélection. L'envoi du formulaire ne vaut pas sélection : les candidats retenus seront contactés par téléphone ou WhatsApp.\n\n${sign}`,
    },
    preselection: {
      subject: 'GRAPHIA — Vous êtes présélectionné(e)',
      text: `${hello}\n\nBonne nouvelle : votre candidature à GRAPHIA a été présélectionnée.\n${ref}\n\nNotre équipe vous contactera prochainement pour la suite de la sélection. Gardez votre téléphone et WhatsApp disponibles.\n\n${sign}`,
    },
    selection: {
      subject: 'GRAPHIA — Félicitations, vous êtes retenu(e) !',
      text: `${hello}\n\nFélicitations ! Vous faites partie des 50 participants retenus pour le Bootcamp GRAPHIA (5 jours, Touba).\n${ref}\n\nNous vous communiquerons les dates, le lieu et les informations pratiques. Merci de confirmer votre présence en répondant à ce message.\n\n${sign}`,
    },
    non_selection: {
      subject: 'GRAPHIA — Réponse à votre candidature',
      text: `${hello}\n\nMerci pour l'intérêt que vous portez à GRAPHIA. Le nombre de places étant limité à 50, nous ne pouvons pas retenir votre candidature pour cette édition.\n${ref}\n\nNous vous encourageons à continuer à créer et à postuler aux prochaines éditions.\n\n${sign}`,
    },
  };
  return bodies[type];
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!);

async function sendEmail(to: string, subject: string, text: string): Promise<{ ok: boolean; error?: string }> {
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#080808;max-width:560px">
<div style="background:#078D43;color:#fff;padding:16px 20px;font-weight:bold;font-size:18px">GRAPHIA</div>
<div style="padding:20px;border:1px solid #e5e5e5;border-top:0">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
<p style="font-size:12px;color:#666">${escapeHtml(siteUrl())}</p></div>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text, html }),
    signal: AbortSignal.timeout(10_000),
  });
  if (res.ok) return { ok: true };
  return { ok: false, error: `Resend ${res.status} : ${(await res.text()).slice(0, 300)}` };
}

async function sendWhatsapp(to: string, template: string, params: string[]): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: template,
        language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'fr' },
        components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }],
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (res.ok) return { ok: true };
  return { ok: false, error: `WhatsApp ${res.status} : ${(await res.text()).slice(0, 300)}` };
}

export type ChannelResult = { channel: Channel; status: SendStatus; error?: string };

/**
 * Envoie une notification sur chaque canal possible et enregistre le résultat réel.
 * Aucun envoi n'est simulé : sans service configuré, le statut enregistré est « not_configured ».
 */
export async function notify(c: Recipient, type: NotificationType, adminId: string | null = null): Promise<ChannelResult[]> {
  const msg = buildMessage(type, c);
  const results: ChannelResult[] = [];

  // E-mail
  if (!c.email) results.push({ channel: 'email', status: 'skipped', error: "Pas d'adresse e-mail" });
  else if (!emailConfigured()) results.push({ channel: 'email', status: 'not_configured' });
  else {
    try {
      const r = await sendEmail(c.email, msg.subject, msg.text);
      results.push({ channel: 'email', status: r.ok ? 'sent' : 'failed', error: r.error });
    } catch (e) {
      results.push({ channel: 'email', status: 'failed', error: (e as Error).message });
    }
  }

  // WhatsApp
  const template = whatsappTemplate(type);
  if (!whatsappConfigured() || !template) results.push({ channel: 'whatsapp', status: 'not_configured' });
  else {
    try {
      const r = await sendWhatsapp(c.whatsapp || c.phone_normalized, template, [c.first_name, c.application_number]);
      results.push({ channel: 'whatsapp', status: r.ok ? 'sent' : 'failed', error: r.error });
    } catch (e) {
      results.push({ channel: 'whatsapp', status: 'failed', error: (e as Error).message });
    }
  }

  for (const r of results) {
    await query(
      `INSERT INTO notifications (candidate_id, notification_type, channel, message, status, error, sent_by, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CASE WHEN $5 = 'sent' THEN now() ELSE NULL END)`,
      [c.id, type, r.channel, msg.text, r.status, r.error ?? null, adminId],
    );
  }
  return results;
}
