import Link from 'next/link';
import { LayoutDashboard, Users } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LogoutButton } from '@/components/admin/logout-button';
import { ROLE_LABELS, requireAdminPage } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  return (
    <div className="min-h-dvh bg-mist">
      <header className="no-print sticky top-0 z-40 bg-ink text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl" aria-label="Tableau de bord">
              <Logo light />
            </Link>
            <nav className="flex items-center gap-1 text-sm" aria-label="Administration">
              <Link href="/admin" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-white/75 hover:bg-white/10 hover:text-white">
                <LayoutDashboard className="h-4 w-4" /> <span className="hidden sm:inline">Tableau de bord</span>
              </Link>
              <Link href="/admin/candidatures" className="inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium text-white/75 hover:bg-white/10 hover:text-white">
                <Users className="h-4 w-4" /> <span className="hidden sm:inline">Candidatures</span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/compte" className="hidden rounded-lg px-2 py-1 text-right text-xs leading-tight hover:bg-white/10 md:block" title="Mon compte">
              <p className="font-semibold">{admin.name}</p>
              <p className="text-white/55">{ROLE_LABELS[admin.role]}</p>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
