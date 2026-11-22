import { NextResponse, type NextRequest } from 'next/server';

// Kept in sync with SESSION_COOKIE in src/server/auth/session.ts (middleware can't import server-only code).
const SESSION_COOKIE = 'lf_session';

/**
 * Cheap, optimistic redirect for protected areas based only on whether a session cookie exists.
 * The real checks (valid session, active user, role) run in src/server/auth/dal.ts on every page and
 * action; /login and /register redirect already-signed-in users themselves.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const url = new URL('/login', request.url);
  url.searchParams.set('next', pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
