import { Check, Crown, Handshake, Medal, Wrench } from 'lucide-react';
import { PACKS } from '@/lib/partners';
import { cn } from '@/lib/utils';

const STYLE: Record<string, { card: string; badge: string; icon: typeof Crown }> = {
  or: { card: 'bg-ink text-white ring-2 ring-sun', badge: 'bg-sun text-ink', icon: Crown },
  argent: { card: 'bg-white ring-1 ring-ink/10', badge: 'bg-mist text-ink', icon: Medal },
  bronze: { card: 'bg-white ring-1 ring-ink/10', badge: 'bg-[#f3e2cf] text-[#7a4a1c]', icon: Handshake },
  technique: { card: 'bg-brand text-white', badge: 'bg-white/15 text-white', icon: Wrench },
};

/** Les 4 offres de partenariat du dossier officiel, avec apparition échelonnée. */
export function PartnerPacks() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {PACKS.map((p, i) => {
        const s = STYLE[p.value];
        const dark = p.value === 'or' || p.value === 'technique';
        return (
          <article key={p.value} data-reveal="up" style={{ ['--d' as string]: i * 90 }} className={cn('lift relative flex flex-col overflow-hidden rounded-3xl p-6 shadow-card', s.card)}>
            {p.value === 'or' && <span aria-hidden className="blob -right-10 -top-10 h-32 w-32 bg-sun/40" />}
            <div className="relative flex items-center justify-between">
              <span className={cn('rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide', s.badge)}>{p.tag}</span>
              <s.icon className={cn('h-6 w-6', dark ? 'text-sun' : 'text-brand')} />
            </div>
            <h3 className="relative mt-4 text-2xl font-black">{p.name}</h3>
            <p className={cn('relative mt-1 text-sm font-semibold', dark ? 'text-sun' : 'text-brand')}>{p.amount}</p>
            <ul className={cn('relative mt-5 space-y-2 text-sm', dark ? 'text-white/85' : 'text-ink/75')}>
              {p.perks.map((perk) => (
                <li key={perk} className="flex gap-2"><Check className={cn('mt-0.5 h-4 w-4 shrink-0', dark ? 'text-sun' : 'text-brand')} /> {perk}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
