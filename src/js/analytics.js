// Vercel Web Analytics : seulement des noms d'événements publics, jamais de données de contact.
// Le script n'est chargé qu'une fois, et pas en local.
export function initAnalytics() {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  if (!local && !document.querySelector('script[src$="/_vercel/insights/script.js"]')) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.append(script);
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    if (link.dataset.track) track(link.dataset.track);
    else if (link.hostname === 'wa.me') track('whatsapp_click');
  });
}

export function track(name, data) {
  window.va?.('event', data ? { name, data } : { name });
}
