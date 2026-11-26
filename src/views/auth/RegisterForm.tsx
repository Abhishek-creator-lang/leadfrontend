'use client';

import { useActionState, useEffect } from 'react';
import { track } from '@/lib/analytics';
import { Stack } from '@mui/material';
import { registerAction } from '@/app/(auth)/actions';
import {
  FormAlert,
  FormField,
  PasswordField,
  SubmitButton,
  TermsCheckbox,
} from '@/components/auth/FormParts';
import { initialActionState } from '@/lib/actionState';
import { PASSWORD_MIN_LENGTH } from '@/lib/validation/auth';

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, initialActionState);
  useEffect(() => {
    if (state.ok) track('register');
  }, [state.ok]);
  if (state.ok) return <FormAlert state={state} />;
  return (
    <form action={action} noValidate>
      <Stack spacing={2}>
        <FormAlert state={state} />
        <FormField
          name="name"
          state={state}
          label="Full name"
          autoComplete="name"
          autoFocus
          required
        />
        <FormField
          name="email"
          state={state}
          label="Email"
          type="email"
          autoComplete="email"
          required
        />
        <PasswordField
          name="password"
          state={state}
          label="Password"
          autoComplete="new-password"
          helperText={`At least ${PASSWORD_MIN_LENGTH} characters`}
          required
        />
        <PasswordField
          name="confirmPassword"
          state={state}
          label="Confirm password"
          autoComplete="new-password"
          required
        />
        <TermsCheckbox state={state} />
        <SubmitButton>Create account</SubmitButton>
      </Stack>
    </form>
  );
}
