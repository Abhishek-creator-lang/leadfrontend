import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { InvalidLink } from '@/components/auth/InvalidLink';
import { PATHS } from '@/routes/paths';
import { peekEmailToken } from '@/server/auth/emailTokens';
import { firstParam, type SearchParamsProps } from '@/types/next';
import { VerifyEmailForm } from '@/views/auth/VerifyEmailForm';

export const metadata: Metadata = { title: 'Confirm email' };

export default async function VerifyEmailPage({ searchParams }: SearchParamsProps) {
  const token = firstParam((await searchParams).token);
  if (!token || !(await peekEmailToken(token, 'verify_email'))) {
    return (
      <InvalidLink
        title="Confirmation link expired"
        message="This link is invalid, expired or has already been used. Sign in to request a new confirmation email."
        actionLabel="Go to sign in"
        actionHref={PATHS.login}
      />
    );
  }
  return (
    <AuthCard title="Confirm your email" subtitle="One click and your account is ready.">
      <VerifyEmailForm token={token} />
    </AuthCard>
  );
}
