import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MotionRoot } from '@/components/motion/motion-root';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'GRAPHIA — Plateforme de candidature', template: '%s · GRAPHIA' },
  description:
    "Bootcamp 80 % gratuit de 5 jours en infographie et intelligence artificielle pour 50 créatifs de Touba et Mbacké. Candidatez en ligne.",
  openGraph: {
    title: 'GRAPHIA — Un nouveau chapitre s’ouvre',
    description: '50 talents · 5 jours · 1 ambition. Bootcamp infographie & IA à Touba, 80 % gratuit.',
    images: ['/affiche-graphia-2026.webp'],
    locale: 'fr_SN',
    type: 'website',
  },
};

export const viewport: Viewport = { themeColor: '#078D43', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Active les animations avant le premier rendu (évite le clignotement) ; rien si l'utilisateur réduit les animations */}
        <script
          dangerouslySetInnerHTML={{
            __html: "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-dvh antialiased">
        {children}
        <MotionRoot />
      </body>
    </html>
  );
}
