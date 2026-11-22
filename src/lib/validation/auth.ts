import { z } from 'zod';
import { ROLES } from '@/constants/roles';

export const PASSWORD_MIN_LENGTH = 8;

const email = z
  .string({ required_error: 'Email is required' })
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .email('Enter a valid email address')
  .max(254);

const name = z.string().trim().min(1, 'Name is required').max(100, 'Name is too long');

/** The "I agree to the Terms and Privacy Policy" checkbox (sent as "on" when ticked). */
const acceptTerms = z.literal('on', {
  errorMap: () => ({ message: 'Please accept the Terms of Use and Privacy Policy to continue' }),
});

const newPassword = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(200, 'Password is too long');

const withConfirmation = <T extends z.ZodRawShape>(shape: T) =>
  z
    .object({ ...shape, password: newPassword, confirmPassword: z.string() })
    .refine((v) => v.password === v.confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = withConfirmation({ name, email, acceptTerms });

export const emailOnlySchema = z.object({ email });

export const resetPasswordSchema = withConfirmation({ token: z.string().min(1) });

export const acceptInviteSchema = withConfirmation({
  token: z.string().min(1),
  name,
  acceptTerms,
});

export const updateProfileSchema = z.object({ name });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const createUserSchema = z.object({
  name,
  email,
  role: z.enum(ROLES).refine((r) => r !== 'super_admin', 'Invalid role'),
});

/** Field errors keyed by input name, as returned to forms. */
export type FieldErrors = Partial<Record<string, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    out[key] ??= issue.message;
  }
  return out;
}
