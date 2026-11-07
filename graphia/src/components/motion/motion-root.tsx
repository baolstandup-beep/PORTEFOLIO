'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Un seul IntersectionObserver pour toute la page : il pose data-shown sur les éléments
 * [data-reveal], [data-words] et [data-observe] quand ils entrent à l'écran (une seule fois).
 * Les animations elles-mêmes sont en CSS (globals.css), donc composées par le GPU.
 */
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = document.documentElement;
    if (reduce || !('IntersectionObserver' in window)) {
      root.classList.remove('motion');
      document.querySelectorAll<HTMLElement>('[data-reveal],[data-words],[data-observe]').forEach((el) => el.setAttribute('data-shown', ''));
      return;
    }
    root.classList.add('motion');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-shown', '');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    );
    const scan = () =>
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-shown]),[data-words]:not([data-shown]),[data-observe]:not([data-shown])').forEach((el) => io.observe(el));
    scan();
    // Contenus ajoutés plus tard (formulaire en étapes, admin rafraîchi)
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
