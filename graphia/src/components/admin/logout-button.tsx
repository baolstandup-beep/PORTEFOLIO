'use client';

import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
        window.location.assign('/admin/login');
      }}
      className="inline-flex h-9 items-center gap-2 rounded-full bg-white/10 px-3.5 text-sm font-semibold hover:bg-white/20"
    >
      <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
    </button>
  );
}
