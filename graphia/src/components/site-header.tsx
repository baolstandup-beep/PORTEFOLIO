import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Logo } from './logo';
import { buttonClass } from './ui';

const NAV = [
  { href: '/#projet', label: 'Le projet' },
  { href: '/#programme', label: 'Programme' },
  { href: '/#public', label: 'Public' },
  { href: '/#conditions', label: 'Conditions' },
  { href: '/#faq', label: 'FAQ' },
];

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-ink/5 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-2xl" aria-label="GRAPHIA 2026, accueil">
          <Logo />
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-mist hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {cta && (
            <Link href="/candidater" className={buttonClass('primary', 'sm', 'hidden sm:inline-flex')}>
              Candidater
            </Link>
          )}
          <details className="group relative lg:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full hover:bg-mist [&::-webkit-details-marker]:hidden" aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </summary>
            <nav aria-label="Menu mobile" className="absolute right-0 top-12 w-60 rounded-2xl border border-ink/10 bg-white p-2 shadow-card">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="block rounded-xl px-4 py-3 text-[15px] font-medium hover:bg-mist">
                  {n.label}
                </Link>
              ))}
              <Link href="/candidater" className={buttonClass('primary', 'md', 'mt-1 w-full')}>
                Candidater maintenant
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
