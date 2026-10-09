// Vercel Web Analytics: only public page/project identifiers, never contact details.
window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.append(script);
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link) return;
  const url = new URL(link.href, location.href);
  if (url.hostname === 'wa.me') window.va('event', { name: 'whatsapp_click' });
  if (url.pathname.endsWith('/project.html')) {
    window.va('event', { name: 'case_study_open', data: { project: url.searchParams.get('id') || 'prizent' } });
  }
});
