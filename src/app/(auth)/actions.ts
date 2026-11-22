'use server';

import { redirect } from 'next/navigation';
import { formValues, type ActionState } from '@/lib/actionState';
import {
  acceptInviteSchema,
  emailOnlySchema,
  fieldErrors,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/lib/validation/auth';
import { isAdminRole } from '@/constants/roles';
import { PATHS, safeNextPath, tokenPath } from '@/routes/paths';
import { hashPassword, verifyPassword } from '@/server/crypto';
import { consumeEmailToken, issueEmailToken } from '@/server/auth/emailTokens';
import { rateLimit } from '@/server/auth/rateLimit';
import { createSession, deleteAllSessionsFor, deleteCurrentSession } from '@/server/auth/session';
import { appUrl, sendMail } from '@/server/mail/mailer';
import { resetPasswordMail, verifyEmailMail } from '@/server/mail/templates';
import {
  activateUser,
  createUser,
  findUserByEmail,
  findUserById,
  isUniqueViolation,
  updateUser,
  type UserRow,
} from '@/server/repositories/users';

const TOO_MANY = 'Too many attempts. Please wait a few minutes and try again.';
const CHECK_INBOX = 'If the address can receive mail, a link is on its way. Check your inbox.';

/** Burned on unknown emails so login takes the same time whether or not the account exists. */
const DUMMY_HASH = hashPassword('timing-equaliser');

async function sendVerification(user: Pick<UserRow, 'id' | 'name' | 'email'>) {
  const token = await issueEmailToken(user.id, 'verify_email');
  await sendMail(
    user.email,
    verifyEmailMail(user.name, appUrl(tokenPath(PATHS.verifyEmail, token)))
  );
}

async function sendPasswordReset(user: Pick<UserRow, 'id' | 'name' | 'email'>) {
  const token = await issueEmailToken(user.id, 'reset_password');
  await sendMail(
    user.email,
    resetPasswordMail(user.name, appUrl(tokenPath(PATHS.resetPassword, token)))
  );
}

export async function loginAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form, ['email']);
  const parsed = loginSchema.safeParse({
    email: form.get('email'),
    password: form.get('password'),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { email, password } = parsed.data;
  if (!(await rateLimit('login', email)).ok) return { errors: { form: TOO_MANY }, values };

  const user = await findUserByEmail(email);
  const valid = await verifyPassword(password, user?.password_hash ?? (await DUMMY_HASH));
  if (!user || !valid) return { errors: { form: 'Incorrect email or password.' }, values };
  if (user.status === 'pending') {
    return {
      errors: { form: 'Confirm your email address before signing in.' },
      unverifiedEmail: user.email,
      values,
    };
  }
  if (user.status === 'inactive') {
    return {
      errors: { form: 'This account has been deactivated. Contact an administrator.' },
      values,
    };
  }

  await createSession(user.id);
  redirect(safeNextPath(form.get('next'), isAdminRole(user.role) ? PATHS.admin : PATHS.dashboard));
}

export async function registerAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form, ['name', 'email']);
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const { name, email, password } = parsed.data;
  if (!(await rateLimit('register', email, 5)).ok) return { errors: { form: TOO_MANY }, values };

  try {
    const user = await createUser({
      name,
      email,
      role: 'learner',
      status: 'pending',
      passwordHash: await hashPassword(password),
      termsAccepted: true,
    });
    await sendVerification(user);
  } catch (err) {
    if (!isUniqueViolation(err)) throw err;
    // Already registered: re-send the confirmation if still pending, but answer the same way
    // either way so the form can't be used to discover who has an account.
    const existing = await findUserByEmail(email);
    if (existing?.status === 'pending') await sendVerification(existing);
  }
  return { ok: true, message: `Almost there! We sent a confirmation link to ${email}.` };
}

export async function resendVerificationAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  const parsed = emailOnlySchema.safeParse({ email: form.get('email') });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  if (!(await rateLimit('resend-verification', parsed.data.email, 3)).ok)
    return { errors: { form: TOO_MANY } };

  const user = await findUserByEmail(parsed.data.email);
  if (user?.status === 'pending' && user.password_hash) await sendVerification(user);
  return { ok: true, message: CHECK_INBOX };
}

/** Confirms the address from the emailed link, then signs the user in. */
export async function verifyEmailAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const userId = await consumeEmailToken(String(form.get('token') ?? ''), 'verify_email');
  if (!userId)
    return { errors: { form: 'This link is invalid or has expired. Request a new one.' } };
  await activateUser(userId);
  await createSession(userId);
  redirect(PATHS.dashboard);
}

export async function forgotPasswordAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  const values = formValues(form, ['email']);
  const parsed = emailOnlySchema.safeParse({ email: form.get('email') });
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };
  if (!(await rateLimit('forgot-password', parsed.data.email, 3)).ok)
    return { errors: { form: TOO_MANY }, values };

  const user = await findUserByEmail(parsed.data.email);
  if (user?.status === 'active') await sendPasswordReset(user);
  else if (user?.status === 'pending' && user.password_hash) await sendVerification(user);
  return { ok: true, message: CHECK_INBOX };
}

export async function resetPasswordAction(
  _prev: ActionState,
  form: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const userId = await consumeEmailToken(parsed.data.token, 'reset_password');
  if (!userId)
    return { errors: { form: 'This reset link is invalid or has expired. Request a new one.' } };

  const user = await findUserById(userId);
  if (!user || user.status === 'inactive')
    return { errors: { form: 'This account is not active.' } };

  await updateUser(userId, { password_hash: await hashPassword(parsed.data.password) });
  await deleteAllSessionsFor(userId);
  await createSession(userId);
  redirect(isAdminRole(user.role) ? PATHS.admin : PATHS.dashboard);
}

/** Completes an admin-created account: the invitee sets their name and password. */
export async function acceptInviteAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const values = formValues(form, ['name']);
  const parsed = acceptInviteSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values };

  const userId = await consumeEmailToken(parsed.data.token, 'invite');
  if (!userId)
    return {
      errors: { form: 'This invitation is invalid or has expired. Ask an admin to resend it.' },
    };

  const user = await findUserById(userId);
  if (!user || user.status === 'inactive')
    return { errors: { form: 'This account is not active.' } };

  await activateUser(userId, {
    name: parsed.data.name,
    password_hash: await hashPassword(parsed.data.password),
    termsAccepted: true,
  });
  await createSession(userId);
  redirect(isAdminRole(user.role) ? PATHS.admin : PATHS.dashboard);
}

export async function logoutAction() {
  await deleteCurrentSession();
  redirect(PATHS.dashboard);
}
