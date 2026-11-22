import type { Metadata } from 'next';
import { Typography } from '@mui/material';
import { AuthCard } from '@/components/auth/AuthCard';
import { PATHS } from '@/routes/paths';
import { ForgotPasswordForm } from '@/views/auth/ForgotPasswordForm';
import { TextLink } from '@/components/links';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a link to choose a new one."
      footer={
        <Typography variant="body2">
          <TextLink href={PATHS.login}>Back to sign in</TextLink>
        </Typography>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
