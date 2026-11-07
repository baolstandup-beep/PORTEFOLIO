import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Brush,
  CalendarDays,
  Check,
  Cpu,
  Gift,
  Layers,
  Lightbulb,
  MapPin,
  Rocket,
  Trophy,
  Users,
} from 'lucide-react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { buttonClass } from '@/components/ui';
import { applicationsClosed } from '@/lib/env';

export const dynamic = 'force-dynamic';

const OBJECTIVES = [
  'Former 50 participants aux pratiques modernes de l’infographie et du design graphique.',
  'Renforcer la maîtrise des outils professionnels de création.',
  'Initier aux usages de l’intelligence artificielle appliquée à la création graphique.',
  'Développer la créativité, l’innovation et la productivité.',
  'Sensibiliser aux enjeux éthiques et professionnels de l’IA.',
  'Construire un portfolio et valoriser son travail.',
  'Développer l’esprit d’entrepreneuriat créatif.',
  'Créer un réseau entre créatifs, professionnels et partenaires de Touba et Mbacké.',
];

const DAYS = [
  {
    icon: Brush,
    title: 'Design, créativité et tendances',
    theme: 'Les fondamentaux de l’infographie moderne',
    points: ['Composition et hiérarchie visuelle', 'Couleurs et typographie', 'Branding et identité visuelle', 'Analyse de projets professionnels'],
    workshop: 'Création d’une affiche ou d’un visuel de communication professionnel.',
  },
  {
    icon: Layers,
    title: 'Outils et production graphique',
    theme: 'Produire des créations graphiques professionnelles',
    points: ['Optimisation du workflow', 'Retouche et création vectorielle', 'Conception de logos et mockups', 'Préparation print et digital'],
    workshop: 'Création d’une mini-identité visuelle pour une marque fictive ou un projet local.',
  },
  {
    icon: Cpu,
    title: 'Intelligence artificielle et créativité',
    theme: 'L’IA au service de l’infographiste',
    points: ['IA générative et prompt engineering', 'Création et retouche d’images assistées', 'Intégrer l’IA dans son workflow', 'Éthique et propriété intellectuelle'],
    workshop: 'Création d’un concept visuel ou d’une campagne assistée par l’IA.',
  },
  {
    icon: Rocket,
    title: 'Design digital et entrepreneuriat créatif',
    theme: 'Transformer ses compétences en opportunités',
    points: ['Contenus pour les réseaux sociaux', 'Portfolio et personal branding', 'Trouver des clients, fixer ses prix', 'Lancer une activité indépendante'],
    workshop: 'Construction ou amélioration du portfolio de chaque participant.',
  },
  {
    icon: Trophy,
    title: 'GRAPHIA Creative Challenge',
    theme: 'Créer, collaborer et présenter',
    points: ['Défi créatif sur un brief réel', 'Production accompagnée par les formateurs', 'Présentation devant un jury', 'Cérémonie de clôture et attestations'],
    workshop: 'Exposition des meilleures créations, remise des attestations et des prix.',
  },
];

const AUDIENCE = [
  'Infographistes professionnels',
  'Designers graphiques',
  'Étudiants en communication, art ou numérique',
  'Jeunes passionnés d’infographie',
  'Photographes et retoucheurs',
  'Créateurs de contenu',
  'Community managers',
  'Entrepreneurs du secteur créatif',
];

const CONDITIONS = [
  { title: 'Résider à Touba, Mbacké ou alentours', text: 'Le Bootcamp s’adresse en priorité aux créatifs de Touba et Mbacké, puis des localités proches selon les places.' },
  { title: 'Être disponible les 5 jours', text: 'La formation est intensive : la présence aux cinq journées est attendue.' },
  { title: 'S’engager à participer activement', text: '70 % de pratique : ateliers, exercices, travaux de groupe et challenge final.' },
  { title: 'Remplir le formulaire de candidature', text: 'Une seule candidature par personne. Elle sera étudiée par l’équipe de sélection.' },
];

