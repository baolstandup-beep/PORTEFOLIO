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
import { CommunityNetwork } from '@/components/motion/community-network';
import { CountUp } from '@/components/motion/count-up';
import { MotionVideo } from '@/components/motion/motion-video';
import { Parallax } from '@/components/motion/parallax';
import { ProgrammeGallery } from '@/components/motion/programme-gallery';
import { Words } from '@/components/motion/words';
import { PartnerPacks } from '@/components/partners/packs';

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

/** Chiffres réels du programme (dossier officiel GRAPHIA) : aucune statistique inventée. */
const STATS = [
  { value: 50, suffix: '', label: 'participants sélectionnés' },
  { value: 5, suffix: '', label: 'jours de formation intensive' },
  { value: 70, suffix: ' %', label: 'de pratique, 30 % de théorie' },
  { value: 5, suffix: '', label: 'ateliers pratiques' },
  { value: 10, suffix: '', label: 'objectifs de formation' },
  { value: 1, suffix: '', label: 'challenge créatif final' },
];

/** Parcours visé, aligné sur le programme des 5 jours. */
const JOURNEY = [
  { title: 'Débutant', text: 'Vous arrivez avec vos bases, quel que soit votre niveau.' },
  { title: 'Découverte des outils IA', text: 'IA générative, prompt engineering, création assistée.' },
  { title: 'Nouvelles compétences', text: 'Composition, typographie, branding, workflow pro.' },
  { title: 'Premiers projets', text: 'Affiche, mini-identité visuelle, campagne assistée par l’IA.' },
  { title: 'Expertise', text: 'Portfolio, personal branding, fixation des prix.' },
  { title: 'Niveau professionnel', text: 'Challenge final devant un jury et attestation.' },
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
    q: 'La formation est-elle gratuite ?',
    a: 'La formation est 80 % gratuite : l’essentiel du coût est pris en charge par l’organisation. Une participation aux frais sera demandée aux candidats retenus ; son montant leur sera communiqué au moment de la sélection. Candidater est gratuit et ne vous engage à rien.',
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
    a: 'Elles servent uniquement à la gestion des candidatures GRAPHIA, sont accessibles seulement à l’équipe d’organisation et ne sont jamais publiées ni revendues.',
  },
];

