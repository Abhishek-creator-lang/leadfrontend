'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, type ActionState } from '@/lib/actionState';
import { changePasswordSchema, fieldErrors, updateProfileSchema } from '@/lib/validation/auth';
import { PATHS } from '@/routes/paths';
import { hashPassword, verifyPassword } from '@/server/crypto';
import { requireUser } from '@/server/auth/dal';
import { rateLimit } from '@/server/auth/rateLimit';
import { createSession, deleteAllSessionsFor } from '@/server/auth/session';
import { findUserById, updateUser } from '@/server/repositories/users';

export async function updateProfileAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  const user = await requireUser(PATHS.account);
  const values = formValues(form, ['name']);
  const parsed = updateProfileSchema.safeParse({ name: form.get('name') });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  await updateUser(user.id, { name: parsed.data.name });
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Profile updated.', values };
}

/** Changes the password and signs out every other device. */
export async function changePasswordAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  const user = await requireUser(PATHS.account);
  const parsed = changePasswordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  if (!(await rateLimit('change-password', user.id, 5)).ok) {
    return { errors: { form: 'Too many attempts. Please wait a few minutes and try again.' } };
  }

  const row = await findUserById(user.id);
  if (!row || !(await verifyPassword(parsed.data.currentPassword, row.password_hash))) {
    return { errors: { currentPassword: 'Current password is incorrect' } };
  }

  await updateUser(user.id, { password_hash: await hashPassword(parsed.data.password) });
  await deleteAllSessionsFor(user.id);
  await createSession(user.id);
  return { ok: true, message: 'Password changed. Other devices have been signed out.' };
}

export async function logoutEverywhereAction() {
  const user = await requireUser(PATHS.account);
  await deleteAllSessionsFor(user.id);
  redirect(PATHS.login);
}
