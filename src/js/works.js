import { track } from './analytics.js';

// Archive : filtres et pagination « afficher plus ».
export function initArchive(root) {
  const list = root?.querySelector('.works');
  if (!list) return;
  const items = [...list.querySelectorAll('.work')];
  const chips = [...root.querySelectorAll('[data-filter]')];
  const moreButton = root.querySelector('[data-works-more]');
  const pageSize = Number(list.dataset.pageSize) || 12;
  let filter = 'all';
  let expanded = false;

  function render() {
    const matching = items.filter(item => filter === 'all' || item.dataset.cat.split(' ').includes(filter));
    const limit = expanded ? Infinity : pageSize;
    items.forEach(item => { item.hidden = true; });
    matching.forEach((item, i) => { item.hidden = i >= limit; });
    const remaining = matching.length - Math.min(matching.length, limit);
    moreButton.hidden = remaining === 0;
    moreButton.textContent = `Afficher les ${remaining} autres réalisations`;
    return matching;
  }

  for (const chip of chips) {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      filter = chip.dataset.filter;
      expanded = false;
      render();
    });
  }

  moreButton.addEventListener('click', () => {
    const firstNew = pageSize;
    expanded = true;
    render()[firstNew]?.querySelector('button').focus();
  });

  render();
}

// Visionneuse partagée : chaque bouton .work__open ouvre l'image en grand ;
// les flèches parcourent les images visibles du même groupe ([data-gallery]).
export function initLightbox() {
  const dialog = document.querySelector('.lightbox');
  if (!dialog) return;
  const img = dialog.querySelector('.lightbox__img');
  const title = dialog.querySelector('.lightbox__title');
  const count = dialog.querySelector('.lightbox__count');
  const caseLink = dialog.querySelector('.lightbox__case');
  let group = [];
  let index = 0;
  let opener = null;

  const visibleIn = container => [...container.querySelectorAll('.work__open')].filter(b => !b.closest('[hidden]'));

  function show(i) {
    index = (i + group.length) % group.length;
    const button = group[index];
    const thumb = button.querySelector('img');
    // La vignette déjà chargée s'affiche tout de suite, la grande version la remplace dès qu'elle est prête.
    img.src = thumb.currentSrc || thumb.src;
    img.alt = thumb.alt;
    const full = new Image();
    full.src = button.dataset.full;
    full.decode().then(() => { if (group[index] === button) img.src = full.src; }, () => {});
    title.textContent = button.dataset.title;
    count.textContent = group.length > 1 ? `${index + 1} sur ${group.length}` : '';
    caseLink.hidden = !button.dataset.case;
    if (button.dataset.case) caseLink.href = button.dataset.case;
    dialog.querySelectorAll('[data-lb="prev"], [data-lb="next"]').forEach(b => { b.hidden = group.length < 2; });
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.work__open');
    if (!button) return;
    group = visibleIn(button.closest('[data-gallery]') ?? document);
    opener = button;
    show(group.indexOf(button));
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    track('project_view');
  });

  dialog.addEventListener('click', event => {
    const action = event.target.closest('[data-lb]')?.dataset.lb;
    if (action === 'prev') show(index - 1);
    else if (action === 'next') show(index + 1);
    else if (action === 'close' || event.target === dialog || event.target.classList.contains('lightbox__frame')) dialog.close();
  });

  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });

  let startX = null;
  dialog.addEventListener('touchstart', event => { startX = event.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', event => {
    if (startX === null) return;
    const dx = event.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50 && group.length > 1) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    opener?.focus({ preventScroll: true });
  });
  caseLink.addEventListener('click', () => track('case_study_open'));
}