export default function HomePage() {
  const closed = applicationsClosed();
  const cta = closed ? (
    <span className={buttonClass('outline', 'lg', 'pointer-events-none')}>Candidatures closes</span>
  ) : (
    <Link href="/candidater" className={buttonClass('primary', 'lg', 'group btn-shine shadow-lg shadow-brand/30')}>
      CANDIDATER MAINTENANT
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </Link>
  );

  return (
    <>
      <SiteHeader cta={!closed} />
      <main id="contenu">
        {/* ── Bannière ─────────────────────────────────── */}
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-mist to-white">
          {/* Fonds en mouvement lent (GPU) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <span className="blob -left-24 top-10 h-72 w-72 bg-brand/30" />
            <span className="blob right-[-6rem] top-1/3 h-80 w-80 bg-sun/50 [animation-delay:-6s]" />
            <span className="blob bottom-0 left-1/3 h-64 w-64 bg-brand/20 [animation-delay:-12s]" />
            <svg className="absolute inset-0 h-full w-full opacity-[0.35]" aria-hidden>
              <defs>
                <pattern id="grid-dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#080808" fillOpacity="0.12" /></pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dots)" />
            </svg>
          </div>
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pb-20 md:pt-16">
            <div>
              <p style={{ ['--d' as string]: 0 }} className="hero-in mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-ink/70 shadow-sm ring-1 ring-ink/5">
                <span className="h-2 w-2 rounded-full bg-brand" /> Bootcamp Infographie &amp; IA · Touba et Mbacké
              </p>
              <h1 className="text-[2.6rem] font-black uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                <span className="sr-only">Un nouveau chapitre s’ouvre.</span>
                <span aria-hidden>
                  <span className="hero-word" style={{ ['--i' as string]: 0 }}>Un</span>{' '}
                  <span className="hero-word" style={{ ['--i' as string]: 1 }}>nouveau</span>{' '}
                  <span className="hero-word text-brand" style={{ ['--i' as string]: 2 }}>chapitre</span>{' '}
                  <span className="hero-word" style={{ ['--i' as string]: 3 }}>s’ouvre.</span>
                </span>
              </h1>
              <div className="hero-in my-6 h-1.5 w-20 origin-left rounded-full bg-sun" style={{ ['--d' as string]: 520 }} />
              <p className="hero-in text-lg sm:text-xl" style={{ ['--d' as string]: 600 }}>
                Pour les créatifs de <strong className="font-bold">Touba et Mbacké.</strong>
              </p>
              <p className="hero-in mt-3 max-w-md text-ink/70 sm:text-lg" style={{ ['--d' as string]: 700 }}>
                Une nouvelle expérience dédiée à la <strong className="text-ink">créativité</strong>, au{' '}
                <strong className="text-ink">design</strong> et à l’<strong className="text-ink">innovation</strong>.
              </p>
              <div className="hero-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ ['--d' as string]: 820 }}>
                {cta}
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
                  <Gift className="h-4 w-4" /> Formation 80 % gratuite
                </span>
              </div>
            </div>
            <div className="hero-in relative mx-auto w-full max-w-sm [perspective:1200px] md:max-w-none" style={{ ['--d' as string]: 250 }}>
              <Parallax speed={0.08} tilt>
              <div className="absolute -inset-3 -z-10 rotate-2 rounded-[2rem] bg-brand/10" />
              {/* Étiquettes flottantes (profondeur) */}
              <span aria-hidden className="float absolute -left-4 top-[18%] z-10 hidden rounded-2xl bg-white px-3 py-2 text-xs font-bold shadow-xl ring-1 ring-ink/5 sm:block" style={{ animation: 'float-y 3.2s ease-in-out infinite alternate', transform: 'translateZ(40px)' }}>✦ IA générative</span>
              <span aria-hidden className="float absolute -right-3 top-[52%] z-10 hidden rounded-2xl bg-ink px-3 py-2 text-xs font-bold text-sun shadow-xl sm:block" style={{ animation: 'float-y 3.8s ease-in-out -1.2s infinite alternate', transform: 'translateZ(60px)' }}>Design · Branding</span>
              <span aria-hidden className="float absolute -left-2 bottom-[10%] z-10 hidden rounded-2xl bg-sun px-3 py-2 text-xs font-bold shadow-xl sm:block" style={{ animation: 'float-y 3.5s ease-in-out -2s infinite alternate', transform: 'translateZ(50px)' }}>Portfolio pro</span>
              <Image
                src="/visuel-graphia.webp"
                alt="Visuel GRAPHIA : une main tient la barre d’outils de Photoshop, entourée des logos Illustrator, Photoshop, ChatGPT, Claude Code, Gemini et Veo 3, devant le minaret de la Grande Mosquée de Touba."
                width={1608}
                height={2000}
                priority
                sizes="(min-width: 768px) 40vw, 90vw"
                className="h-auto w-full rounded-3xl shadow-2xl shadow-ink/20"
              />
              </Parallax>
            </div>
          </div>

          {/* Statistiques */}
          <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
            <dl data-reveal="scale" className="grid grid-cols-3 divide-x divide-white/25 overflow-hidden rounded-3xl bg-brand text-center text-white shadow-lg shadow-brand/25">
              {[
                { n: 50, l: 'Talents', c: 'text-white' },
                { n: 5, l: 'Jours', c: 'text-sun' },
                { n: 1, l: 'Ambition', c: 'text-white' },
              ].map((s) => (
                <div key={s.l} className="px-2 py-6 sm:py-8">
                  <dt className="sr-only">{s.l}</dt>
                  <dd>
                    <CountUp to={s.n} duration={s.n > 9 ? 1600 : 900} className={`block text-5xl font-black leading-none tabular-nums sm:text-7xl ${s.c}`} />
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
              <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Le projet</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                <Words text="Un Bootcamp intensif pour les créatifs face à l’ère de l’IA." />
              </h2>
            </div>
            <div data-reveal="up" style={{ ['--d' as string]: 150 }} className="space-y-4 text-ink/75 sm:text-lg">
              <p>
                GRAPHIA est un programme de renforcement de capacités conçu pour accompagner les infographistes,
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
                  { i: CalendarDays, t: '5 jours de formation' },
                  { i: Users, t: '50 participants' },
                  { i: Gift, t: 'Formation 80 % gratuite' },
                ].map(({ i: I, t }, k) => (
                  <li key={t} data-reveal="scale" style={{ ['--d' as string]: 250 + k * 80 }} className="lift flex items-center gap-3 rounded-2xl bg-mist px-4 py-3 font-semibold text-ink">
                    <I className="h-5 w-5 text-brand" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── GRAPHIA en chiffres (données réelles du programme) ── */}
        <section aria-labelledby="chiffres-titre" className="relative overflow-hidden bg-ink py-16 text-white sm:py-20">
          <span aria-hidden className="blob -right-20 -top-20 h-72 w-72 bg-brand/40" />
          <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
            <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-sun">GRAPHIA en chiffres</p>
            <h2 id="chiffres-titre" className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
              <Words text="Un programme conçu pour la pratique." />
            </h2>
            <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-6">
              {STATS.map((st, i) => (
                <div key={st.label} data-reveal="up" style={{ ['--d' as string]: i * 80 }} className="lift rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <dd className="text-4xl font-black text-sun tabular-nums sm:text-5xl"><CountUp to={st.value} suffix={st.suffix} /></dd>
                  <dt className="mt-2 text-sm font-medium text-white/75">{st.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Parcours IA (séquence HyperFrames) ──────────── */}
        <section aria-labelledby="parcours-titre" className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div data-reveal="mask" className="overflow-hidden rounded-3xl border border-ink/8 bg-white shadow-card">
              <MotionVideo name="parcours-ia" label="Animation : progression d’un participant, de débutant à niveau professionnel, en six étapes." className="aspect-[1280/600] h-auto w-full object-cover object-top" />
            </div>
            <div>
              <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Votre parcours avec l’IA</p>
              <h2 id="parcours-titre" className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                <Words text="De débutant à professionnel." />
              </h2>
              <ol className="relative mt-8 space-y-4 before:absolute before:bottom-3 before:left-[15px] before:top-3 before:w-0.5 before:bg-ink/10">
                {JOURNEY.map((j, i) => (
                  <li key={j.title} data-reveal="left" style={{ ['--d' as string]: i * 110 }} className="relative flex gap-4">
                    <span className="step-dot relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink/15 bg-white text-sm font-black text-ink/60">{i + 1}</span>
                    <div>
                      <p className="font-bold">{j.title}</p>
                      <p className="text-sm text-ink/65">{j.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-xs text-ink/45">Illustration du parcours visé ; les pourcentages de l’animation représentent la progression, pas des statistiques.</p>
            </div>
          </div>
        </section>

        {/* ── Objectifs ────────────────────────────────── */}
        <section className="bg-mist py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Objectifs</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl">
              <Words text="Renforcer les compétences techniques, créatives et professionnelles." />
            </h2>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {OBJECTIVES.map((o, i) => (
                <li key={o} data-reveal="up" style={{ ['--d' as string]: (i % 4) * 90 }} className="lift rounded-2xl bg-white p-5 shadow-card">
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
            <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Programme</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl"><Words text="Cinq jours, cinq étapes." /></h2>
            <p data-reveal="up" style={{ ['--d' as string]: 120 }} className="mt-3 max-w-2xl text-ink/65">Chaque journée se termine par un atelier pratique. Touchez une carte pour l’ouvrir en grand.</p>
            <ProgrammeGallery days={DAYS.map(({ icon: _icon, ...d }) => d)} />
          </div>
        </section>

        {/* ── Public cible ─────────────────────────────── */}
        <section id="public" className="scroll-mt-20 bg-ink py-16 text-white sm:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-sun">Public cible</p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl"><Words text="À qui s’adresse GRAPHIA ?" /></h2>
              <p data-reveal="up" style={{ ['--d' as string]: 120 }} className="mt-4 text-white/70">
                Aux acteurs des métiers créatifs issus principalement de Touba et Mbacké. Une attention particulière est
                accordée à la diversité des profils et aux jeunes talents ayant moins accès à la formation.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <CommunityNetwork labels={AUDIENCE} />
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {AUDIENCE.map((a, i) => (
                <li key={a} data-reveal="right" style={{ ['--d' as string]: i * 70 }} className="lift flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-4 ring-1 ring-white/10 hover:bg-white/10">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sun text-xs font-black text-ink">{i + 1}</span>
                  <span className="font-medium">{a}</span>
                  <BadgeCheck className="ml-auto h-5 w-5 shrink-0 text-sun/70" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Conditions ───────────────────────────────── */}
        <section id="conditions" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Conditions de participation</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl"><Words text="Ce qu’il faut pour candidater." /></h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {CONDITIONS.map((c, i) => (
                <div key={c.title} data-reveal="up" style={{ ['--d' as string]: i * 90 }} className="lift flex gap-4 rounded-2xl border border-ink/8 bg-white p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-white">{i + 1}</span>
                  <div>
                    <h3 className="font-bold">{c.title}</h3>
                    <p className="mt-1 text-[15px] text-ink/70">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div data-reveal="blur" className="mt-8 flex items-start gap-3 rounded-2xl bg-sun/40 p-5 text-[15px]">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                <strong>Critères de sélection :</strong> motivation, intérêt pour la création graphique, expérience ou
                projet dans le secteur, disponibilité pendant les cinq jours, volonté de progresser et engagement à
                participer activement.
              </p>
            </div>
          </div>
        </section>

        {/* ── Partenaires ──────────────────────────────── */}
        <section id="partenaires" className="scroll-mt-20 bg-mist py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">Partenaires</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl"><Words text="Soutenez la nouvelle génération de créatifs." /></h2>
                <p data-reveal="up" style={{ ['--d' as string]: 120 }} className="mt-3 max-w-2xl text-ink/65">Institutions, entreprises, acteurs techniques et médias : associez votre nom à GRAPHIA.</p>
              </div>
              <Link href="/partenaires" data-reveal="up" className={buttonClass('dark', 'lg', 'btn-shine shrink-0')}>
                Devenir partenaire <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="mt-10"><PartnerPacks /></div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────── */}
        <section id="faq" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p data-reveal="up" className="text-sm font-bold uppercase tracking-[0.18em] text-brand">FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl"><Words text="Questions fréquentes" /></h2>
            <div className="mt-8 space-y-3">
              {FAQ.map((f, i) => (
                <details key={f.q} data-reveal="up" style={{ ['--d' as string]: i * 60 }} className="group rounded-2xl bg-white p-5 shadow-card open:ring-2 open:ring-brand/20">
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
            <div data-reveal="scale" className="relative isolate overflow-hidden rounded-3xl bg-brand px-6 py-12 text-center text-white sm:px-12 sm:py-16">
              <span aria-hidden className="blob -right-10 -top-10 -z-10 h-56 w-56 bg-sun/40" />
              <span aria-hidden className="blob -bottom-16 -left-10 -z-10 h-56 w-56 bg-ink/30 [animation-delay:-8s]" />
              <h2 className="text-3xl font-black uppercase leading-tight sm:text-5xl"><Words text="50 places. Et si l’une était pour vous ?" /></h2>
              <p className="mx-auto mt-4 max-w-xl text-white/85">
                Environ 10 minutes pour candidater, depuis votre téléphone. Vos réponses sont sauvegardées au fur et à mesure.
              </p>
              <div className="mt-8 flex justify-center">
                {closed ? (
                  <span className={buttonClass('outline', 'lg', 'pointer-events-none')}>Candidatures closes</span>
                ) : (
                  <Link href="/candidater" className={buttonClass('sun', 'lg', 'group btn-shine')}>
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
