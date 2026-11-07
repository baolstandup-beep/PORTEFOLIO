import { jwtVerify } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'graphia_session';

/**
 * Premier filtre : sans jeton de session valide, aucune page ou API d'administration n'est servie.
 * Chaque page et route revérifie ensuite le compte en base (rôle, session révoquée).
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login' || pathname === '/api/admin/login') return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  let valid = false;
  if (token && process.env.SESSION_SECRET) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET), { algorithms: ['HS256'] });
      valid = true;
    } catch {
      valid = false;
    }
  }
  if (valid) return NextResponse.next();
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
