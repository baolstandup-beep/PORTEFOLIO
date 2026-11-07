'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Brush, Check, Cpu, Layers, Maximize2, Rocket, Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Day = { title: string; theme: string; points: string[]; workshop: string };
const ICONS = [Brush, Layers, Cpu, Rocket, Trophy];

/**
 * Galerie des 5 journées : défilement horizontal aimanté (mobile/tablette), grille sur grand écran,
 * apparition échelonnée, zoom au survol, ouverture de chaque journée en grand format (<dialog> natif).
 */
export function ProgrammeGallery({ days }: { days: Day[] }) {
  const track = useRef<HTMLOListElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const d = open !== null ? days[open] : null;
  const Icon = open !== null ? ICONS[open] : Brush;

  return (
    <div className="relative mt-10">
      <div className="mb-4 flex justify-end gap-2 lg:hidden">
        <button type="button" onClick={() => scrollBy(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white hover:bg-mist" aria-label="Journée précédente"><ArrowLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => scrollBy(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-white hover:bg-mist" aria-label="Journée suivante"><ArrowRight className="h-4 w-4" /></button>
      </div>
      <ol
        ref={track}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day, i) => {
          const I = ICONS[i];
          return (
            <li key={day.title} data-reveal="up" style={{ ['--d' as string]: i * 90 }} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
              <button
                type="button"
                onClick={() => show(i)}
                className="lift group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white p-5 text-left shadow-card"
              >
                <span aria-hidden className="pointer-events-none absolute -right-4 -top-6 text-[7rem] font-black leading-none text-ink/[0.04] transition-transform duration-500 group-hover:scale-110">{i + 1}</span>
                <span className="flex items-center justify-between">
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-sun">Jour {i + 1}</span>
                  <I className="h-6 w-6 text-brand transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-125" />
                </span>
                <span className="mt-4 block text-lg font-bold leading-snug">{day.title}</span>
                <span className="mt-1 block text-sm font-medium text-brand">{day.theme}</span>
                <span className="mt-4 block space-y-1.5 text-sm text-ink/70">
                  {day.points.map((p) => (
                    <span key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {p}</span>
                  ))}
                </span>
                <span className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm font-semibold text-ink/60 group-hover:text-brand">
                  Voir l’atelier <Maximize2 className="h-4 w-4" />
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <dialog
        ref={dialog}
        onClose={() => setOpen(null)}
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
        className="m-auto w-[min(92vw,40rem)] rounded-3xl p-0 shadow-2xl backdrop:bg-ink/70 backdrop:backdrop-blur-sm open:animate-rise"
      >
        {d && (
          <div className="relative overflow-hidden">
            <div className="relative bg-brand px-6 pb-8 pt-6 text-white sm:px-8">
              <span aria-hidden className="absolute -right-6 -top-10 text-[10rem] font-black leading-none text-white/10">{(open ?? 0) + 1}</span>
              <button type="button" onClick={() => dialog.current?.close()} className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 hover:bg-white/25" aria-label="Fermer"><X className="h-5 w-5" /></button>
              <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-sun"><Icon className="h-4 w-4" /> Jour {(open ?? 0) + 1}</span>
              <h3 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">{d.title}</h3>
              <p className="mt-1 font-medium text-white/85">{d.theme}</p>
            </div>
            <div className="space-y-5 px-6 py-6 sm:px-8">
              <ul className="grid gap-2 sm:grid-cols-2">
                {d.points.map((p, k) => (
                  <li key={p} className="flex gap-2 rounded-xl bg-mist px-3 py-2.5 text-[15px] animate-rise" style={{ animationDelay: `${80 + k * 60}ms` }}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {p}
                  </li>
                ))}
              </ul>
              <div className="rounded-2xl border-2 border-sun bg-sun/25 p-4">
                <p className="text-sm font-bold uppercase tracking-wide text-ink/70">Atelier pratique</p>
                <p className="mt-1 text-[15px] font-semibold">{d.workshop}</p>
              </div>
              <div className="flex justify-between gap-2">
                <button type="button" disabled={open === 0} onClick={() => setOpen((o) => (o ?? 1) - 1)} className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold hover:bg-mist', open === 0 && 'invisible')}><ArrowLeft className="h-4 w-4" /> Jour précédent</button>
                <button type="button" disabled={open === days.length - 1} onClick={() => setOpen((o) => (o ?? 0) + 1)} className={cn('inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold hover:bg-mist', open === days.length - 1 && 'invisible')}>Jour suivant <ArrowRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
