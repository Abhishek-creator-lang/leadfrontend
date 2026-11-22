import 'server-only';
import { cookies, headers } from 'next/headers';
import type { Role, SessionUser } from '@/constants/roles';
import { db } from '../db';
import { randomToken, sha256 } from '../crypto';
import { isProduction } from '../env';

export const SESSION_COOKIE = 'lf_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

async function requestMeta() {
  const h = await headers();
  return {
    user_agent: h.get('user-agent')?.slice(0, 500) ?? null,
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null,
  };
}

/** Starts a session and sets the cookie. Only callable from Server Actions / Route Handlers. */
export async function createSession(userId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db('sessions').insert({
    user_id: userId,
    token_hash: sha256(token),
    expires_at: expiresAt,
    ...(await requestMeta()),
  });
  await db('users').where({ id: userId }).update({ last_login_at: db.fn.now() });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/** The signed-in, active user for the current request's cookie, or null. */
export async function readSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // No cookie means a guest: skip the database entirely.
  if (!token) return null;
  const row = await db('sessions as s')
    .join('users as u', 'u.id', 's.user_id')
    .where('s.token_hash', sha256(token))
    .where('s.expires_at', '>', db.fn.now())
    .where('u.status', 'active')
    .first<{ id: string; email: string; name: string; role: Role } | undefined>(
      'u.id',
      'u.email',
      'u.name',
      'u.role'
    );
  return row ?? null;
}

/** Ends the current session (logout). */
export async function deleteCurrentSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token)
    await db('sessions')
      .where({ token_hash: sha256(token) })
      .delete();
  store.delete(SESSION_COOKIE);
}

/** Signs a user out everywhere (password reset, deactivation, "log out of all devices"). */
export async function deleteAllSessionsFor(userId: string) {
  await db('sessions').where({ user_id: userId }).delete();
}