const FAQ = [
  {
    q: 'La formation est-elle vraiment gratuite ?',
    a: 'Oui. La participation à GRAPHIA 2026 est 100 % gratuite pour les 50 participants retenus. Aucun paiement ne vous sera demandé pour candidater ou participer.',
  },
  {
    q: 'Est-ce que je suis sélectionné dès que j’envoie le formulaire ?',
    a: 'Non. L’envoi du formulaire enregistre votre candidature. L’équipe étudie ensuite chaque dossier et sélectionne 50 participants. Les candidats retenus sont contactés par téléphone ou WhatsApp.',
  },
  {
    q: 'Faut-il être déjà infographiste professionnel ?',
    a: 'Non. Les débutants motivés, les étudiants et les jeunes passionnés peuvent candidater. La sélection tient compte de la motivation, de l’intérêt pour la création, de la disponibilité et du potentiel, pas seulement de l’expérience.',
  },
  {
    q: 'Dois-je avoir un ordinateur ?',
    a: 'Un ordinateur portable est un vrai plus pour les ateliers pratiques. Indiquez vos contraintes dans le formulaire ; l’équipe communiquera les informations pratiques aux candidats retenus.',
  },
  {
    q: 'Je n’ai pas de portfolio, puis-je postuler ?',
    a: 'Oui. Le portfolio est facultatif. Si vous avez des réalisations, vous pouvez ajouter un lien ou joindre jusqu’à 3 fichiers (images ou PDF, 4 Mo au total).',
  },
  {
    q: 'Combien de temps faut-il pour remplir le formulaire ?',
    a: 'Environ 10 minutes. Vos réponses sont enregistrées automatiquement sur votre téléphone : si la connexion coupe, vous reprenez là où vous vous étiez arrêté.',
  },
  {
    q: 'Que deviennent mes données personnelles ?',
    a: 'Elles servent uniquement à la gestion des candidatures GRAPHIA 2026, sont accessibles seulement à l’équipe d’organisation et ne sont jamais publiées ni revendues.',
  },
];

