import { Card } from '@/components/ui';
import { ROLE_LABELS, requireAdminPage } from '@/lib/auth';
import { PasswordForm } from './password-form';

export default async function AccountPage() {
  const admin = await requireAdminPage();
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-extrabold">Mon compte</h1>
      <Card className="space-y-1 p-5 text-sm">
        <p><span className="text-ink/55">Nom : </span><strong>{admin.name}</strong></p>
        <p><span className="text-ink/55">E-mail : </span><strong>{admin.email}</strong></p>
        <p><span className="text-ink/55">Rôle : </span><strong>{ROLE_LABELS[admin.role]}</strong></p>
      </Card>
      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 font-bold">Changer mon mot de passe</h2>
        <PasswordForm />
      </Card>
    </div>
  );
}
