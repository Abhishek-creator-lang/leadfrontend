'use client';

import { useActionState } from 'react';
import NextLink from 'next/link';
import { Link, Stack, Typography } from '@mui/material';
import { loginAction, resendVerificationAction } from '@/app/(auth)/actions';
import { FormAlert, FormField, PasswordField, SubmitButton } from '@/components/auth/FormParts';
import { initialActionState } from '@/lib/actionState';
import { PATHS } from '@/routes/paths';

function ResendVerification({ email }: { email: string }) {
  const [state, action] = useActionState(resendVerificationAction, initialActionState);
  if (state.ok || state.errors) return <FormAlert state={state} />;
  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      <SubmitButton variant="outlined" size="medium">
        Resend confirmation email
      </SubmitButton>
    </form>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, initialActionState);
  return (
    <Stack spacing={2}>
      <form action={action} noValidate>
        <Stack spacing={2}>
          <FormAlert state={state} />
          {next && <input type="hidden" name="next" value={next} />}
          <FormField
            name="email"
            state={state}
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            required
          />
          <PasswordField
            name="password"
            state={state}
            label="Password"
            autoComplete="current-password"
            required
          />
          <Typography variant="body2" textAlign="right">
            <Link component={NextLink} href={PATHS.forgotPassword}>
              Forgot password?
            </Link>
          </Typography>
          <SubmitButton>Sign in</SubmitButton>
        </Stack>
      </form>
      {state.unverifiedEmail && <ResendVerification email={state.unverifiedEmail} />}
    </Stack>
  );
}
