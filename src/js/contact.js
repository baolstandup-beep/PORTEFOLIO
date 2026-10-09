import { track } from './analytics.js';

const WHATSAPP = '221773033196';
const MESSAGES = {
  name: 'Indiquez votre nom.',
  phone: 'Indiquez un numéro à 8 chiffres ou plus.',
  email: "Cette adresse e-mail n'est pas valide.",
  service: 'Choisissez une prestation.',
  message: 'Décrivez votre projet en quelques mots.'
};

// Le formulaire prépare un message WhatsApp ; si l'API e-mail est active (/api/contact), il l'envoie directement.
export function initContactForm(form) {
  if (!form) return;
  const submit = form.querySelector('[data-submit]');
  const status = form.querySelector('.form__status');
  const mode = form.querySelector('.form__mode');
  let emailEnabled = false;

  fetch('/api/contact')
    .then(r => (r.ok ? r.json() : {}))
    .then(data => {
      emailEnabled = data.available === true;
      if (emailEnabled) {
        submit.textContent = 'Envoyer ma demande';
        mode.textContent = 'Votre demande sera envoyée par e-mail. Une confirmation s’affichera ici.';
      }
    })
    .catch(() => {});

  form.addEventListener('input', event => {
    if (event.target.getAttribute('aria-invalid') === 'true') setError(event.target, '');
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    for (const key in data) data[key] = String(data[key]).trim();

    const invalid = validate(form, data);
    if (invalid) { invalid.focus(); return; }

    const text = [
      'Bonjour Cheikh Awa Balla Diop,',
      `Je m'appelle ${data.name} (${[data.phone, data.email].filter(Boolean).join(', ')}).`,
      `Prestation : ${data.service}`,
      `Projet : ${data.message}`
    ].join('\n');
    const waUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

    if (!emailEnabled) {
      window.open(waUrl, '_blank', 'noopener');
      track('whatsapp_form');
      return;
    }

    submit.disabled = true;
    const label = submit.textContent;
    submit.textContent = 'Envoi en cours';
    status.textContent = '';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(20000)
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error);
      status.textContent = 'Demande envoyée. Je vous réponds rapidement.';
      form.reset();
      track('contact_sent');
    } catch {
      status.replaceChildren(
        "L'e-mail n'est pas parti. ",
        Object.assign(document.createElement('a'), { href: waUrl, target: '_blank', rel: 'noopener', textContent: 'Envoyer la demande sur WhatsApp' })
      );
    } finally {
      submit.disabled = false;
      submit.textContent = label;
    }
  });
}

function validate(form, data) {
  const rules = {
    name: v => v.length > 1,
    phone: v => v.replace(/\D/g, '').length >= 8,
    email: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    service: v => v !== '',
    message: v => v.length > 3
  };
  let first = null;
  for (const [key, isValid] of Object.entries(rules)) {
    const field = form.elements[key];
    const ok = isValid(data[key] ?? '');
    setError(field, ok ? '' : MESSAGES[key]);
    if (!ok && !first) first = field;
  }
  return first;
}

function setError(field, message) {
  const id = `${field.id}-error`;
  let error = document.getElementById(id);
  if (!message) {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    error?.remove();
    return;
  }
  if (!error) {
    error = Object.assign(document.createElement('p'), { id, className: 'field__error' });
    field.after(error);
  }
  error.textContent = message;
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', id);
}
