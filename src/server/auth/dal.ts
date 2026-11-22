import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { isAdminRole, type SessionUser } from '@/constants/roles';
import { loginPath, PATHS } from '@/routes/paths';
import { readSessionUser } from './session';

/**
 * Data access layer for authentication. Every server component, server action and route that needs
 * the user goes through here; middleware only does cheap cookie-presence checks.
 */
export const getCurrentUser = cache(readSessionUser);

/** The signed-in user, or a redirect to the login page (returning to `next` afterwards). */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath(next));
  return user;
}

/** The super admin only (platform settings); everyone else gets the "forbidden" page. */
export async function requireSuperAdmin(next: string = PATHS.admin): Promise<SessionUser> {
  const user = await requireUser(next);
  if (user.role !== 'super_admin') redirect(PATHS.forbidden);
  return user;
}

/** An admin or super admin; learners are sent to the "forbidden" page. */
export async function requireAdmin(next: string = PATHS.admin): Promise<SessionUser> {
  const user = await requireUser(next);
  if (!isAdminRole(user.role)) redirect(PATHS.forbidden);
  return user;
}
