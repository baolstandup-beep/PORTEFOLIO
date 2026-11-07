import Link from 'next/link';
import { Logo } from '@/components/logo';
import { buttonClass } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo size="xl" />
      <h1 className="text-2xl font-bold">Page introuvable</h1>
      <Link href="/" className={buttonClass('primary')}>Retour à l’accueil</Link>
    </main>
  );
}
