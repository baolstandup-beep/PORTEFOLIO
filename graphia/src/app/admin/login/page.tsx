import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/logo';
import { getAdmin } from '@/lib/auth';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Connexion administrateur', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin');
  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Logo light className="text-4xl" />
          <p className="mt-3 text-sm text-white/60">Espace organisation · accès réservé</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <h1 className="text-xl font-bold">Connexion</h1>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
