'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { formValues, type ActionState } from '@/lib/actionState';
import { createUserSchema, fieldErrors } from '@/lib/validation/auth';
import {
  assignableRoles,
  canManageUser,
  ROLE_LABEL,
  type Role,
  type SessionUser,
} from '@/constants/roles';
import { adminUserPath, PATHS, tokenPath } from '@/routes/paths';
import { requireAdmin } from '@/server/auth/dal';
import { issueEmailToken } from '@/server/auth/emailTokens';
import { deleteAllSessionsFor } from '@/server/auth/session';
import { appUrl, sendMail } from '@/server/mail/mailer';
import { inviteMail, resetPasswordMail, verifyEmailMail } from '@/server/mail/templates';
import {
  createUser,
  deleteUser,
  findUserById,
  isUniqueViolation,
  updateUser,
  type UserRow,
} from '@/server/repositories/users';

/**
 * Admin Server Actions. Admins never see or set passwords: new accounts get an invite link and
 * "reset password" emails the user a reset link.
 */

const article = (role: Role) => (role === 'admin' ? 'an admin' : 'a learner');

async function sendInvite(user: UserRow, inviter: SessionUser) {
  const token = await issueEmailToken(user.id, 'invite');
  await sendMail(
    user.email,
    inviteMail(
      user.name,
      inviter.name,
      article(user.role),
      appUrl(tokenPath(PATHS.acceptInvite, token))
    )
  );
}

/** Loads the target and checks that the signed-in admin may manage it. */
async function authorizeTarget(userId: string) {
  const actor = await requireAdmin();
  const target = await findUserById(userId);
  if (!target) return { error: 'User not found.' } as const;
  if (!canManageUser(actor, target))
    return { error: 'You are not allowed to manage this user.' } as const;
  return { actor, target } as const;
}

const refresh = (userId?: string) => {
  revalidatePath(PATHS.adminUsers);
  if (userId) revalidatePath(adminUserPath(userId));
};

export async function createUserAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const actor = await requireAdmin();
  const values = formValues(form, ['name', 'email', 'role']);
  const parsed = createUserSchema.safeParse({
    name: form.get('name'),
    email: form.get('email'),
    role: form.get('role') || 'learner',
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  if (!assignableRoles(actor.role).includes(parsed.data.role)) {
    return { errors: { role: 'You cannot create users with this role' }, values };
  }

  let user: UserRow;
  try {
    user = await createUser({ ...parsed.data, status: 'pending', createdBy: actor.id });
  } catch (err) {
    if (isUniqueViolation(err))
      return { errors: { email: 'A user with this email already exists' }, values };
    throw err;
  }
  await sendInvite(user, actor);
  refresh();
  redirect(adminUserPath(user.id));
}

export async function setUserStatusAction(
  userId: string,
  status: 'active' | 'inactive'
): Promise<ActionState> {
  const auth = await authorizeTarget(userId);
  if ('error' in auth) return { errors: { form: auth.error } };
  if (status === 'active' && !auth.target.password_hash) {
    return {
      errors: { form: 'This user has not accepted the invitation yet. Resend it instead.' },
    };
  }

  await updateUser(userId, { status });
  // A deactivated user is signed out immediately.
  if (status === 'inactive') await deleteAllSessionsFor(userId);
  refresh(userId);
  return {
    ok: true,
    message: status === 'active' ? 'User activated.' : 'User deactivated and signed out.',
  };
}

export async function changeRoleAction(userId: string, role: Role): Promise<ActionState> {
  const auth = await authorizeTarget(userId);
  if ('error' in auth) return { errors: { form: auth.error } };
  if (!assignableRoles(auth.actor.role).includes(role)) {
    return { errors: { form: 'You cannot assign this role.' } };
  }
  await updateUser(userId, { role });
  refresh(userId);
  return { ok: true, message: `Role changed to ${ROLE_LABEL[role]}.` };
}

/**
 * Emails the user whatever link gets them in: an invite (never set a password), a confirmation
 * (registered but unconfirmed) or a password reset (active account).
 */
export async function sendAccessEmailAction(userId: string): Promise<ActionState> {
  const auth = await authorizeTarget(userId);
  if ('error' in auth) return { errors: { form: auth.error } };
  const { actor, target } = auth;

  if (target.status === 'inactive') return { errors: { form: 'Activate the user first.' } };
  if (!target.password_hash) {
    await sendInvite(target, actor);
    return { ok: true, message: `Invitation sent to ${target.email}.` };
  }
  if (target.status === 'pending') {
    const token = await issueEmailToken(target.id, 'verify_email');
    await sendMail(
      target.email,
      verifyEmailMail(target.name, appUrl(tokenPath(PATHS.verifyEmail, token)))
    );
    return { ok: true, message: `Confirmation email sent to ${target.email}.` };
  }
  const token = await issueEmailToken(target.id, 'reset_password');
  await sendMail(
    target.email,
    resetPasswordMail(target.name, appUrl(tokenPath(PATHS.resetPassword, token)))
  );
  return { ok: true, message: `Password reset link sent to ${target.email}.` };
}

export async function deleteUserAction(userId: string): Promise<ActionState> {
  const auth = await authorizeTarget(userId);
  if ('error' in auth) return { errors: { form: auth.error } };
  await deleteUser(userId);
  refresh();
  redirect(PATHS.adminUsers);
}
