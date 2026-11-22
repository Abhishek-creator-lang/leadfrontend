import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { InvalidLink } from '@/components/auth/InvalidLink';
import { PATHS } from '@/routes/paths';
import { peekEmailToken } from '@/server/auth/emailTokens';
import { firstParam, type SearchParamsProps } from '@/types/next';
import { SetPasswordForm } from '@/views/auth/SetPasswordForm';

export const metadata: Metadata = { title: 'Reset password' };

export default async function ResetPasswordPage({ searchParams }: SearchParamsProps) {
  const token = firstParam((await searchParams).token);
  if (!token || !(await peekEmailToken(token, 'reset_password'))) {
    return (
      <InvalidLink
        title="Reset link expired"
        message="This password reset link is invalid, expired or has already been used."
        actionLabel="Request a new link"
        actionHref={PATHS.forgotPassword}
      />
    );
  }
  return (
    <AuthCard title="Choose a new password" subtitle="You will be signed out on all other devices.">
      <SetPasswordForm mode="reset" token={token} />
    </AuthCard>
  );
}