export default function HomePage() {
  const closed = applicationsClosed();
  const cta = closed ? (
    <span className={buttonClass('outline', 'lg', 'pointer-events-none')}>Candidatures closes</span>
  ) : (
    <Link href="/candidater" className={buttonClass('primary', 'lg', 'group')}>
      CANDIDATER MAINTENANT
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </Link>
  );

  return (
    <>
      <SiteHeader cta={!closed} />
      <main id="contenu">
        {/* ── Bannière ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-mist to-white">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pb-20 md:pt-16">
            <div className="animate-rise">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink/70 shadow-sm ring-1 ring-ink/5">
                <span className="h-2 w-2 rounded-full bg-brand" /> Bootcamp Infographie &amp; IA · Novembre 2026
              </p>
              <h1 className="text-[2.6rem] font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                Un nouveau <span className="text-brand">chapitre</span> s’ouvre.
              </h1>
              <div className="my-6 h-1.5 w-20 rounded-full bg-sun" />
              <p className="text-lg sm:text-xl">
                Pour les créatifs de <strong className="font-bold">Touba et Mbacké.</strong>
              </p>
              <p className="mt-3 max-w-md text-ink/70 sm:text-lg">
                Une nouvelle expérience dédiée à la <strong className="text-ink">créativité</strong>, au{' '}
                <strong className="text-ink">design</strong> et à l’<strong className="text-ink">innovation</strong>.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {cta}
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  <Gift className="h-4 w-4" /> Participation 100 % gratuite
                </span>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-sm animate-rise [animation-delay:120ms] md:max-w-none">
              <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2rem] bg-brand/10" />
              <Image
                src="/affiche-graphia-2026.webp"
                alt="Affiche officielle GRAPHIA 2026 : Un nouveau chapitre s’ouvre. 50 talents, 5 jours, 1 ambition."
                width={819}
                height={1024}
                priority
                sizes="(min-width: 768px) 40vw, 90vw"
                className="h-auto w-full rounded-3xl shadow-2xl shadow-ink/20"
              />
            </div>
          </div>

          {/* Statistiques */}
          <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
            <dl className="grid grid-cols-3 divide-x divide-white/25 overflow-hidden rounded-3xl bg-brand text-center text-white shadow-lg shadow-brand/25">
              {[
                { n: '50', l: 'Talents', c: 'text-white' },
                { n: '5', l: 'Jours', c: 'text-sun' },
                { n: '1', l: 'Ambition', c: 'text-white' },
              ].map((s) => (
                <div key={s.l} className="px-2 py-6 sm:py-8">
                  <dt className="sr-only">{s.l}</dt>
                  <dd>
                    <span className={`block text-5xl font-black leading-none sm:text-7xl ${s.c}`}>{s.n}</span>
                    <span className={`mt-2 block text-sm font-semibold uppercase tracking-[0.15em] sm:text-lg ${s.c}`}>{s.l}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Présentation ─────────────────────────────── */}
        <section id="projet" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Le projet</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                Un Bootcamp intensif pour les créatifs face à l’ère de l’IA.
              </h2>
            </div>
            <div className="space-y-4 text-ink/75 sm:text-lg">
              <p>
                GRAPHIA 2026 est un programme de renforcement de capacités conçu pour accompagner les infographistes,
                designers et jeunes créatifs de Touba et Mbacké face aux transformations rapides de la création graphique
                et du numérique.
              </p>
              <p>
                Pendant <strong className="text-ink">cinq jours</strong>, <strong className="text-ink">50 participants sélectionnés</strong>{' '}
                alternent formation, ateliers pratiques, découverte des outils d’intelligence artificielle,
                entrepreneuriat créatif et challenge final. 30 % de théorie, 70 % de pratique.
              </p>
              <ul className="grid gap-3 pt-2 text-[15px] sm:grid-cols-2">
                {[
                  { i: MapPin, t: 'Touba, Sénégal' },
                  { i: CalendarDays, t: 'Novembre 2026 · 5 jours' },
                  { i: Users, t: '50 participants' },
                  { i: Gift, t: 'Participation gratuite' },
                ].map(({ i: I, t }) => (
                  <li key={t} className="flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 font-semibold text-ink">
                    <I className="h-5 w-5 text-brand" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Objectifs ────────────────────────────────── */}
        <section className="bg-mist py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Objectifs</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
              Renforcer les compétences techniques, créatives et professionnelles.
            </h2>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {OBJECTIVES.map((o, i) => (
                <li key={o} className="rounded-2xl bg-white p-5 shadow-card">
                  <span className="text-sm font-black text-brand">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink/80">{o}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Programme ────────────────────────────────── */}
        <section id="programme" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Programme</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Cinq jours, cinq étapes.</h2>
            <ol className="mt-10 grid gap-5 lg:grid-cols-5">
              {DAYS.map((d, i) => (
                <li key={d.title} className="group flex flex-col rounded-2xl border border-ink/8 bg-white p-5 shadow-card transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wide text-sun">Jour {i + 1}</span>
                    <d.icon className="h-6 w-6 text-brand" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-snug">{d.title}</h3>
                  <p className="mt-1 text-sm font-medium text-brand">{d.theme}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-ink/70">
                    {d.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> {p}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-auto pt-4 text-sm">
                    <span className="font-semibold">Atelier : </span>
                    <span className="text-ink/70">{d.workshop}</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Public cible ─────────────────────────────── */}
        <section id="public" className="scroll-mt-20 bg-ink py-16 text-white sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-sun">Public cible</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">À qui s’adresse GRAPHIA ?</h2>
              <p className="mt-4 text-white/70">
                Aux acteurs des métiers créatifs issus principalement de Touba et Mbacké. Une attention particulière est
                accordée à la diversité des profils et aux jeunes talents ayant moins accès à la formation.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {AUDIENCE.map((a) => (
                <li key={a} className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-4 ring-1 ring-white/10">
                  <BadgeCheck className="h-5 w-5 shrink-0 text-sun" />
                  <span className="font-medium">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Conditions ───────────────────────────────── */}
        <section id="conditions" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Conditions de participation</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">Ce qu’il faut pour candidater.</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {CONDITIONS.map((c, i) => (
                <div key={c.title} className="flex gap-4 rounded-2xl border border-ink/8 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-white">{i + 1}</span>
                  <div>
                    <h3 className="font-bold">{c.title}</h3>
                    <p className="mt-1 text-[15px] text-ink/70">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-sun/40 p-5 text-[15px]">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                <strong>Critères de sélection :</strong> motivation, intérêt pour la création graphique, expérience ou
                projet dans le secteur, disponibilité pendant les cinq jours, volonté de progresser et engagement à
                participer activement.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 bg-mist py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">Questions fréquentes</h2>
            <div className="mt-8 space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="group rounded-2xl bg-white p-5 shadow-card open:ring-2 open:ring-brand/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mist text-lg transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Appel final ──────────────────────────────── */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-12 text-center text-white sm:px-12 sm:py-16">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sun/30 blur-2xl" aria-hidden />
              <h2 className="text-3xl font-black uppercase leading-tight sm:text-5xl">50 places. Et si l’une était pour vous ?</h2>
              <p className="mx-auto mt-4 max-w-xl text-white/85">
                Environ 10 minutes pour candidater, depuis votre téléphone. Vos réponses sont sauvegardées au fur et à mesure.
              </p>
              <div className="mt-8 flex justify-center">
                {closed ? (
                  <span className={buttonClass('outline', 'lg', 'pointer-events-none')}>Candidatures closes</span>
                ) : (
                  <Link href="/candidater" className={buttonClass('sun', 'lg', 'group')}>
                    CANDIDATER MAINTENANT
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
