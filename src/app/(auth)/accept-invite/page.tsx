import type { Metadata } from 'next';
import { AuthCard } from '@/components/auth/AuthCard';
import { InvalidLink } from '@/components/auth/InvalidLink';
import { PATHS } from '@/routes/paths';
import { peekEmailToken } from '@/server/auth/emailTokens';
import { findUserById } from '@/server/repositories/users';
import { firstParam, type SearchParamsProps } from '@/types/next';
import { SetPasswordForm } from '@/views/auth/SetPasswordForm';

export const metadata: Metadata = { title: 'Accept invitation' };

export default async function AcceptInvitePage({ searchParams }: SearchParamsProps) {
  const token = firstParam((await searchParams).token);
  const userId = await peekEmailToken(token, 'invite');
  const user = userId ? await findUserById(userId) : undefined;
  if (!token || !user) {
    return (
      <InvalidLink
        title="Invitation expired"
        message="This invitation is invalid, expired or has already been used. Ask an administrator to send a new one."
        actionLabel="Go to sign in"
        actionHref={PATHS.login}
      />
    );
  }
  return (
    <AuthCard title="Set up your account" subtitle={`Signing in as ${user.email}`}>
      <SetPasswordForm mode="invite" token={token} defaultName={user.name} />
    </AuthCard>
  );
}
