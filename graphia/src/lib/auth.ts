import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { query } from './db';
import { sessionSecret } from './env';

export const SESSION_COOKIE = 'graphia_session';
const SESSION_HOURS = 8;

export type Role = 'superadmin' | 'admin' | 'evaluateur';
export type Admin = { id: string; name: string; email: string; role: Role };

export type Permission = 'view' | 'score' | 'status' | 'edit' | 'notify' | 'export' | 'delete';
const PERMISSIONS: Record<Role, Permission[]> = {
  superadmin: ['view', 'score', 'status', 'edit', 'notify', 'export', 'delete'],
  admin: ['view', 'score', 'status', 'edit', 'notify', 'export', 'delete'],
  evaluateur: ['view', 'score'],
};
export const can = (admin: Pick<Admin, 'role'>, p: Permission) => PERMISSIONS[admin.role]?.includes(p) ?? false;

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Super administrateur',
  admin: 'Administrateur',
  evaluateur: 'Évaluateur',
};

export async function createSession(adminId: string, sessionVersion: number) {
  const token = await new SignJWT({ sv: sessionVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(sessionSecret());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Vérifie le jeton ET l'existence du compte en base (un compte supprimé ou réinitialisé perd l'accès). */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ['HS256'] });
    if (!payload.sub) return null;
    const { rows } = await query<Admin & { session_version: number }>(
      'SELECT id, name, email, role, session_version FROM administrators WHERE id = $1',
      [payload.sub],
    );
    const a = rows[0];
    if (!a || a.session_version !== payload.sv) return null;
    return { id: a.id, name: a.name, email: a.email, role: a.role };
  } catch {
    return null;
  }
});

/** Pour les pages : redirige vers la connexion. */
export async function requireAdminPage(permission: Permission = 'view'): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  if (!can(admin, permission)) redirect('/admin?refus=1');
  return admin;
}

/** Pour les routes d'API : renvoie null si non autorisé. */
export async function adminFor(permission: Permission): Promise<Admin | null> {
  const admin = await getAdmin();
  return admin && can(admin, permission) ? admin : null;
}
