import { cn } from '@/lib/utils';

/** Logotype GRAPHIA d'après l'affiche officielle : « g » vert, « RAPH » noir, « IA » sur pavé jaune. */
export function Logo({ className, light = false, tagline = false }: { className?: string; light?: boolean; tagline?: boolean }) {
  return (
    <span className={cn('inline-flex flex-col leading-none', className)} aria-label="GRAPHIA">
      <span className="inline-flex items-end font-black tracking-tight" aria-hidden>
        <span className="text-[1.45em] leading-[0.8] text-brand">g</span>
        <span className={cn('text-[1em]', light ? 'text-white' : 'text-ink')}>RAPH</span>
        <span className="ml-0.5 rounded-[3px] bg-sun px-1 text-[1em] text-ink">IA</span>
      </span>
      {tagline && (
        <span className={cn('mt-1 text-[0.36em] font-semibold tracking-wide', light ? 'text-white/80' : 'text-brand')} aria-hidden>
          Créer · Innover · Transformer
        </span>
      )}
    </span>
  );
}
