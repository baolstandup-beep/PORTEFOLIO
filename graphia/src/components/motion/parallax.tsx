'use client';

import { useEffect, useRef } from 'react';

/**
 * Parallaxe au défilement (translateY proportionnel) et légère inclinaison au pointeur (souris uniquement).
 * Un seul requestAnimationFrame par défilement, uniquement quand l'élément est à l'écran.
 */
export function Parallax({ children, speed = 0.12, tilt = false, className }: { children: React.ReactNode; speed?: number; tilt?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let visible = false;
    let raf = 0;
    let rx = 0, ry = 0, ty = 0;
    const apply = () => {
      raf = 0;
      el.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const onScroll = () => {
      if (!visible) return;
      const r = el.getBoundingClientRect();
      ty = (r.top + r.height / 2 - window.innerHeight / 2) * -speed;
      schedule();
    };
    const fine = window.matchMedia('(pointer: fine)').matches;
    const onMove = (e: PointerEvent) => {
      if (!visible) return;
      const r = el.getBoundingClientRect();
      ry = ((e.clientX - (r.left + r.width / 2)) / r.width) * 6;
      rx = -((e.clientY - (r.top + r.height / 2)) / r.height) * 6;
      schedule();
    };
    const onLeave = () => { rx = 0; ry = 0; schedule(); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) onScroll(); });
    io.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (tilt && fine) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', onLeave);
    }
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [speed, tilt]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform', transition: 'transform 0.25s ease-out', transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
}
