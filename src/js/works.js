import { track } from './analytics.js';

// Galerie : filtres, pagination « afficher plus » et visionneuse en <dialog> natif.
export function initWorks(section) {
  if (!section) return;
  const list = section.querySelector('.works');
  const items = [...list.querySelectorAll('.work')];
  const chips = [...section.querySelectorAll('[data-filter]')];
  const moreButton = section.querySelector('[data-works-more]');
  const pageSize = Number(list.dataset.pageSize) || 12;

  let filter = 'all';
  let expanded = false;
  let visible = [];

  function render() {
    const matching = items.filter(item => filter === 'all' || item.dataset.cat.split(' ').includes(filter));
    const limit = expanded ? Infinity : pageSize;
    items.forEach(item => { item.hidden = true; });
    matching.forEach((item, i) => { item.hidden = i >= limit; });
    visible = matching.filter(item => !item.hidden);

    const remaining = matching.length - visible.length;
    moreButton.hidden = remaining === 0;
    moreButton.textContent = `Afficher les ${remaining} autres projets`;
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
    const firstNew = visible.length;
    expanded = true;
    render();
    visible[firstNew]?.querySelector('button').focus();
  });

  const lightbox = createLightbox(() => visible);
  list.addEventListener('click', event => {
    const button = event.target.closest('.work__open');
    if (button) lightbox.open(visible.indexOf(button.closest('.work')));
  });

  render();
}

function createLightbox(getVisible) {
  const dialog = document.querySelector('.lightbox');
  const img = dialog.querySelector('.lightbox__img');
  const title = dialog.querySelector('.lightbox__title');
  const count = dialog.querySelector('.lightbox__count');
  const caseLink = dialog.querySelector('.lightbox__case');
  let index = 0;
  let opener = null;

  function show(i) {
    const visible = getVisible();
    index = (i + visible.length) % visible.length;
    const button = visible[index].querySelector('.work__open');
    const thumb = button.querySelector('img');

    // La vignette déjà chargée s'affiche tout de suite, la version large la remplace dès qu'elle est prête.
    img.src = thumb.currentSrc || thumb.src;
    img.alt = thumb.alt;
    const full = new Image();
    full.src = button.dataset.full;
    full.decode().then(() => { if (getVisible()[index] === visible[index]) img.src = full.src; }, () => {});

    title.textContent = button.dataset.title;
    count.textContent = `${index + 1} sur ${visible.length}`;
    caseLink.hidden = !button.dataset.case;
    if (button.dataset.case) caseLink.href = button.dataset.case;
  }

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

  // Balayage horizontal sur mobile.
  let startX = null;
  dialog.addEventListener('touchstart', event => { startX = event.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', event => {
    if (startX === null) return;
    const dx = event.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    opener?.focus({ preventScroll: true });
  });
  caseLink.addEventListener('click', () => track('case_study_open'));

  return {
    open(i) {
      opener = document.activeElement;
      show(i);
      document.documentElement.style.overflow = 'hidden';
      dialog.showModal();
      track('project_view');
    }
  };
}
