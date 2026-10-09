const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

const clean = (value, max = 5000) => String(value || '').trim().slice(0, max);
const escapeHtml = value => clean(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

export default async function handler(req, res) {
  const available = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL);
  if (req.method === 'GET') return json(res, 200, { available });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: 'Méthode non autorisée.' });
  }
  if (req.headers.origin && req.headers.origin !== `https://${req.headers.host}` && !req.headers.origin.startsWith('http://localhost:')) return json(res, 403, { error: 'Origine non autorisée.' });
  if (!req.headers['content-type']?.startsWith('application/json')) return json(res, 415, { error: 'Format non autorisé.' });
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json(res, 400, { error: 'Demande invalide.' });
  const { name, email, phone, service, message, website } = body;
  if (clean(website)) return json(res, 200, { ok: true });
  // L'e-mail est facultatif (le téléphone suffit pour répondre), mais doit être valide s'il est fourni.
  const required = [[name,120], [phone,80], [service,200], [message,5000]];
  const emailValue = typeof email === 'string' ? email.trim() : '';
  if (required.some(([value,max]) => typeof value !== 'string' || !value.trim() || value.length > max)
    || (email !== undefined && typeof email !== 'string')
    || emailValue.length > 200
    || (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue))) {
    return json(res, 400, { error: 'Merci de compléter correctement tous les champs.' });
  }
  if (!available) return json(res, 503, { error: "Le service email est en cours d'activation." });

  try {
    const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL,
      to: [process.env.CONTACT_TO_EMAIL || 'contact.baolvision@gmail.com'],
      ...(emailValue ? { reply_to: emailValue } : {}),
      subject: `Nouvelle demande portfolio — ${clean(service, 120)}`,
      html: `<h1>Nouvelle demande</h1><p><strong>Nom :</strong> ${escapeHtml(name)}</p><p><strong>Email :</strong> ${escapeHtml(emailValue) || 'non renseigné'}</p><p><strong>Téléphone :</strong> ${escapeHtml(phone)}</p><p><strong>Prestation :</strong> ${escapeHtml(service)}</p><p><strong>Projet :</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
    })
  });
  if (!response.ok) return json(res, 502, { error: "Le service d'envoi est momentanément indisponible." });
  return json(res, 200, { ok: true });
  } catch {
    return json(res, 502, { error: "L'envoi a échoué. Réessayez ou contactez-nous par WhatsApp." });
  }
}
