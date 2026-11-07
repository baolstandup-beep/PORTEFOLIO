'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Séquence HyperFrames intégrée : muette, en boucle, chargée seulement à l'approche de l'écran,
 * mise en pause hors écran. Avec « réduire les animations », seule l'image fixe est affichée.
 */
export function MotionVideo({ name, label, className }: { name: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [load, setLoad] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setReduce(true); return; }
    const near = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setLoad(true); near.disconnect(); } }, { rootMargin: '400px 0px' });
    const vis = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => undefined);
      else v.pause();
    }, { threshold: 0.25 });
    near.observe(v);
    vis.observe(v);
    return () => { near.disconnect(); vis.disconnect(); };
  }, []);

  // Les <source> sont ajoutées après coup : il faut recharger la vidéo.
  useEffect(() => {
    const v = ref.current;
    if (!load || !v) return;
    v.load();
    const r = v.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) v.play().catch(() => undefined);
  }, [load]);

  const poster = `/motion/${name}-poster.webp`;
  if (reduce) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt={label} width={1280} height={720} className={className} loading="lazy" />;
  }
  return (
    <video ref={ref} className={className} poster={poster} muted loop playsInline preload="none" aria-label={label} width={1280} height={720}>
      {load && <source src={`/motion/${name}.webm`} type="video/webm" />}
      {load && <source src={`/motion/${name}.mp4`} type="video/mp4" />}
    </video>
  );
}
