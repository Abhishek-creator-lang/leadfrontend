import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Typography } from '@mui/material';
import { AuthCard } from '@/components/auth/AuthCard';
import { PATHS, safeNextPath } from '@/routes/paths';
import { getCurrentUser } from '@/server/auth/dal';
import { firstParam, type SearchParamsProps } from '@/types/next';
import { LoginForm } from '@/views/auth/LoginForm';
import { TextLink } from '@/components/links';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage({ searchParams }: SearchParamsProps) {
  const next = firstParam((await searchParams).next);
  if (await getCurrentUser()) redirect(safeNextPath(next));
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to sync your progress across devices."
      footer={
        <Typography variant="body2">
          New here? <TextLink href={PATHS.register}>Create an account</TextLink>
        </Typography>
      }
    >
      <LoginForm next={next ? safeNextPath(next) : undefined} />
    </AuthCard>
  );
}
