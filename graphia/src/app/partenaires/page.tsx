import type { Metadata } from 'next';
import { Building2, Coins, Megaphone, Wrench } from 'lucide-react';
import { Words } from '@/components/motion/words';
import { PartnerForm } from '@/components/partners/partner-form';
import { PartnerPacks } from '@/components/partners/packs';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { PARTNER_TYPES } from '@/lib/partners';

export const metadata: Metadata = {
  title: 'Devenir partenaire',
  description: 'Soutenez GRAPHIA, le Bootcamp infographie et IA pour 50 créatifs de Touba et Mbacké : partenariats institutionnels, financiers, techniques et médias.',
};

const ICONS = { institutionnel: Building2, financier: Coins, technique: Wrench, media: Megaphone } as const;

export default function PartnersPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative isolate overflow-hidden bg-ink py-16 text-white sm:py-24">
          <span aria-hidden className="blob -left-20 top-0 h-72 w-72 bg-brand/50" />
          <span aria-hidden className="blob -right-16 bottom-0 h-64 w-64 bg-sun/30 [animation-delay:-7s]" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <p className="hero-in text-sm font-bold uppercase tracking-[0.18em] text-sun">Partenaires</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight sm:text-6xl"><Words text="Investissez dans les talents créatifs de Touba et Mbacké." /></h1>
            <p data-reveal="up" style={{ ['--d' as string]: 200 }} className="mt-5 max-w-2xl text-lg text-white/75">
              GRAPHIA forme 50 infographistes, designers et jeunes créatifs à l’infographie moderne et à l’intelligence
              artificielle. Associez votre structure à une initiative dédiée à la formation, à l’innovation et à la
              valorisation des talents.
            </p>
            <a href="#devenir-partenaire" data-reveal="up" style={{ ['--d' as string]: 320 }} className="btn-shine mt-8 inline-flex h-14 items-center rounded-full bg-sun px-7 font-bold text-ink hover:brightness-95">Devenir partenaire</a>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Partenaires recherchés</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl"><Words text="Quatre façons de contribuer." /></h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PARTNER_TYPES.map((t, i) => {
                const I = ICONS[t.value];
                return (
                  <div key={t.value} data-reveal="up" style={{ ['--d' as string]: i * 90 }} className="lift rounded-2xl border border-ink/8 bg-white p-5 shadow-card">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50"><I className="h-5 w-5 text-brand" /></span>
                    <h3 className="mt-4 font-bold">{t.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{t.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-mist py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Offres de partenariat</p>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl"><Words text="Une visibilité à la hauteur de votre engagement." /></h2>
            <p data-reveal="up" style={{ ['--d' as string]: 120 }} className="mt-3 max-w-2xl text-ink/65">Montants indicatifs. Les contributions en nature (salle, connexion, impression, restauration, matériel, prix) réduisent directement le coût du programme.</p>
            <div className="mt-10"><PartnerPacks /></div>
          </div>
        </section>

        <section id="devenir-partenaire" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Contact</p>
              <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl"><Words text="Parlons de votre partenariat." /></h2>
              <p data-reveal="up" style={{ ['--d' as string]: 120 }} className="mt-4 text-ink/70">Laissez vos coordonnées : l’équipe de Baol Up Graphic vous recontacte pour construire une offre adaptée à vos objectifs.</p>
            </div>
            <div data-reveal="up" style={{ ['--d' as string]: 150 }} className="relative rounded-3xl border border-ink/8 bg-white p-6 shadow-card sm:p-8">
              <PartnerForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
