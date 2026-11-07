import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'GRAPHIA 2026 — Plateforme de candidature', template: '%s · GRAPHIA 2026' },
  description:
    "Bootcamp gratuit de 5 jours en infographie et intelligence artificielle pour 50 créatifs de Touba et Mbacké. Novembre 2026. Candidatez en ligne.",
  openGraph: {
    title: 'GRAPHIA 2026 — Un nouveau chapitre s’ouvre',
    description: '50 talents · 5 jours · 1 ambition. Bootcamp gratuit infographie & IA à Touba.',
    images: ['/affiche-graphia-2026.webp'],
    locale: 'fr_SN',
    type: 'website',
  },
};

export const viewport: Viewport = { themeColor: '#078D43', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
