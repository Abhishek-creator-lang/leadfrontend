import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Typography } from '@mui/material';
import { AuthCard } from '@/components/auth/AuthCard';
import { PATHS } from '@/routes/paths';
import { getCurrentUser } from '@/server/auth/dal';
import { RegisterForm } from '@/views/auth/RegisterForm';
import { TextLink } from '@/components/links';

export const metadata: Metadata = { title: 'Create account' };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect(PATHS.dashboard);
  return (
    <AuthCard
      title="Create your account"
      subtitle="Track progress, notes and code drafts on every device."
      footer={
        <Typography variant="body2">
          Already have an account? <TextLink href={PATHS.login}>Sign in</TextLink>
        </Typography>
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
